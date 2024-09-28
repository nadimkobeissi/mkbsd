// Copyright 2024 Nadim Kobeissi
// Licensed under the WTFPL License

const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function main(replaceExisting) {
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
                await downloadImage(imageUrl, filePath, replaceExisting);
                console.info(`🖼️ Saved image to ${filePath}`);
                fileIndex++;
                await delay(250);
            }
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

async function downloadImage(url, filePath, replaceExisting) {
    if (!replaceExisting && fs.existsSync(filePath)) {
        console.info(`⚠️ File ${filePath} already exists. Skipping download.`);
        return;
    }
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
    console.info(``);
    console.info(`🤑 Starting downloads from your favorite sellout grifter's wallpaper app...`);
}

function promptUser() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question("Files already exist in the 'downloads' directory.\n1. Skip existing files and download new ones.\n2. Replace existing files and download all.\nEnter your choice (1 or 2): ", (answer) => {
            rl.close();
            resolve(answer === '2');
        });
    });
}

(async () => {
    asciiArt();
    await new Promise(resolve => setTimeout(resolve, 5000));

    const downloadDir = path.join(__dirname, 'downloads');
    let replaceExisting = true;
    if (fs.existsSync(downloadDir) && fs.readdirSync(downloadDir).length > 0) {
        replaceExisting = await promptUser();
    }

    await main(replaceExisting);
})();
