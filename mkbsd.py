# Licensed under the WTFPL License

import os
import json
import time
import aiohttp
import asyncio
from urllib.parse import urlparse, urlsplit
import hashlib

url = 'https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s'
downloaded_list_path = 'downloadedList.json'

async def delay(ms):
    await asyncio.sleep(ms / 1000)

async def download_image(session, image_url, file_path):
    try:
        async with session.get(image_url) as response:
            if response.status != 200:
                raise Exception(f"Failed to download image: {response.status}")
            content = await response.read()
            with open(file_path, 'wb') as f:
                f.write(content)
    except Exception as e:
        print(f"Error downloading image: {str(e)}")

def extract_name_from_url(url):
    try:
        path = urlsplit(url).path
        name_with_extension = os.path.basename(path)
        name_without_query = name_with_extension.split('?')[0]

        # Get prefix (e.g., 'hytha', 'outrunyouth', etc.)
        prefix_part = next((part for part in path.split('/') if part.startswith('a~')), None)
        prefix = prefix_part.split('~')[1].split('_')[0].lower() if prefix_part else 'unknown'

        # Get base name
        base_name = name_without_query.split('.')[0].split('~')[0].replace(r'[^a-zA-Z0-9]+', '').lower()

        return f"{prefix}-{base_name}"
    except Exception as e:
        print(f"Error extracting name from URL: {str(e)}")
        return hashlib.md5(url.encode()).hexdigest()

async def main():
    try:
        # Load existing downloaded list
        if os.path.exists(downloaded_list_path):
            with open(downloaded_list_path, 'r') as f:
                downloaded_list = json.load(f)
        else:
            downloaded_list = []

        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status != 200:
                    raise Exception(f"⛔ Failed to fetch JSON file: {response.status}")
                json_data = await response.json()
                data = json_data.get('data')

                if not data:
                    raise Exception('⛔ JSON does not have a "data" property at its root.')

                download_dir = os.path.join(os.getcwd(), 'downloads')
                if not os.path.exists(download_dir):
                    os.makedirs(download_dir)
                    print(f"📁 Created directory: {download_dir}")

                downloaded_count = 0
                skipped_count = 0

                for key, subproperty in data.items():
                    if subproperty and subproperty.get('dhd'):
                        image_url = subproperty['dhd']
                        image_name = f"{extract_name_from_url(image_url)}-{key}"
                        ext = os.path.splitext(urlparse(image_url).path)[-1] or '.jpg'
                        file_path = os.path.join(download_dir, f"{image_name}{ext}")

                        # Check if file already exists
                        if os.path.exists(file_path):
                            if key not in downloaded_list:
                                downloaded_list.append(key)
                                print(f"✅ Found existing file, added key to list: {file_path}")
                                with open(downloaded_list_path, 'w') as f:
                                    json.dump(downloaded_list, f, indent=2)
                            skipped_count += 1
                        else:
                            # Download the image if it doesn't exist
                            downloaded_count += 1
                            print(f"🔍 Found new image URL: {image_url}")

                            await download_image(session, image_url, file_path)
                            print(f"🖼️ Saved image to {file_path}")

                            # Add key to downloaded list
                            downloaded_list.append(key)
                            with open(downloaded_list_path, 'w') as f:
                                json.dump(downloaded_list, f, indent=2)
                            print(f"📄 Updated downloaded list with key: {key}")

                            await delay(250)

                print(f"🚀 Downloaded {downloaded_count} new images")
                print(f"✅ Skipped {skipped_count} images that already exist")

    except Exception as e:
        print(f"Error: {str(e)}")

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
    asyncio.run(main())
