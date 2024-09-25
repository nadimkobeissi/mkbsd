/* eslint-disable @next/next/no-img-element */
import React from "react";
import LazyImage from "@/components/LazyImage";

async function fetchImages() {
  const url =
    "https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch JSON file: ${response.statusText}`);
  }
  const jsonData = await response.json();
  const data = jsonData.data;
  if (!data) {
    throw new Error('JSON does not have a "data" property at its root.');
  }

  const images = [];
  for (const key in data) {
    const subproperty = data[key];
    if (subproperty && subproperty.dhd) {
      images.push(subproperty.dhd);
    }
  }
  return images;
}

function AsciiArt() {
  return (
    <pre className="text-xs font-mono text-gray-700 bg-gray-100 p-4 rounded-lg mb-8">
      {` /$$      /$$ /$$   /$$ /$$$$$$$   /$$$$$$  /$$$$$$$
| $$$    /$$$| $$  /$$/| $$__  $$ /$$__  $$| $$__  $$
| $$$$  /$$$$| $$ /$$/ | $$  \\ $$| $$  \\__/| $$  \\ $$
| $$ $$/$$ $$| $$$$$/  | $$$$$$$ |  $$$$$$ | $$  | $$
| $$  $$$| $$| $$  $$  | $$__  $$ \\____  $$| $$  | $$
| $$\\  $ | $$| $$\\  $$ | $$  \\ $$ /$$  \\ $$| $$  | $$
| $$ \\/  | $$| $$ \\  $$| $$$$$$$/|  $$$$$$/| $$$$$$$/
|__/     |__/|__/  \\__/|_______/  \\______/ |_______/`}
    </pre>
  );
}

export default async function ImageGallery() {
  const images = await fetchImages();

  return (
    <div className="container mx-auto px-4 py-8">
      <AsciiArt />
      <p className="text-lg mb-8">
        🤑 Displaying images from your favorite sellout grifter&apos;s wallpaper
        app...
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((imageUrl, index) => (
          <div
            key={index}
            className="relative h-64 rounded-lg overflow-hidden shadow-lg"
          >
            <LazyImage src={imageUrl} alt={`Image ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
