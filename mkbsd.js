// Copyright 2024 Nadim Kobeissi
// Licensed under the WTFPL License

const fs = require('fs');
const path = require('path');
const https = require('https');

async function main() {
    const url = 'https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s';
    const delay = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
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
        let fileIndex = 1;
        for (const key in data) {
            const subproperty = data[key];
            if (subproperty && subproperty.dhd) {
                const imageUrl = subproperty.dhd;
                console.info(`🔍 Found image URL!`);
                await delay(100);
                const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
                const filename = `${fileIndex}${ext}`;
                const filePath = path.join(downloadDir, filename);

                if (fs.existsSync(filePath)) {
                    console.info(`⏩ Skipping ${filePath} as it already exists.`);
                } else {
                    await downloadImage(imageUrl, filePath);
                    console.info(`🖼️ Saved image to ${filePath}`);
                    fileIndex++;
                    await delay(250);
                }
            }
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

function downloadImage(url, filePath) {
    return new Promise((resolve, reject) => {
        https.get(url, response => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download image: ${response.statusMessage}`));
                return;
            }
            const total = Number(response.headers['content-length']);
            let received = 0;

            const fileStream = fs.createWriteStream(filePath);
            response.pipe(fileStream);

            response.on('data', chunk => {
                received += chunk.length;
                const progress = (received / total) * 100;
                const progressBar = generateProgressBar(progress);
                process.stdout.write(`Downloading ${filePath}: ${progressBar} ${progress.toFixed(2)}%\r`);
            });

            fileStream.on('finish', () => {
                process.stdout.write('\n'); // move to the next line after download completes
                resolve();
            });

            fileStream.on('error', reject);
        }).on('error', reject);
    });
}

function generateProgressBar(progress) {
    const totalBars = 20; // Length of the progress bar
    const filledBars = Math.round((progress / 100) * totalBars);
    const emptyBars = totalBars - filledBars;
    return `[${'='.repeat(filledBars)}${' '.repeat(emptyBars)}]`;
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
    console.info(``);
    console.info(`🤑 Starting downloads from your favorite sellout grifter's wallpaper app...`);
}

(() => {
    asciiArt();
    setTimeout(main, 5000);
})();
