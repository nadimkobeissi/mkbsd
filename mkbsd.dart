import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:path/path.dart' as path;

void main(List<String> arguments) async {
  ascii_art();

  sleep(Duration(seconds: 5));

  try {
    final String url = 'https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s';
    final response = await http.get(Uri.parse(url));

    if (response.statusCode != 200) {
      throw Exception("Failed to fetch JSON file: ${response.reasonPhrase}");
    }

    if (!response.body.contains("data")) {
      throw Exception('⛔ JSON does not have a "data" property at its root.');
    }

    final Map<String, dynamic> data = jsonDecode(response.body)["data"];

    final downloadDir = Directory("downloads");

    if (!downloadDir.existsSync()) {
      downloadDir.createSync(recursive: true);
      print("📁 Created directory: ${downloadDir}`");
    }

    for (String key in data.keys) {
      final subDir = Directory("${downloadDir.path}/$key");
      if (!subDir.existsSync()) {
        subDir.createSync(recursive: true);
      }

      Map<String, dynamic> subproperty = data[key];

      for (String subKey in subproperty.keys) {
        final String imageURL = subproperty[subKey];
        final uri = Uri.parse(imageURL);

        final String ext = path.extension(uri.path).isNotEmpty ? path.extension(uri.path) : '.jpg';
        final String filename = "${subKey}${ext}";
        final String filePath = path.join(subDir.path, filename);
        await downloadImage(uri, filePath);
        print("🖼️ Saved image to ${filePath}");
        sleep(Duration(milliseconds: 250));
      }
    }
  } catch (e) {
    print("Error: $e");
  }
}

Future<void> downloadImage(Uri uri, String savePath) async {
  final response = await http.get(uri);

  if (response.statusCode != 200) {
    throw Exception("Failed to download image: ${response.reasonPhrase}");
  }

  final file = File(savePath);

  await file.writeAsBytes(response.bodyBytes);
}

void ascii_art() {
  print("""
 /\$\$      /\$\$ /\$\$   /\$\$ /\$\$\$\$\$\$\$   /\$\$\$\$\$\$  /\$\$\$\$\$\$\$
| \$\$\$    /\$\$\$| \$\$  /\$\$/| \$\$__  \$\$ /\$\$__  \$\$| \$\$__  \$\$
| \$\$\$\$  /\$\$\$\$| \$\$ /\$\$/ | \$\$  \\ \$\$| \$\$  \\__/| \$\$  \\ \$\$
| \$\$ \$\$/\$\$ \$\$| \$\$\$\$\$/  | \$\$\$\$\$\$\$ |  \$\$\$\$\$\$ | \$\$  | \$\$
| \$\$  \$\$\$| \$\$| \$\$  \$\$  | \$\$__  \$\$ \\____  \$\$| \$\$  | \$\$
| \$\$\\  \$ | \$\$| \$\$\\  \$\$ | \$\$  \\ \$\$ /\$\$  \\ \$\$| \$\$  | \$\$
| \$\$ \\/  | \$\$| \$\$ \\  \$\$| \$\$\$\$\$\$\$/|  \$\$\$\$\$\$/| \$\$\$\$\$\$\$/
|__/     |__/|__/  \\__/|_______/  \\______/ |_______/""");
  print("");
  print("🤑 Starting downloads from your favorite sellout grifter's wallpaper app...");
}
