const fs = require('fs');
const path = require('path');

async function main() {
    const url = 'https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s';
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`⛔ Failed to fetch JSON file: ${response.statusText}`);
        }
        const jsonData = await response.json();
        const data = jsonData.data;
        if (!data) {
            throw new Error('⛔ JSON does not have a "data" property at its root.');
        }

        for (const key in data) {
            const subproperty = data[key];
            if (subproperty && subproperty.dhd) {
                const imageUrl = subproperty.dhd;
                console.info(`🔍 Found image URL!`);

                // Extract the artist name before the underscore
                const artistNameMatch = imageUrl.match(/a~([^_/]+)/);
                const artistName = artistNameMatch ? artistNameMatch[1] : 'unknown_artist';
                const artistDir = path.join(__dirname, 'downloads', artistName);

                // Create artist directory if it doesn't exist
                if (!fs.existsSync(artistDir)) {
                    fs.mkdirSync(artistDir, { recursive: true });
                    console.info(`📁 Created directory: ${artistDir}`);
                }

                // Extract the filename and extension
                const urlPath = new URL(imageUrl).pathname;
                const fileName = path.basename(urlPath); // Filename including extension (e.g. .jpg or .png)
                const filePath = path.join(artistDir, fileName);

                // Download the image and save it to the specified path
                await downloadImage(imageUrl, filePath);
                console.info(`🖼️ Saved image to ${filePath}`);
                await delay(250); // Delay between downloads
            }
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

// Function to download the image from the provided URL
async function downloadImage(url, filePath) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.promises.writeFile(filePath, buffer);
}

// ASCII art function (optional)
function asciiArt() {
    console.info(`
 /$$      /$$ /$$   /$$ /$$$$$$$   /$$$$$$  /$$$$$$$
| $$$    /$$$| $$  /$$/| $$__  $$ /$$__  $$| $$__  $$
| $$$$  /$$$$| $$ /$$/ | $$  \\ $$| $$  \\__/| $$  \\ $$
| $$ $$/$$ $$| $$$$$/  | $$$$$$$ |  $$$$$$ | $$  | $$
| $$  $$$| $$| $$  $$  | $$__  $$ \\____  $$| $$  | $$
| $$\\  $ | $$| $$\\  $$ | $$  \\ $$ /$$  \\ $$| $$  | $$
| $$ \\/  | $$| $$ \\  $$| $$$$$$$/|  $$$$$$/| $$$$$$$/
|__/     |__/|__/  \\__/|_______/  \\______/ |_______/`);
    console.info(`🤑 Starting downloads from your favorite sellout grifter's wallpaper app...`);
}

// Start program with ASCII art and delay
(() => {
    asciiArt();
    setTimeout(main, 5000);
})();
