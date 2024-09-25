// Licensed under the WTFPL License

use futures::future::join_all;
use reqwest::Client;
use serde_json::Value;
use std::fs::{self, File};
use std::io::Write;
use std::path::Path;
use std::time::Duration;
use tokio::time::sleep;
use url::Url;

const URL: &str = "https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s";
const DOWNLOAD_DIR: &str = "downloads";

async fn download_image(
    client: &Client,
    image_url: &str,
    file_path: &Path,
) -> Result<(), Box<dyn std::error::Error>> {
    let response = client.get(image_url).send().await?;

    if !response.status().is_success() {
        return Err(format!("Failed to download image: {}", response.status()).into());
    }

    let content = response.bytes().await?;
    let mut file = File::create(file_path)?;
    file.write_all(&content)?;

    Ok(())
}

async fn main_task() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new();

    // Fetch the JSON data
    let response = client.get(URL).send().await?;
    if !response.status().is_success() {
        return Err(format!("⛔ Failed to fetch JSON file: {}", response.status()).into());
    }

    let json_data: Value = response.json().await?;
    let data = json_data
        .get("data")
        .ok_or("⛔ JSON does not have a 'data' property at its root.")?;

    // Create download directory if it doesn't exist
    let download_dir = Path::new(DOWNLOAD_DIR);
    if !download_dir.exists() {
        fs::create_dir_all(download_dir)?;
        println!("📁 Created directory: {:?}", download_dir);
    }

    let mut file_index = 1;
    let mut download_tasks = vec![];

    for (_key, subproperty) in data.as_object().unwrap().iter() {
        if let Some(subproperty) = subproperty.as_object() {
            if let Some(image_url) = subproperty.get("dhd").and_then(|v| v.as_str()) {
                println!("🔍 Found image URL!");

                // Parse URL to get the file extension
                let parsed_url = Url::parse(image_url)?;
                let ext = Path::new(parsed_url.path())
                    .extension()
                    .and_then(|e| e.to_str())
                    .unwrap_or("jpg");

                let filename = format!("{}.{ext}", file_index);
                let file_path = download_dir.join(filename);

                let client_clone = client.clone();
                let image_url_clone = image_url.to_string();
                let file_path_clone = file_path.clone();

                // Spawn a new task for each download
                let download_task = tokio::spawn(async move {
                    if let Err(e) =
                        download_image(&client_clone, &image_url_clone, &file_path_clone).await
                    {
                        eprintln!("Error downloading {}: {}", image_url_clone, e);
                    } else {
                        println!("🖼️ Saved image to {:?}", file_path_clone);
                    }
                });

                download_tasks.push(download_task);
                file_index += 1;
                sleep(Duration::from_millis(250)).await;
            }
        }
    }

    // Wait for all download tasks to complete
    join_all(download_tasks).await;

    Ok(())
}

fn ascii_art() {
    println!(
        r#"
 /$$      /$$ /$$   /$$ /$$$$$$$   /$$$$$$  /$$$$$$$
| $$$    /$$$| $$  /$$/| $$__  $$ /$$__  $$| $$__  $$
| $$$$  /$$$$| $$ /$$/ | $$  \ $$| $$  \__/| $$  \ $$
| $$ $$/$$ $$| $$$$$/  | $$$$$$$ |  $$$$$$ | $$  | $$
| $$  $$$| $$| $$  $$  | $$__  $$ \____  $$| $$  | $$
| $$\  $ | $$| $$\  $$ | $$  \ $$ /$$  \ $$| $$  | $$
| $$ \/  | $$| $$ \  $$| $$$$$$$/|  $$$$$$/| $$$$$$$/
|__/     |__/|__/  \__/|_______/  \______/ |_______/
        "#
    );
    println!("🤑 Starting downloads from your favorite sellout grifter's wallpaper app...");
}

#[tokio::main]
async fn main() {
    ascii_art();
    sleep(Duration::from_secs(5)).await;
    if let Err(e) = main_task().await {
        eprintln!("Error: {}", e);
    }
}
