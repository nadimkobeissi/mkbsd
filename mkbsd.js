// Copyright 2024 Nadim Kobeissi
// Licensed under the WTFPL License

const fs = require(`fs`);
const path = require(`path`);
const cliProgress = require(`cli-progress`);
const colors = require("ansi-colors");

async function getTotalPics(data) {
  let totalPics = 0;
  for (const key in data) {
    const subproperty = data[key];
    if (subproperty && subproperty.dhd) {
      totalPics++;
    }
  }
  return totalPics;
}

async function main() {
  const url =
    "https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s";
  const delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
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
    const downloadDir = path.join(__dirname, "downloads");
    const logsDir = path.join(__dirname, "logs");
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir);
      console.info(`📁 Created directory: ${downloadDir}`);
    }
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
      console.info(`📁 Created logs directory: ${logsDir}`);
    }
    const logsFilePath = path.join(logsDir, `logs.txt`);
    let fileIndex = 1;
    let totalPictures = await getTotalPics(data);
    const bar = new cliProgress.SingleBar(
      {
        format:
          "Picture Progress Download |" +
          colors.cyan("{bar}") +
          "| {percentage}% || {value}/{total} Pictures",
        barCompleteChar: "\u2588",
        barIncompleteChar: "\u2591",
        hideCursor: true,
      },
      cliProgress.Presets.shades_classic
    );
    bar.start(totalPictures, 0, {
      speed: "N/A",
    });
    for (const key in data) {
      const subproperty = data[key];
      if (subproperty && subproperty.dhd) {
        const imageUrl = subproperty.dhd;
        writeLogs(`🔍 Found image URL!`, logsFilePath);
        await delay(100);
        const ext = path.extname(new URL(imageUrl).pathname) || ".jpg";
        const filename = `${fileIndex}${ext}`;
        const filePath = path.join(downloadDir, filename);
        await downloadImage(imageUrl, filePath);
        writeLogs(`🖼️ Saved image to ${filePath}`, logsFilePath);
        fileIndex++;
        bar.increment();
        bar.update();
        await delay(250);
      }
    }
    bar.stop();
    console.info(`✅ All done! Saved images to ${downloadDir}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

async function writeLogs(log, logsFilePath) {
  const buffer = Buffer.from(log + "\n");
  await fs.promises.appendFile(logsFilePath, buffer);
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
  console.info(
    `🤑 Starting downloads from your favorite sellout grifter's wallpaper app...`
  );
}

(() => {
  asciiArt();
  setTimeout(main, 5000);
})();
