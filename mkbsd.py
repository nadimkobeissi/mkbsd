import argparse
import multiprocessing as mp
import os
import re
import zipfile
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import unquote

import imagehash
import requests
from PIL import Image


# python mkbsd.py [--zip] [--zip-name CUSTOM_NAME] [--remove-duplicates]


def fetch_json_data(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(
            f"Failed to fetch JSON data. Status code: {response.status_code}"
        )


def extract_urls(element):
    urls = []
    if isinstance(element, dict):
        for key, value in element.items():
            if key == "url":
                urls.append(value)
            else:
                urls.extend(extract_urls(value))
    elif isinstance(element, list):
        for item in element:
            urls.extend(extract_urls(item))
    return urls


def download_file(url):
    file_name = os.path.basename(unquote(url.split("?")[0]))
    file_name = clean_filename(file_name)
    file_path = os.path.join("downloads", file_name)
    if not os.path.exists(file_path):
        print(f"Downloading {url}")
        response = requests.get(url, stream=True)
        with open(file_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
    else:
        print(f"Skipping {url}")
    return file_path


def clean_filename(filename):
    sanitized_name = filename.replace("~", " ")
    sanitized_name = re.sub(r'[<>:"/\\|?*]', "_", sanitized_name)
    sanitized_name = re.sub(r"[\s_]+", " ", sanitized_name).strip()
    return sanitized_name


def zip_directory(path, zip_name):
    with zipfile.ZipFile(zip_name, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(path):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, path)
                zipf.write(file_path, arcname)
    print(f"Created zip file: {zip_name}")


def compute_hash(filepath):
    try:
        with Image.open(filepath) as img:
            return imagehash.phash(img, hash_size=8), filepath
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return None


def find_duplicate_images(directory, threshold=2):
    image_files = [
        os.path.join(directory, f)
        for f in os.listdir(directory)
        if f.lower().endswith((".jpg", ".jpeg", ".png"))
    ]

    image_files.sort(key=os.path.getsize)

    with mp.Pool(mp.cpu_count()) as pool:
        results = pool.map(compute_hash, image_files)

    hash_groups = defaultdict(list)
    for result in filter(None, results):
        hash_value, filepath = result
        hash_groups[hash_value].append(filepath)

    duplicates = []
    for hash_value, filepaths in hash_groups.items():
        if len(filepaths) > 1:
            for i in range(len(filepaths)):
                for j in range(i + 1, len(filepaths)):
                    duplicates.append((filepaths[i], filepaths[j]))

    return duplicates


def remove_duplicates(duplicates):
    for image1, image2 in duplicates:
        try:
            if os.path.getsize(image1) < os.path.getsize(image2):
                os.remove(image1)
                print(f"Removed duplicate: {image1}")
            else:
                os.remove(image2)
                print(f"Removed duplicate: {image2}")
        except Exception as e:
            print(f"Error removing duplicate: {e}")


def main():
    parser = argparse.ArgumentParser(
        description="Download images from JSON data and remove duplicates."
    )
    parser.add_argument(
        "--zip", action="store_true", help="Create a zip file of the downloaded images"
    )
    parser.add_argument(
        "--zip-name",
        type=str,
        help="Custom name for the zip file (default: downloads.zip)",
    )
    parser.add_argument(
        "--remove-duplicates",
        action="store_true",
        help="Remove duplicate images after download",
    )
    args = parser.parse_args()

    json_url = "https://storage.googleapis.com/panels-cdn/data/20240730/all.json"
    try:
        json_data = fetch_json_data(json_url)
    except Exception as e:
        print(f"Error: {e}")
        return

    urls = extract_urls(json_data)
    print(f"Found {len(urls)} URLs")

    if not os.path.exists("downloads"):
        os.makedirs("downloads")

    with ThreadPoolExecutor(max_workers=10) as executor:
        executor.map(download_file, urls)

    if args.remove_duplicates:
        print("Searching for duplicate images...")
        duplicates = find_duplicate_images("downloads")
        if duplicates:
            print(f"Found {len(duplicates)} pairs of duplicate images.")
            remove_duplicates(duplicates)
        else:
            print("No duplicate images found.")

    if args.zip:
        zip_name = args.zip_name if args.zip_name else "downloads.zip"
        if not zip_name.endswith(".zip"):
            zip_name += ".zip"
        zip_directory("downloads", zip_name)


if __name__ == "__main__":
    main()
