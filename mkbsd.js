// Copyright 2024 Nadim Kobeissi
// Licensed under the WTFPL License

const { existsSync, mkdirSync, rmSync, readdirSync, writeFileSync } = require(`fs`);
const { extname, join } = require(`path`);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UTILITIES
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const printError = (message, { exit } = { exit: true }) => {
	console.error(`\n⛔ ${message}`)
	
	if (exit) {
		process.exit(1)
	}
}

const printSuccess = (message) => {
	console.info(`✅ ${message}`)
}

const printLineBreak = () => {
	console.log(`\n------------------------------------------\n`)
}

const delayBy = async (ms, cb) => await new Promise((resolve) => setTimeout(() => resolve(cb()), ms))

const printAscii = () => {
	console.info(`
 /$$      /$$ /$$   /$$ /$$$$$$$   /$$$$$$  /$$$$$$$
| $$$    /$$$| $$  /$$/| $$__  $$ /$$__  $$| $$__  $$
| $$$$  /$$$$| $$ /$$/ | $$  \\ $$| $$  \\__/| $$  \\ $$
| $$ $$/$$ $$| $$$$$/  | $$$$$$$ |  $$$$$$ | $$  | $$
| $$  $$$| $$| $$  $$  | $$__  $$ \\____  $$| $$  | $$
| $$\\  $ | $$| $$\\  $$ | $$  \\ $$ /$$  \\ $$| $$  | $$
| $$ \\/  | $$| $$ \\  $$| $$$$$$$/|  $$$$$$/| $$$$$$$/
|__/     |__/|__/  \\__/|_______/  \\______/ |_______/

🤑 Starting downloads from your favorite sellout grifter's wallpaper app...`)
}

const extractImageName = (url) =>
	decodeURIComponent(
		(new RegExp(/^https:\/\/.*\/content\/(.*.[a-zA-Z])\?/).exec(url)[1] || '')
			.replace(`a~`, '')
			.replace(/(_[a-z0-9]+)\//, ' - ')
			.replace('/', ' - ')
			.replace(/~+/g, ' ')
	)

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ACTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const fetchAssetData = async () => {
	try {
		const response = await fetch('https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s')
		if (!response.ok) {
			printError(`Failed to fetch asset data from Panels API: ${response.statusText}`)
		}
	
		const { data } = await response.json()
		if (!data) {
			printError('Failed to fetch asset data from Panels API: data not found')
		}

		printSuccess(`Successfully downloaded asset data from Panels API`)
	
		return data
	}
	catch (error) {
		printError(`Error downloading asset data from Panels API: ${error}`)
	}
}

const initializeDownloadDirectory = () => {
	try {
		const downloadDirectory = join(__dirname, 'downloads')
	
		if (existsSync(downloadDirectory)) {
			rmSync(downloadDirectory, { recursive: true, force: true })
		}
		mkdirSync(downloadDirectory)

		printSuccess(`Initialized download directory: ${downloadDirectory}`)
	
		return downloadDirectory
	}
	catch (error) {
		printError(`Error initializing download directory '${downloadDirectory}': ${error}`)
	}
}

const downloadImages = (data, downloadDirectory) => 
	Promise.all(
		Object.values(data)
			.filter((assetMap) => !!assetMap.dhd)
			.map(({ dhd: url }, i) => {
			const fileName = `[${i + 1}] - ${extractImageName(url)}`
			const filePath = join(downloadDirectory, fileName)

			return fetch(url)
				.then(async (response) => {
					if (!response.ok) {
						printError(`Failed to download image '${url}' with status text: '${response.statusText}'`, { exit: false })
						return
					}

					writeFileSync(filePath, Buffer.from(await response.arrayBuffer()))

					printSuccess(`Downloaded image: ${url}`)
				})
				.catch((error) => {
					printError(`Failed to download image '${url}' with error: ${error}`, { exit: false })
				})
			})
	)

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SCRIPT
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const mkbsd = async () => {
	printAscii()
	printLineBreak()

	const data = await delayBy(500, fetchAssetData)
	const downloadDirectory = await delayBy(500, initializeDownloadDirectory)
	
	printLineBreak()
	console.log('Beginning image download...\n\n')

	await delayBy(500, downloadImages.bind(null, data, downloadDirectory))

	printLineBreak()
	printSuccess(`DONE! Downloaded ${readdirSync(downloadDirectory).length} images from Panels API`)
}

mkbsd()