// Licensed under the WTFPL License
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"time"
)

type Media struct {
	Data map[string]struct {
		DHD string `json:"dhd"`
	} `json:"data"`
}

var baseURL = "https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s"

func delay(ms int) {
	time.Sleep(time.Duration(ms) * time.Millisecond)
}

func downloadImage(imageURL, filePath string) error {
	resp, err := http.Get(imageURL)
	if err != nil {
		return fmt.Errorf("failed to fetch image: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to download image: %s", resp.Status)
	}

	out, err := os.Create(filePath)
	if err != nil {
		return fmt.Errorf("failed to create file: %w", err)
	}
	defer out.Close()

	_, err = io.Copy(out, resp.Body)
	if err != nil {
		return fmt.Errorf("failed to write image: %w", err)
	}

	fmt.Printf("🖼️ Saved image to %s\n", filePath)
	return nil
}

func fetchJSON() (*Media, error) {
	resp, err := http.Get(baseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch JSON: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("⛔ Failed to fetch JSON file: %s", resp.Status)
	}

	var media Media
	err = json.NewDecoder(resp.Body).Decode(&media)
	if err != nil {
		return nil, fmt.Errorf("failed to decode JSON: %w", err)
	}

	return &media, nil
}

func asciiArt() {
	fmt.Println(`
/$$      /$$ /$$   /$$ /$$$$$$$   /$$$$$$  /$$$$$$$
| $$$    /$$$| $$  /$$/| $$__  $$ /$$__  $$| $$__  $$
| $$$$  /$$$$| $$ /$$/ | $$  \ $$| $$  \__/| $$  \ $$
| $$ $$/$$ $$| $$$$$/  | $$$$$$$ |  $$$$$$ | $$  | $$
| $$  $$$| $$| $$  $$  | $$__  $$ \____  $$| $$  | $$
| $$\  $ | $$| $$\  $$ | $$  \ $$ /$$  \ $$| $$  | $$
| $$ \/  | $$| $$ \  $$| $$$$$$$/|  $$$$$$/| $$$$$$$/
|__/     |__/|__/  \__/|_______/  \______/ |_______/
`)
	fmt.Println("")
	fmt.Println("🤑 Starting downloads from your favorite sellout grifter's wallpaper app...")
}

func main() {
	asciiArt()

	downloadDir := filepath.Join(".", "downloads")
	if _, err := os.Stat(downloadDir); os.IsNotExist(err) {
		err = os.Mkdir(downloadDir, 0755)
		if err != nil {
			fmt.Printf("Failed to create directory: %v\n", err)
			return
		}
		fmt.Printf("📁 Created directory: %s\n", downloadDir)
	}

	media, err := fetchJSON()
	if err != nil {
		fmt.Printf("Error fetching JSON: %v\n", err)
		return
	}

	if len(media.Data) == 0 {
		fmt.Println("⛔ JSON does not have a 'data' property at its root.")
		return
	}

	fileIndex := 1
	for key, subproperty := range media.Data {
		if subproperty.DHD != "" {
			imageURL := subproperty.DHD
			fmt.Printf("🔍 Found image URL for key: %s\n", key)

			parsedURL, err := url.Parse(imageURL)
			if err != nil {
				fmt.Printf("Error parsing URL: %v\n", err)
				continue
			}

			ext := filepath.Ext(parsedURL.Path)
			if ext == "" {
				ext = ".jpg"
			}

			fileName := fmt.Sprintf("%d%s", fileIndex, ext)
			filePath := filepath.Join(downloadDir, fileName)

			err = downloadImage(imageURL, filePath)
			if err != nil {
				fmt.Printf("Error downloading image: %v\n", err)
				continue
			}

			fileIndex++
			delay(250)
		}
	}
}