import requests
import os
import json
from concurrent.futures import ThreadPoolExecutor

# URL of the JSON data
all_url = "https://storage.googleapis.com/panels-cdn/data/20240730/all.json"

# Function to download the URL
def download_url(url):
    file_name = os.path.basename(url)
    file_path = os.path.join("downloads", file_name)

    if not os.path.exists(file_path):
        print(f"Downloading {url}")
        response = requests.get(url)
        with open(file_path, 'wb') as file:
            file.write(response.content)
    else:
        print(f"Skipping {url}")

# Recursive function to extract URLs from JSON structure
def extract_urls(element, urls):
    if isinstance(element, dict):
        for key, value in element.items():
            if key == "url":
                urls.append(value)
            else:
                extract_urls(value, urls)
    elif isinstance(element, list):
        for item in element:
            extract_urls(item, urls)

# Main function to process the JSON and download files
def main():
    # Fetch the JSON data
    response = requests.get(all_url)
    json_data = response.json()

    # Extract URLs
    urls = []
    extract_urls(json_data, urls)
    print(f"Found {len(urls)} URLs")

    # Ensure 'downloads' directory exists
    if not os.path.exists("downloads"):
        os.makedirs("downloads")

    # Download files with parallelism (max 10 threads)
    with ThreadPoolExecutor(max_workers=10) as executor:
        executor.map(download_url, urls)

def ascii_art():
    print("""
 /$$      /$$ /$$   /$$ /$$$$$$$   /$$$$$$  /$$$$$$$
| $$$    /$$$| $$  /$$/| $$__  $$ /$$__  $$| $$__  $$
| $$$$  /$$$$| $$ /$$/ | $$  \\ $$| $$  \\__/| $$  \\ $$
| $$ $$/$$ $$| $$$$$/  | $$$$$$$ |  $$$$$$ | $$  | $$
| $$  $$$| $$| $$  $$  | $$__  $$ \\____  $$| $$  | $$
| $$\\  $ | $$| $$\\  $$ | $$  \\ $$ /$$  \\ $$| $$  | $$
| $$ \\/  | $$| $$ \\  $$| $$$$$$$/|  $$$$$$/| $$$$$$$/
|__/     |__/|__/  \\__/|_______/  \\______/ |_______/""")
    print("")
    print("🤑 Starting downloads from your favorite sellout grifter's wallpaper app...")

if __name__ == "__main__":
    ascii_art()
    time.sleep(5)
    main()
