

const fs = require(`fs`);
const path = require(`path`);
const readline = require('readline');

async function main(imageCount) {
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

		const totalFiles = Object.keys(data).length; // Count total available files
		console.info(`📦 Total available files: ${totalFiles}`);

		if (imageCount > totalFiles) {
			console.warn(`⚠️ You requested ${imageCount} files, but only ${totalFiles} are available. Downloading all available files instead.`);
			imageCount = totalFiles; // Limit to available files
		}

		const downloadDir = path.join(__dirname, 'downloads');
		if (!fs.existsSync(downloadDir)) {
			fs.mkdirSync(downloadDir);
			console.info(`📁 Created directory: ${downloadDir}`);
		}

		let fileIndex = 1;
		for (const key in data) {
			if (fileIndex > imageCount) break; // Stop if we've reached the desired count
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
				await delay(250);
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
	console.info(``);
	console.info(`🤑 Starting downloads from your favorite sellout grifter's wallpaper app...`);
}

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

// Function to start the download process
async function startDownload() {
	const url = 'https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s';
	const response = await fetch(url);
	const jsonData = await response.json();
	const data = jsonData.data;

	const totalFiles = Object.keys(data).length; // Count total available files
	console.info(`📦 Total available files: ${totalFiles}`);

	rl.question('How many images would you like to download? ', (answer) => {
		let imageCount = parseInt(answer, 10);
		if (isNaN(imageCount) || imageCount <= 0) {
			console.error('Please enter a valid positive number.');
			rl.close();
			return;
		}

		if (imageCount > totalFiles) {
			console.warn(`⚠️ You requested ${imageCount} files, but only ${totalFiles} are available. Downloading all available files instead.`);
			imageCount = totalFiles; // Limit to available files
		}

		asciiArt();
		setTimeout(() => {
			main(imageCount).finally(() => rl.close());
		}, 5000);
	});
}

// Start the download process
startDownload();

