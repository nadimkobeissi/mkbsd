import os
import time
import aiohttp
import asyncio
import json
from urllib.parse import urlparse

# Load the local JSON file
json_file_path = 'images.json'

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
        # Load JSON data from the local file
        with open(json_file_path, 'r') as json_file:
            json_data = json.load(json_file)

        data = json_data.get('data')
        
        if not data:
            raise Exception('⛔ JSON does not have a "data" property at its root.')

        async with aiohttp.ClientSession() as session:
            for key, subproperty in data.items():
                if subproperty and subproperty.get('dhd'):
                    image_url = subproperty['dhd']
                    print(f"🔍 Found image URL!")
                    
                    # Extract artist name from the URL
                    artist_name = image_url.split('a~')[1].split('_')[0]
                    artist_dir = os.path.join(os.getcwd(), 'downloads', artist_name)

                    if not os.path.exists(artist_dir):
                        os.makedirs(artist_dir)
                        print(f"📁 Created directory: {artist_dir}")

                    # Extract filename from the URL
                    filename = os.path.basename(urlparse(image_url).path)  # Name including extension
                    file_path = os.path.join(artist_dir, filename)

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