#!/usr/bin/env node

// Copyright 2024 Nadim Kobeissi
// Licensed under the WTFPL License

import { stat, mkdir, writeFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { setTimeout } from 'node:timers/promises'

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
console.info(
  `🤑 Starting downloads from your favorite sellout grifter's wallpaper app...`
);

const url = 'https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s';
const downloadsDir = new URL('downloads/', import.meta.url);

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

	try {
		await stat(downloadsDir);
	} catch {
		await mkdir(downloadsDir);
		console.info(`📁 Created directory: ${downloadsDir.pathname}`);
	}

	let fileIndex = 1;
	for (const subproperty of Object.values(data)) {
		if (subproperty?.dhd) {
			const imageUrl = subproperty.dhd;
			console.info(`🔍 Found image URL!`);
			await setTimeout(100);
			const ext = extname(new URL(imageUrl).pathname) || '.jpg';
			const filename = `${fileIndex}${ext}`;
			const filePath = new URL(filename, downloadsDir);
			await downloadImage(imageUrl, filePath);
			console.info(`🖼️ Saved image to ${filePath.pathname}`);
			fileIndex++;
			await setTimeout(250);
		}
	}
} catch (error) {
	console.error(`Error: ${error.message}`);
}

async function downloadImage(url, filePath) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to download image: ${response.statusText}`);
	}
	const arrayBuffer = await response.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);
	await writeFile(filePath, buffer);
}
