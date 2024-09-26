import os
import time
import aiohttp
import asyncio
from urllib.parse import urlparse
from threading import Event

url = 'https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s'

# Global stop event to signal when to stop downloading
stop_event = Event()

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
                for key, subproperty in data.items():
                    if subproperty and subproperty.get('dhd'):
                        if stop_event.is_set():
                            print("⛔ Download stopped!")
                            break
                        image_url = subproperty['dhd']
                        print(f"🔍 Found image URL!")
                        parsed_url = urlparse(image_url)
                        ext = os.path.splitext(parsed_url.path)[-1] or '.jpg'
                        filename = f"{file_index}{ext}"
                        file_path = os.path.join(download_dir, filename)

                        await download_image(session, image_url, file_path)
                        print(f"🖼️ Saved image to {file_path}")

                        file_index += 1
                        await delay(250)

    except Exception as e:
        print(f"Error: {str(e)}")

def start_download():
    global stop_event
    stop_event.clear()  # Clear the stop event before starting
    print("🚀 Starting download process!")
    asyncio.run(main())

def stop_download():
    global stop_event
    stop_event.set()  # Set the stop event to signal the process to stop
    print("🛑 Stopping download process!")

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
    print("🤑 Ready to download from your favorite sellout grifter's wallpaper app...")

if __name__ == "__main__":
    ascii_art()
    time.sleep(2)

    user_input = input("Press 's' to start downloading, or 'q' to quit: ").lower()
    
    while user_input != 'q':
        if user_input == 's':
            start_download()
        user_input = input("Press 's' to start downloading again or 'q' to quit. Press 'x' to stop the download: ").lower()
        if user_input == 'x':
            stop_download()

    print("👋 Exiting the program.")
