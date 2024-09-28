#!/usr/bin/env ruby

# Licensed under the WTFPL License
#
# Features:
# - Downloads images from a specified JSON API
# - Creates a local 'downloads' directory to store images
# - Displays ASCII art and emoji-enhanced console output
# - Implements error handling for network requests and file operations
# - Adds a delay between downloads to avoid overwhelming the server
#
# Dependencies:
# - Ruby (tested with Ruby 2.7+)
# - Standard Library gems:
#   - net/http (for HTTP requests)
#   - json (for JSON parsing)
#   - uri (for URL parsing)
#   - fileutils (for directory operations)
#
# Usage:
# 1. chmod +x mkbsd.rb
# 2. Run the script: ./mkbsd.rb

require 'net/http'
require 'json'
require 'uri'
require 'fileutils'

URL = 'https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s'

def delay(ms)
  sleep(ms.to_f / 1000)
end

def download_image(image_url, file_path)
  uri = URI(image_url)
  Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https') do |http|
    request = Net::HTTP::Get.new(uri)
    response = http.request(request)
    
    if response.code == '200'
      File.open(file_path, 'wb') do |file|
        file.write(response.body)
      end
    else
      puts "Failed to download image: #{response.code}"
    end
  end
rescue StandardError => e
  puts "Error downloading image: #{e.message}"
end

def main
  uri = URI(URL)
  response = Net::HTTP.get_response(uri)
  
  if response.code != '200'
    raise "⛔ Failed to fetch JSON file: #{response.code}"
  end
  
  json_data = JSON.parse(response.body)
  data = json_data['data']
  
  if !data
    raise '⛔ JSON does not have a "data" property at its root.'
  end
  
  download_dir = File.join(Dir.pwd, 'downloads')
  FileUtils.mkdir_p(download_dir)
  puts "📁 Created directory: #{download_dir}"
  
  file_index = 1
  data.each do |key, subproperty|
    if subproperty && subproperty['dhd']
      image_url = subproperty['dhd']
      puts "🔍 Found image URL!"
      parsed_url = URI.parse(image_url)
      ext = File.extname(parsed_url.path).empty? ? '.jpg' : File.extname(parsed_url.path)
      filename = "#{file_index}#{ext}"
      file_path = File.join(download_dir, filename)
      
      download_image(image_url, file_path)
      puts "🖼️ Saved image to #{file_path}"
      
      file_index += 1
      delay(250)
    end
  end
rescue StandardError => e
  puts "Error: #{e.message}"
end

def ascii_art
  puts <<-ASCII
 /$$      /$$ /$$   /$$ /$$$$$$$   /$$$$$$  /$$$$$$$
| $$$    /$$$| $$  /$$/| $$__  $$ /$$__  $$| $$__  $$
| $$$$  /$$$$| $$ /$$/ | $$  \\ $$| $$  \\__/| $$  \\ $$
| $$ $$/$$ $$| $$$$$/  | $$$$$$$ |  $$$$$$ | $$  | $$
| $$  $$$| $$| $$  $$  | $$__  $$ \\____  $$| $$  | $$
| $$\\  $ | $$| $$\\  $$ | $$  \\ $$ /$$  \\ $$| $$  | $$
| $$ \\/  | $$| $$ \\  $$| $$$$$$$/|  $$$$$$/| $$$$$$$/
|__/     |__/|__/  \\__/|_______/  \\______/ |_______/
  ASCII
  puts
  puts "🤑 Starting downloads from your favorite sellout grifter's wallpaper app..."
end

ascii_art
sleep 5
main
