# Licensed under the WTFPL License

import os
import time
import aiohttp
import asyncio
from urllib.parse import urlparse

url = 'https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s'
MAX_IMAGES = 380

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

async def main():
    # Get user input for number of pictures and starting index
    num_pictures = await ask_for_valid_number(f'How many pictures would you like to download? (Max: {MAX_IMAGES}) ', 1, MAX_IMAGES)
    start_index = await ask_for_valid_number(f'From which picture (index) would you like to start? ', 1, MAX_IMAGES)

    try:
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

                file_index = start_index
                downloaded_count = 0

                for key, subproperty in data.items():
                    if downloaded_count >= num_pictures:
                        break  # Stop after downloading the requested number of pictures

                    if subproperty and subproperty.get('dhd'):
                        image_url = subproperty['dhd']
                        print(f"🔍 Found image URL!")
                        parsed_url = urlparse(image_url)
                        ext = os.path.splitext(parsed_url.path)[-1] or '.jpg'
                        filename = f"{file_index}{ext}"
                        file_path = os.path.join(download_dir, filename)

                        await download_image(session, image_url, file_path)
                        print(f"🖼️ Saved image to {file_path}")

                        file_index += 1
                        downloaded_count += 1
                        await delay(250)

    except Exception as e:
        print(f"Error: {str(e)}")

async def ask_for_valid_number(prompt, min_value, max_value):
    while True:
        try:
            value = int(input(prompt))
            if min_value <= value <= max_value:
                return value
            else:
                print(f"🚫 Please enter a number between {min_value} and {max_value}.")
        except ValueError:
            print("🚫 Invalid input. Please enter a valid number.")

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
