// Copyright 2024 Nadim Kobeissi
// edit by Jay 2024
// Licensed under the WTFPL License

const fs = require(`fs`);
const path = require(`path`);

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
		// const downloadDir = path.join(__dirname, 'downloads');
		// if (!fs.existsSync(downloadDir)) {
		// 	fs.mkdirSync(downloadDir);
		// 	console.info(`📁 Created directory: ${downloadDir}`);
		// }
		//let fileIndex = 1;
		for (const key in data) {
			const subproperty = data[key];
			if (subproperty && subproperty.dhd) {
				const imageUrl = subproperty.dhd;
				console.info(`🔍 Found image URL!`);
				await delay(100);

				const author = getAuthor(imageUrl);
				const authorDir = path.join(__dirname, 'downloads', author);
				if (!fs.existsSync(authorDir)) {
						fs.mkdirSync(authorDir, { recursive: true });
						console.info(`📁 Created directory: ${authorDir}`);
				}

				const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
				const filename = `${key}${ext}`;
				const filePath = path.join(authorDir, filename);
				await downloadImage(imageUrl, filePath);
				console.info(`🖼️ Saved image to ${filePath}`);
				//fileIndex++;
				await delay(250);
			}
		}
	} catch (error) {
		console.error(`Error: ${error.message}`);
	}
}

function getAuthor(url) {
	const parUrl = new URL(url);
	const urlParts = parUrl.pathname.split('/');
	const authorPart = urlParts.find(part => part.includes('~'));
	if (authorPart) {
		const nameParts = authorPart.split('~')[1].split('_');
		return nameParts[0];
}
return 'unknown';
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

(() => {
	asciiArt();
	setTimeout(main, 5000);
})();
