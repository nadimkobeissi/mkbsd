const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

async function main() {
	const url = 'https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s';
	const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
	const downloadedListPath = path.join(__dirname, 'downloadedList.json');
	let downloadedList = [];

	// Load existing downloaded list if it exists
	if (fs.existsSync(downloadedListPath)) {
		const downloadedData = await fs.promises.readFile(downloadedListPath, 'utf8');
		downloadedList = JSON.parse(downloadedData);
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

		const downloadDir = path.join(__dirname, 'downloads-1');
		if (!fs.existsSync(downloadDir)) {
			fs.mkdirSync(downloadDir);
			console.info(`📁 Created directory: ${downloadDir}`);
		}

		let downloadedCount = 0;
		let skippedCount = 0;

		for (const key in data) {
			const subproperty = data[key];
			if (subproperty && subproperty.dhd) {
				// Use the unique key to track downloads and in the file name
				const imageUrl = subproperty.dhd;
				const imageName = `${extractNameFromUrl(imageUrl)}-${key}`;
				const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
				const filePath = path.join(downloadDir, `${imageName}${ext}`);

				// Check if the file already exists
				if (fs.existsSync(filePath)) {
					// If the file exists but the key is missing in the JSON, add it to avoid re-downloading
					if (!downloadedList.includes(key)) {
						downloadedList.push(key);
						console.info(`✅ Found existing file, added key to list: ${filePath}`);
						await fs.promises.writeFile(downloadedListPath, JSON.stringify(downloadedList, null, 2));
					}
					skippedCount++;
				} else {
					// Download the image only if it doesn't exist
					downloadedCount++;
					console.info(`🔍 Found new image URL: ${imageUrl}`);

					// Download the image
					await downloadImage(imageUrl, filePath);
					console.info(`🖼️ Saved image to ${filePath}`);

					// Add the unique key to the downloaded list
					downloadedList.push(key);

					// Save the updated downloaded list to JSON file
					await fs.promises.writeFile(downloadedListPath, JSON.stringify(downloadedList, null, 2));
					console.info(`📄 Updated downloaded list with key: ${key}`);

					// Delay for the next download
					await delay(250);
				}
			}
		}

		console.log(`🚀 🚀 🚀 Downloaded ${downloadedCount} new images`);
		console.info(`✅ Skipped ${skippedCount} images that already exist`);

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

function extractNameFromUrl(url) {
	try {
		const urlParts = new URL(url).pathname.split('/');
		const nameWithExtension = urlParts[urlParts.length - 1]; // Get the last part of the URL

		// Remove the query string from the name (everything after the '?' symbol)
		const nameWithoutQuery = nameWithExtension.split('?')[0];

		// Get the prefix part (e.g., 'hytha', 'outrunyouth', etc.)
		const prefixPart = urlParts.find(part => part.startsWith('a~'));
		const prefix = prefixPart ? prefixPart.split('~')[1].split('_')[0].toLowerCase() : 'unknown'; // Clean up the prefix
		// Simplify the base name by removing everything after the first tilde (~)
		const baseName = nameWithoutQuery.split('.')[0].split('~')[0].replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();

		return `${prefix}-${baseName}`; // Return cleaned prefix and simplified base name
	} catch (error) {
		console.error(`Error extracting name from URL: ${error.message}, ${url}`);

		// Fallback to deterministic name using hash if extraction fails
		const hash = crypto.createHash('md5').update(url).digest('hex');
		return `image-${hash}`;
	}
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
