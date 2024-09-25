require 'net/http'
require 'json'
require 'fileutils'
require 'uri'

# Delay function to pause for a given time in milliseconds
def delay(ms)
  sleep(ms / 1000.0)
end

# Function to fetch the JSON data from a given URL
def fetch_json_data(url)
  uri = URI(url)
  response = Net::HTTP.get_response(uri)

  unless response.is_a?(Net::HTTPSuccess)
    raise "⛔ Failed to fetch JSON file: #{response.message}"
  end

  json_data = JSON.parse(response.body)
  data = json_data['data']

  raise '⛔ JSON does not have a "data" property at its root.' unless data

  data
end

# Function to download images from the JSON data
def download_images(data, download_dir)
  FileUtils.mkdir_p(download_dir)
  puts "📁 Created directory: #{download_dir}"

  file_index = 1
  data.each do |key, subproperty|
    next unless subproperty && subproperty['dhd']

    image_url = subproperty['dhd']
    puts "🔍 Found image URL: #{image_url}"

    delay(100) # Short delay before downloading

    uri = URI(image_url)

    # Ensure a valid extension is used, and fallback to .jpg if no extension is found
    ext = File.extname(uri.path)
    ext = '.jpg' if ext.empty?

    file_name = "#{file_index}#{ext}"
    file_path = File.join(download_dir, file_name)

    download_image(image_url, file_path)

    puts "🖼️ Saved image to #{file_path}"
    file_index += 1

    delay(250) # Delay after saving the image
  end
end

# Function to download an image from a URL and save it to a file
def download_image(url, file_path)
  uri = URI(url)
  response = Net::HTTP.get_response(uri)

  unless response.is_a?(Net::HTTPSuccess)
    raise "Failed to download image: #{response.message}"
  end

  # Write the file in binary mode to avoid corruption
  File.open(file_path, 'wb') do |file|
    file.write(response.body)
  end
end

# ASCII art function for fun
def ascii_art
  puts <<~ART
     /$$      /$$ /$$   /$$ /$$$$$$$   /$$$$$$  /$$$$$$$
    | $$$    /$$$| $$  /$$/| $$__  $$ /$$__  $$| $$__  $$
    | $$$$  /$$$$| $$ /$$/ | $$  \\ $$| $$  \\__/| $$  \\ $$
    | $$ $$/$$ $$| $$$$$/  | $$$$$$$ |  $$$$$$ | $$  | $$
    | $$  $$$| $$| $$  $$  | $$__  $$ \\____  $$| $$  | $$
    | $$\\  $ | $$| $$\\  $$ | $$  \\ $$ /$$  \\ $$| $$  | $$
    | $$ \\/  | $$| $$ \\  $$| $$$$$$$/|  $$$$$$/| $$$$$$$/
    |__/     |__/|__/  \\__/|_______/  \\______/ |_______/
  ART

  puts "🤑 Starting downloads from your favorite sellout grifter's wallpaper app..."
end

# Main function that starts the image download process
def main
  url = 'https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s'
  download_dir = File.join(Dir.pwd, 'downloads')

  begin
    data = fetch_json_data(url)
    download_images(data, download_dir)
  rescue StandardError => e
    puts "Error: #{e.message}"
  end
end

# Call the ASCII art function and wait 5 seconds before starting the main process
ascii_art
delay(5000)
main
