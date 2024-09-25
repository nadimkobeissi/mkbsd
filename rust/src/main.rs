use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
struct JsonData {
    version: i8,
    data: HashMap<String, HashMap<String, String>>,
}

fn get_extension(url: &str) -> Option<String> {
    let s = url.split("?").next();

    if let Some(s) = s {
        if let Some(dot_pos) = s.rfind('.') {
            return Some(s[dot_pos..].to_string());
        }
    }
    None
}

fn download_file(url: &str, filename: &str) -> Result<(), Box<dyn std::error::Error>> {
    let mut out = std::fs::File::create(format!("./downloads/{}", filename))?;

    reqwest::blocking::get(url)?.copy_to(&mut out)?;

    Ok(())
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let file_url = "https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s";

    let Ok(json_text) = reqwest::blocking::get(file_url)?.text() else {
        panic!("Failed to fetch JSON file")
    };

    let Ok(json_data) = serde_json::from_str::<JsonData>(&json_text) else {
        panic!("Failed to deserialize string")
    };

    if !std::path::Path::new("./downloads").exists() {
        std::fs::create_dir("./downloads").expect("Failed to create downloads directory");
    }

    println!(
        "
    /$$      /$$ /$$   /$$ /$$$$$$$   /$$$$$$  /$$$$$$$
   | $$$    /$$$| $$  /$$/| $$__  $$ /$$__  $$| $$__  $$
   | $$$$  /$$$$| $$ /$$/ | $$  \\ $$| $$  \\__/| $$  \\ $$
   | $$ $$/$$ $$| $$$$$/  | $$$$$$$ |  $$$$$$ | $$  | $$
   | $$  $$$| $$| $$  $$  | $$__  $$ \\____  $$| $$  | $$
   | $$\\  $ | $$| $$\\  $$ | $$  \\ $$ /$$  \\ $$| $$  | $$
   | $$ \\/  | $$| $$ \\  $$| $$$$$$$/|  $$$$$$/| $$$$$$$/
   |__/     |__/|__/  \\__/|_______/  \\______/ |_______/"
    );
    println!("\n 🤑 Starting downloads from your favorite sellout grifter's wallpaper app... \n");

    for (key_1, inner_map) in json_data.data {
        for (key_2, url) in inner_map {
            if key_2 != "dhd" {
                continue;
            }

            let filename: String;
            match get_extension(&url) {
                Some(ext) => {
                    filename = format!("{}_{}{}", key_1, key_2, ext);
                }
                None => {
                    println!("\n No extension found for URL: {} \n", url);
                    println!("Saving this file as as .jpg \n");
                    filename = format!("{}_{}.jpg", key_1, key_2);
                }
            }

            match download_file(&url, &filename) {
                Ok(_) => {
                    println!("Downloaded {}", filename);
                }
                Err(_) => {
                    println!("Error downloading file: {}", filename);
                }
            }
        }
    }

    Ok(())
}
