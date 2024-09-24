// Copyright 2024 Nadim Kobeissi
// Licensed under the WTFPL License

const fs = require(`fs`);
const path = require(`path`);

async function main() {
	const url = 'https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s';
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
		const promises = [];
		for (const key in data) {
			const subproperty = data[key];
			if (subproperty && subproperty.dhd) {
				const imageUrl = subproperty.dhd;
				const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
				const filename = `${fileIndex}${ext}`;
				const filePath = path.join(downloadDir, filename);
				promises.push(downloadImage(imageUrl, filePath));
				fileIndex++;
			}
		}
		console.info(`📥 Downloading ${promises.length} images...`);
		const startTime = Date.now();
		const results = await Promise.allSettled(promises);
		const endTime = Date.now();
		const duration = (endTime - startTime) / 1000;
		const successCount = results.filter((result) => result.status === 'fulfilled').length;
		const failureCount = results.length - successCount;
		console.info(`✅ Downloaded ${successCount} images in ${duration} seconds.`);
		if (failureCount > 0) {
			console.warn(`❌ Failed to download ${failureCount} images.`);
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
	console.info(`📄 Downloaded image: ${filePath}`);
	return fs.promises.writeFile(filePath, buffer);
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
	setTimeout(main, 1000);
})();
