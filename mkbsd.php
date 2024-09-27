<?php
/*
            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
                    Version 2, December 2004

 Copyright (C) 2024 < medeirost @ github>

 Everyone is permitted to copy and distribute verbatim or modified
 copies of this license document, and changing it is allowed as long
 as the name is changed.

            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

  0. You just DO WHAT THE FUCK YOU WANT TO.
*/


ascii_art();

// Check if Imagick is installed and available
if (!extension_loaded('imagick')) {
    die("❌ ImageMagick (Imagick) extension is not installed or enabled.\n");
}

// URL to fetch JSON data from
$jsonUrl = 'https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s';

// Download JSON data using file_get_contents
$jsonData = file_get_contents($jsonUrl);
if ($jsonData === false) {
    die("❌ Failed to download JSON data.");
}

// Decode the JSON data
$dataArray = json_decode($jsonData, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    die("❌ Error decoding JSON.");
}

// Ensure 'data' object exists in JSON
if (!isset($dataArray['data'])) {
    die("❌ 'data' object not found in JSON.");
}

$data = $dataArray['data'];

// Function to detect image type using Imagick, convert HEIC to PNG, and rename accordingly
function validate_and_rename_image($filename) {
    try {
        $imagick = new Imagick($filename);
        $imageFormat = strtolower($imagick->getImageFormat()); // Get the correct image format

        // If the format is HEIC, convert it to PNG
        if ($imageFormat === 'heic') {
            // Convert HEIC to PNG
            $newFilename = pathinfo($filename, PATHINFO_FILENAME) . '.png';
            $imagick->setImageFormat('png');
            $imagick->writeImage($newFilename);
            
            // Delete the original HEIC file
            unlink($filename);
            return $newFilename;
        }

        // Rename the file if the extension doesn't match the detected format
        $newFilename = pathinfo($filename, PATHINFO_FILENAME) . '.' . $imageFormat;
        if ($newFilename !== $filename) {
            rename($filename, $newFilename);
            return $newFilename; // Return the new filename
        }
    } catch (Exception $e) {
        echo "❌ Invalid image: $filename. Deleting it.\n";
        unlink($filename); // Delete the invalid image
        return false;
    }
    return $filename;
}

// Download a file using file_get_contents
function download_file($url, $filename) {
    // Download the file
    $fileContent = file_get_contents($url);

    if ($fileContent === false) {
        echo "❌ Failed to download $filename.\n";
        return false;
    }

    // Save the file
    file_put_contents($filename, $fileContent);
    return true;
}

// Iterate over each object in 'data'
foreach ($data as $key => $value) {
    // Check for 'dhd' first, then try 's'
    $url = isset($value['dhd']) ? $value['dhd'] : (isset($value['s']) ? $value['s'] : null);

    if ($url) {
        // Use the key as the base filename (ImageMagick will handle extensions)
        $filename = $key;

        // Download the file using file_get_contents
        if (download_file($url, $filename)) {
            // Validate, convert (if needed), and rename image based on its true format
            $validatedFilename = validate_and_rename_image($filename);

            // Output the result in one line
            echo "🖼️ Downloaded and processed: $filename -> $validatedFilename\n";
        }

        // Add a 250ms delay between downloads
        usleep(250000); // 250,000 microseconds = 250ms
    } else {
        echo "⚠️ No 'dhd' or 's' field found for key: $key\n";
    }
}

// Function to print the MKBSD ascii art during startup
function ascii_art() {


	echo '	 /$$      /$$ /$$   /$$ /$$$$$$$   /$$$$$$  /$$$$$$$
	| $$$    /$$$| $$  /$$/| $$__  $$ /$$__  $$| $$__  $$
	| $$$$  /$$$$| $$ /$$/ | $$  \\ $$| $$  \\__/| $$  \\ $$
	| $$ $$/$$ $$| $$$$$/  | $$$$$$$ |  $$$$$$ | $$  | $$
	| $$  $$$| $$| $$  $$  | $$__  $$ \\____  $$| $$  | $$
	| $$\\  $ | $$| $$\\  $$ | $$  \\ $$ /$$  \\ $$| $$  | $$
	| $$ \\/  | $$| $$ \\  $$| $$$$$$$/|  $$$$$$/| $$$$$$$/
	|__/     |__/|__/  \\__/|_______/  \\______/ |_______/';
	echo "\n🤑 Starting downloads from your favorite sellout grifter's wallpaper app...\n";


}

?>
