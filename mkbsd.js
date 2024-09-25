// Copyright 2024 Nadim Kobeissi
// Licensed under the WTFPL License

const fs = require(`fs`);
const path = require(`path`);
const readline = require(`readline`);

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const MAX_IMAGES = 380;
const MIN_AMOUNT_OF_IMAGES = 1;

async function main() {
	// Get user input for the number of pictures and the starting index
	const numPictures = await askForValidNumber('How many pictures would you like to download? (Max: 380) ', MIN_AMOUNT_OF_IMAGES, MAX_IMAGES);
	const startIndex = await askForValidNumber('From which picture (index) would you like to start? ', MIN_AMOUNT_OF_IMAGES, MAX_IMAGES);

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

		let fileIndex = parseInt(startIndex);  // Start from the user-provided index
		let downloadedCount = 0;

		for (const key in data) {
			if (downloadedCount >= parseInt(numPictures)) {
				break; // Stop after downloading the requested number of pictures
			}

			const subproperty = data[key];
			if (subproperty && subproperty.dhd) {
				const imageUrl = subproperty.dhd;
				console.info(`🔍 Found image URL!`);
				await delay(100);
				const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
				const filename = `${fileIndex}${ext}`;
				const filePath = path.join(downloadDir, filename);
				await downloadImage(imageUrl, filePath);
				console.info(`🖼️ Saved image to ${filePath}`);
				fileIndex++;
				downloadedCount++;
				await delay(250);
			}
		}
	} catch (error) {
		console.error(`Error: ${error.message}`);
	}
	rl.close(); // Close the readline interface when done
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
	console.info(``);
	console.info(`🤑 Starting downloads from your favorite sellout grifter's wallpaper app...`);
}

function askQuestion(query) {
	return new Promise(resolve => rl.question(query, resolve));
}

// Function to validate that the input is a valid number within range
async function askForValidNumber(query, minValue = MIN_AMOUNT_OF_IMAGES, maxValue = MAX_IMAGES) {
	let valid = false;
	let value;

	while (!valid) {
		const answer = await askQuestion(query);
		value = parseInt(answer);

		if (!isNaN(value) && value >= minValue && value <= maxValue) {
			valid = true;
		} else {
			console.error(`🚫 Invalid input. Please enter a number between ${minValue} and ${maxValue}.`);
		}
	}

	return value;
}

(() => {
	asciiArt();
	setTimeout(main, 5000);
})();
