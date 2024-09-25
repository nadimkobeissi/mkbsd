# Licensed under the WTFPL License

import os
import time
import aiohttp
import asyncio
from urllib.parse import urlparse
import logging


# Constants
URL = 'https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s'
DOWNLOAD_DIR = os.path.join(os.getcwd(), 'downloads')
DELAY_MS = 250

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


async def delay(ms: int) -> None:
    """Delay the execution for the specified milliseconds."""
    await asyncio.sleep(ms / 1000)


def create_download_dir(directory: str) -> None:
    """Create the download directory if it doesn't exist."""
    if not os.path.exists(directory):
        try:
            os.makedirs(directory)
            logging.info(f"📁 Created directory: {directory}")
        except OSError as e:
            logging.error(f"Failed to create directory {directory}: {e}")
            raise


def get_file_extension(url: str) -> str:
    """Extract the file extension from the URL."""
    parsed_url = urlparse(url)
    ext = os.path.splitext(parsed_url.path)[-1]
    return ext or '.jpg'  # Default to .jpg if no extension found


async def download_image(session: aiohttp.ClientSession, image_url: str, file_path: str) -> None:
    """Download an image from the provided URL and save it to the specified file path."""
    try:
        async with session.get(image_url) as response:
            if response.status != 200:
                raise Exception(f"Failed to download image: {response.status}")
            content = await response.read()
            with open(file_path, 'wb') as f:
                f.write(content)
            logging.info(f"🖼️ Image saved to {file_path}")
    except Exception as e:
        logging.error(f"Error downloading image from {image_url}: {e}")


async def main() -> None:
    """Main function that fetches JSON data and downloads images based on URLs."""
    create_download_dir(DOWNLOAD_DIR)

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(URL) as response:
                if response.status != 200:
                    raise Exception(f"⛔ Failed to fetch JSON file: {response.status}")

                json_data = await response.json()
                data = json_data.get('data')

                if not data:
                    raise Exception('⛔ JSON does not have a "data" property at its root.')

                file_index = 1
                for key, subproperty in data.items():
                    if subproperty and subproperty.get('dhd'):
                        image_url = subproperty['dhd']
                        logging.info("🔍 Found image URL")

                        file_extension = get_file_extension(image_url)
                        filename = f"{file_index}{file_extension}"
                        file_path = os.path.join(DOWNLOAD_DIR, filename)

                        await download_image(session, image_url, file_path)
                        file_index += 1
                        await delay(DELAY_MS)

                    # for debug purposes
                    # else:
                    #     logging.warning(f"⚠️ No image URL found for key: {key}")

    except Exception as e:
        logging.error(f"Error: {e}")


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
    print("\n🤑 Starting downloads from your favorite sellout grifter's wallpaper app...")


if __name__ == "__main__":
    ascii_art()
    time.sleep(5)
    asyncio.run(main())
