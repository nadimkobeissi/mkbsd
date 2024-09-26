# Licensed under the WTFPL License

import os
import time
import aiohttp
import re
import asyncio
from urllib.parse import urlparse
url = 'https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s'

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
    try:
        async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(verify_ssl=False)) as session: # Ignore SSL errors
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

                # file_index = 1 #Not used
                for key, subproperty in data.items():
                    if subproperty and subproperty.get('dhd'):
                        image_url = subproperty['dhd']
                        match = re.search(r'/content/([^/]+)/', image_url) # Extract artist name from URL
                        if match:
                            artist_name = match.group(1)
                            sanitized_artist_name = artist_name.split('_')[0].split('~')[1]
                            print(f"🎨 Sanitized artist name: {sanitized_artist_name}")
                            artist_dir = os.path.join(download_dir, sanitized_artist_name)
                            if not os.path.exists(artist_dir):
                                os.makedirs(artist_dir)
                                print(f"📁 Created artist directory: {artist_dir}")

                        file_name_match = re.search(r'/([^/]+)\.(jpg|png)', image_url) # Extract file name from URL
                        if file_name_match:
                            raw_file_name = file_name_match.group(1)
                            sanitized_file_name = re.sub(r'[^a-zA-Z0-9 ]', '', raw_file_name).replace('~', ' ')
                            file_path = os.path.join(artist_dir, f"{sanitized_file_name}.jpg")

                            await download_image(session, image_url, file_path)
                            print(f"🖼️ Saved image to {file_path}")

                            await delay(250)

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
