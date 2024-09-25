# Licensed under the WTFPL License

import os
import time
import aiohttp
import asyncio
from tqdm import tqdm
from urllib.parse import urlparse

url = 'https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s'

async def delay(ms):
    await asyncio.sleep(ms / 1000)

async def download_image(session, image_url, file_path, error_log):
    try:
        async with session.get(image_url) as response:
            if response.status != 200:
                raise Exception(f"Error code: {response.status}")
            content = await response.read()
            with open(file_path, 'wb') as f:
                f.write(content)
    except Exception as e:
        error_log.append(f"Error downloading image {image_url}[{str(e)}]")

async def main():
    error_log = []

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

                file_index = 1
                total_images = len([key for key, subproperty in data.items() if subproperty.get('dhd')])

                # initialize progress bar with the total number of images
                with tqdm(total=total_images, desc="Downloading", unit="image", colour="red") as pbar:
                    for key, subproperty in data.items(): 
                        if subproperty and subproperty.get('dhd'):
                            image_url = subproperty['dhd']
                            parsed_url = urlparse(image_url)
                            ext = os.path.splitext(parsed_url.path)[-1] or '.jpg'
                            filename = f"{file_index}{ext}"
                            file_path = os.path.join(download_dir, filename)
                            await download_image(session, image_url, file_path, error_log)

                            pbar.update(1)
                            file_index += 1

                            await delay(250)

    except Exception as e:
        print(f"Error: {str(e)}")

    # After all downloads, report any errors that occurred
    if error_log:
        print("\n⚠️ The following errors occurred during downloads:")
        for error in error_log:
            print(error)
    else:
        print("\n✅ All images downloaded successfully!")

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
