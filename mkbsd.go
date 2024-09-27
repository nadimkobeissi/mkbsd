package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/user"
	"path/filepath"
	"sync"
)

type ImageData map[string]string

type Response struct {
	Version int `json:"version,omitempty"`
	Data    map[string]struct {
		Dhd string `json:"dhd"`
	}
}

const DATA_URL = "https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s"

func downloadImages(x string, rawURL string, downloadsPath string, wg *sync.WaitGroup, channel chan<- string) {
	defer wg.Done()

	resp, err := http.Get(rawURL)

	if err != nil {
		res := fmt.Sprintf("error fetching data: %v", err)
		channel <- "ERR:" + res
		return
	}

	defer resp.Body.Close()

	imageFileName := filepath.Join(downloadsPath, x+".jpg")
	outFile, err := os.Create(imageFileName)
	if err != nil {
		res := fmt.Sprintf("failed to create file: %v", err)
		channel <- "ERR:" + res
		return
	}

	defer outFile.Close()

	_, err = io.Copy(outFile, resp.Body)
	if err != nil {
		res := fmt.Sprintf("failed to save image: %v", err)
		channel <- "ERR:" + res
		return
	}

	channel <- fmt.Sprintf("️🖼️ Saved image to %s", imageFileName)
}

type IOResponse struct {
	io  io.ReadCloser
	url string
}

func main() {

	resp, err := http.Get(DATA_URL)

	if err != nil {
		panic(err)
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		panic(err)
	}

	response := Response{}

	unmarshalErr := json.Unmarshal(body, &response)

	if unmarshalErr != nil {
		fmt.Println("Error parsing data:", unmarshalErr)
		panic(unmarshalErr)
	}

	usr, err := user.Current()

	if err != nil {
		fmt.Println("Error getting user:", err)
		return
	}

	downloadsPath := filepath.Join(usr.HomeDir, "Downloads", "MKBSD")

	// Create the folder in the Downloads directory
	err = os.MkdirAll(downloadsPath, 0755) // 0755 is the permission for the new folder
	if err != nil {
		fmt.Println("Error creating directory:", err)
		return
	}

	fmt.Println("Folder created successfully at:", downloadsPath)

	channel := make(chan string)

	var wg sync.WaitGroup

	for x, v := range response.Data {
		if v.Dhd != "" {
			wg.Add(1)
			go downloadImages(x, v.Dhd, downloadsPath, &wg, channel)
		}
	}

	go func() {
		wg.Wait()
		close(channel)
		fmt.Println("Bye 👋🏽")
	}()

	for res := range channel {
		fmt.Println(res)
	}

}
