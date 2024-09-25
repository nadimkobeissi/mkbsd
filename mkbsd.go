package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path"
	"strings"
)

const imagesUrl = "https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s"
const downloadsFolder = "downloads"

func main() {
	asciiArt()

	wd, err := os.Getwd()
	if err != nil {
		panic(err)
	}

	fmt.Printf("downloading image sets\n")
	imageComponents, err := getImageSets()
	if err != nil {
		panic(err)
	}

	for imageSetId, imageSet := range imageComponents {
		if err = os.MkdirAll(fmt.Sprintf("%s/%s/%s", wd, downloadsFolder, imageSetId), os.ModePerm); err != nil {
			fmt.Printf("failed to create directory for images: %s/%s/%s: %v\n",
				wd, downloadsFolder, imageSetId, err)
			continue
		}
		for imageName, imageUrl := range imageSet {
			imageExt, err := getImageExtension(imageUrl)
			if err != nil {
				fmt.Printf("failed to extract iamge extension for url: %s\n", imageUrl)
				continue
			}
			downloadPath := fmt.Sprintf("%s/%s/%s/%s.%s",
				wd, downloadsFolder, imageSetId, imageName, imageExt)
			fmt.Printf("downloading %s/%s/%s.%s\n",
				downloadsFolder, imageSetId, imageName, imageExt)
			if err = downloadImage(imageUrl, downloadPath); err != nil {
				fmt.Printf("failed to download from %s: %v\n", imageUrl, err)
			}
		}
	}
}

func getImageSets() (map[string]map[string]string, error) {
	imageSets := make(map[string]map[string]string)

	response, err := http.Get(imagesUrl)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch data: %w", err)
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("server returned non-200 status: %d", response.StatusCode)
	}

	var result map[string]interface{}
	decoder := json.NewDecoder(response.Body)
	if err := decoder.Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode JSON: %w", err)
	}

	data := result["data"].(map[string]interface{})
	for imageSetId, imageSet := range data {
		for imageId, imageUrl := range imageSet.(map[string]interface{}) {
			if _, exists := imageSets[imageSetId]; !exists {
				imageSets[imageSetId] = make(map[string]string)
			}
			imageSets[imageSetId][imageId] = imageUrl.(string)
		}
	}

	return imageSets, nil
}

func downloadImage(url, filePath string) error {
	response, err := http.Get(url)
	if err != nil {
		return fmt.Errorf("failed to download image: %w", err)
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return fmt.Errorf("server returned non-200 status: %d", response.StatusCode)
	}

	outFile, err := os.Create(filePath)
	if err != nil {
		return fmt.Errorf("failed to create file: %w", err)
	}
	defer outFile.Close()

	_, err = io.Copy(outFile, response.Body)
	if err != nil {
		return fmt.Errorf("failed to save image: %w", err)
	}

	return nil
}

func asciiArt() {
	fmt.Printf(`
 /$$      /$$ /$$   /$$ /$$$$$$$   /$$$$$$  /$$$$$$$ 
| $$$    /$$$| $$  /$$/| $$__  $$ /$$__  $$| $$__  $$
| $$$$  /$$$$| $$ /$$/ | $$  \ $$| $$  \__/| $$  \ $$
| $$ $$/$$ $$| $$$$$/  | $$$$$$$ |  $$$$$$ | $$  | $$
| $$  $$$| $$| $$  $$  | $$__  $$ \____  $$| $$  | $$
| $$\  $ | $$| $$\  $$ | $$  \ $$ /$$  \ $$| $$  | $$
| $$ \/  | $$| $$ \  $$| $$$$$$$/|  $$$$$$/| $$$$$$$/
|__/     |__/|__/  \__/|_______/  \______/ |_______/ `)
	fmt.Printf("\n\n")
	fmt.Printf("🤑 Starting downloads from your favorite sellout grifter's wallpaper app...\n")
}

func getImageExtension(imageUrl string) (string, error) {
	parsedURL, err := url.Parse(imageUrl)
	if err != nil {
		return "", err
	}

	fileName := path.Base(parsedURL.Path)
	ext := path.Ext(fileName)

	return strings.TrimPrefix(ext, "."), nil
}
