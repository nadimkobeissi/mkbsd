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
        const downloadDir = path.join(__dirname, 'downloads');
        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir);
            console.info(`📁 Created directory: ${downloadDir}`);
        }

        for (const key in data) {
            const subproperty = data[key];
            if (subproperty && subproperty.dhd) {
                const imageUrl = subproperty.dhd;
                console.info(`🔍 Found image URL!`);

                // Extrahiere den Dateinamen aus der URL
                const urlPath = new URL(imageUrl).pathname;
                const fileName = path.basename(urlPath, '.jpg'); // Name ohne '.jpg'
                const filePath = path.join(downloadDir, `${fileName}.jpg`);

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
