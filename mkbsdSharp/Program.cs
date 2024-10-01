// Licensed under the WTFPL License

using System.Text.Json;


class Program
{
    private static readonly HttpClient Client = new();

    static async Task Main(string[] args)
    {
        AsciiArt();
        await Task.Delay(1000);
        string url = "https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s";

        try
        {
            HttpResponseMessage response = await Client.GetAsync(url);
            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"⛔ Failed to fetch JSON file: {response.ReasonPhrase}");
            }

            DataType? jsonData = 
                await JsonSerializer.DeserializeAsync<DataType>(await response.Content.ReadAsStreamAsync());
            var data = jsonData?.data;
            
        
            if (data == null)
            {
                throw new Exception("⛔ JSON does not have a 'data' property at its root.");
            }

            string downloadDir = Path.Combine(Directory.GetCurrentDirectory(), "downloads");
            if (!Directory.Exists(downloadDir))
            {
                Directory.CreateDirectory(downloadDir);
                Console.WriteLine($"📁 Created directory: {downloadDir}");
            }

            var keyvaluepair = data.Values.ToList();
            for(int i=0; i< keyvaluepair.Count; i++ )
            {
                var subproperty = keyvaluepair[i];
                if (subproperty.TryGetValue("dhd", out var imageUrl))
                {
                    Console.WriteLine("🔍 Found image URL!");
                    string ext = Path.GetExtension(new Uri(imageUrl).AbsolutePath) ?? ".jpg";
                    string filename = $"{i}{ext}";
                    string filePath = Path.Combine(downloadDir, filename);
                    await DownloadImage(imageUrl, filePath);
                }
            }

        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            
        }
    }
    

    static async Task DownloadImage(string url, string filePath)
    {
        
        await Task.Delay(100);
        HttpResponseMessage response = await Client.GetAsync(url);
        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"Failed to download image: {response.ReasonPhrase}");
        }

        byte[] imageBytes = await response.Content.ReadAsByteArrayAsync();
        await File.WriteAllBytesAsync(filePath, imageBytes);
        Console.WriteLine($"🖼️ Saved image to {filePath}");
        await Task.Delay(250);
    }

    static void AsciiArt()
    {
        Console.WriteLine(@"
 /$$      /$$ /$$   /$$ /$$$$$$$   /$$$$$$  /$$$$$$$
| $$$    /$$$| $$  /$$/| $$__  $$ /$$__  $$| $$__  $$
| $$$$  /$$$$| $$ /$$/ | $$  \ $$| $$  \__/| $$  \ $$
| $$ $$/$$ $$| $$$$$/  | $$$$$$$ |  $$$$$$ | $$  | $$
| $$  $$$| $$| $$  $$  | $$__  $$ \____  $$| $$  | $$
| $$\  $ | $$| $$\  $$ | $$  \ $$ /$$  \ $$| $$  | $$
| $$ \/  | $$| $$ \  $$| $$$$$$$/|  $$$$$$/| $$$$$$$/
|__/     |__/|__/  \__/|_______/  \______/ |_______/");
        Console.WriteLine();
        Console.WriteLine("🤑 Starting downloads from your favorite sellout grifter's wallpaper app...");
    }

    private class DataType
    {
        public int version { get; set; }
        public Dictionary<string, Dictionary<string,  string>>? data { get; set; }
    }
    
    
}


