//DEPS com.fasterxml.jackson.core:jackson-databind:2.13.3
//DEPS com.fasterxml.jackson.core:jackson-core:2.13.3
//DEPS com.fasterxml.jackson.core:jackson-annotations:2.13.3

import static java.lang.System.out;
import static java.nio.file.Files.*;
import static java.util.concurrent.TimeUnit.*;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;

public class mkbsd {

    private static final String URL = "https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s";
    private static final HttpClient client = HttpClient.newHttpClient();
    private static final ObjectMapper mapper = new ObjectMapper();

    public static void main(String[] args) throws Exception {
        asciiArt();
        SECONDS.sleep(5);
        mainSync();
    }

    private static void mainSync() throws Exception {
            var jsonData = fetchJson(URL);
            var data = (Map<String, Object>) jsonData.get("data");
            if (data == null) {
                throw new RuntimeException("⛔ JSON does not have a 'data' property at its root.");
            }

            var downloadDir = Paths.get("downloads");
            if (!exists(downloadDir)) {
                createDirectory(downloadDir);
                out.println("📁 Created directory: " + downloadDir.toAbsolutePath());
            }

            for (var entry : data.entrySet()) {
                if (entry.getValue() instanceof Map && ((Map<?, ?>) entry.getValue()).get("dhd") != null) {
                    var imageUrl = (String) ((Map<?, ?>) entry.getValue()).get("dhd");
                    var parsedUrl = URI.create(imageUrl);
                    out.println("🔍 Found image URL!");

                    var filename = parsedUrl.getPath().substring(parsedUrl.getPath().lastIndexOf('/')+1);
                    
                    var filePath = downloadDir.resolve(filename);
                    if(!filePath.toFile().exists()) {
                    downloadImage(imageUrl, filePath);
                    out.println("🖼️ Saved image to " + filePath);
                    } else {
                        out.println("Already saved " + filePath);
                    }

                    MILLISECONDS.sleep(250);
                }
            }
    }

    private static Map<String, Object> fetchJson(String url) throws Exception {
        var request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .build();

        var response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new RuntimeException("⛔ Failed to fetch JSON file: " + response.statusCode());
        }
        return mapper.readValue(response.body(), Map.class);
    }

    private static void downloadImage(String imageUrl, Path filePath) throws Exception {
        var request = HttpRequest.newBuilder()
            .uri(URI.create(imageUrl))
            .build();

        var response = client.send(request, HttpResponse.BodyHandlers.ofByteArray());
        if (response.statusCode() != 200) {
            throw new RuntimeException("Failed to download image: " + response.statusCode());
        }
        Files.write(filePath, response.body());
    }

    private static void asciiArt() {
        out.println("""
 /$$      /$$ /$$   /$$ /$$$$$$$   /$$$$$$  /$$$$$$$
| $$$    /$$$| $$  /$$/| $$__  $$ /$$__  $$| $$__  $$
| $$$$  /$$$$| $$ /$$/ | $$  \\ $$| $$  \\__/| $$  \\ $$
| $$ $$/$$ $$| $$$$$/  | $$$$$$$ |  $$$$$$ | $$  | $$
| $$  $$$| $$| $$  $$  | $$__  $$ \\____  $$| $$  | $$
| $$\\  $ | $$| $$\\  $$ | $$  \\ $$ /$$  \\ $$| $$  | $$
| $$ \\/  | $$| $$ \\  $$| $$$$$$$/|  $$$$$$/| $$$$$$$/
|__/     |__/|__/  \\__/|_______/  \\______/ |_______/""");
        out.println("");
        out.println("🤑 Starting downloads from your favorite sellout grifter's wallpaper app...");
    }
}