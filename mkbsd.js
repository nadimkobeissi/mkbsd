const fs = require('fs');
const path = require('path');

// Function to delay the downloads
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    const jsonFilePath = path.join(__dirname, 'images.json');
    
    // Load local JSON file
    let jsonData;
    try {
        if (!fs.existsSync(jsonFilePath)) {
            throw new Error('⛔ JSON file not found.');
        }

        const jsonFileContent = fs.readFileSync(jsonFilePath, 'utf-8');
        jsonData = JSON.parse(jsonFileContent);
        console.info('📂 JSON file loaded successfully!');
    } catch (error) {
        console.error(`⛔ Failed to load JSON file: ${error.message}`);
        return;
    }

    const data = jsonData.data;
    if (!data) {
        console.error('⛔ JSON does not have a "data" property at its root.');
        return;
    }

    // Loop through each item in the JSON
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
            const fileName = path.basename(urlPath); // Filename including extension (e.g., .jpg or .png)
            const filePath = path.join(artistDir, fileName);

            // Download the image and save it to the specified path
            try {
                await downloadImage(imageUrl, filePath);
                console.info(`🖼️ Saved image to ${filePath}`);
                await delay(250); // Delay between downloads
            } catch (err) {
                console.error(`❌ Error downloading image: ${err.message}`);
            }
        }
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

// Start the program with ASCII art and delay
(() => {
    asciiArt();
    setTimeout(main, 5000);
})();
