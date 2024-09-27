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

                // Extrahiere den Künstlernamen vor dem Unterstrich
                const artistNameMatch = imageUrl.match(/a~([^_/]+)/);
                const artistName = artistNameMatch ? artistNameMatch[1] : 'unknown_artist';
                const artistDir = path.join(__dirname, 'downloads', artistName);

                if (!fs.existsSync(artistDir)) {
                    fs.mkdirSync(artistDir, { recursive: true });
                    console.info(`📁 Created directory: ${artistDir}`);
                }

                // Extrahiere den Dateinamen und die Endung
                const urlPath = new URL(imageUrl).pathname;
                const fileName = path.basename(urlPath); // Name inklusive Endung (z.B. .jpg oder .png)
                const filePath = path.join(artistDir, fileName);

                await downloadImage(imageUrl, filePath);
                console.info(`🖼️ Saved image to ${filePath}`);
                await delay(250); // Wartezeit zwischen Downloads
            }
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

async function downloadImage(url, filePath) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.promises.writeFile(filePath, buffer);
}

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

(() => {
    asciiArt();
    setTimeout(main, 5000);
})();
