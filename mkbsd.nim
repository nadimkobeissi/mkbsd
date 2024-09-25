# Licensed under the WTFPL License

import chronos/apps/http/httpclient, std/[json, os, strformat]

const url = "https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s"

proc download_image(session: HttpSessionRef, image_url, file_path: string) {.async.} =
  try:
    let resp = await session.fetch(parseUri image_url)
    if resp.status == 200:
      writeFile(file_path, resp.data)
    else:
      echo &"Error downloading {image_url}: {resp.status}"
  except CatchableError as e:
    echo &"Error downloading image {image_url}: {e.msg}"

proc main() {.async.} =
  let session = HttpSessionRef.new()

  try:
    let resp = await session.fetch(parseUri(url))
    if resp.status != 200:
      raise (ref CatchableError)(msg: &"⛔ Failed to fetch JSON file: {resp.status}")

    let data = parseJson(bytesToString(resp.data)){"data"}
    if data == nil:
      raise
        (ref CatchableError)(msg: "⛔ JSON does not have a data property at its root.")

    let download_dir = getCurrentDir() / "downloads"
    if existsOrCreateDir(download_dir):
      echo &"📁 Created directory: {download_dir}"

    var file_index = 1
    for key, subproperty in data.pairs():
      if subproperty{"dhd"} != nil:
        let image_url = subproperty{"dhd"}.getStr()
        echo "🔍 Found image URL!"
        let parsed_url = parseUri(image_url)
        let ext = os.splitFile(parsed_url.path).ext
        let filename = &"{file_index}{ext}"
        let file_path = download_dir / filename

        await download_image(session, image_url, file_path)
        echo &"🖼️ Saved image to {file_path}"

        file_index += 1
        await sleepAsync(250.millis)
  except CatchableError as e:
    echo &"Error: {e.msg}"

proc ascii_art() =
  echo """
 /$$      /$$ /$$   /$$ /$$$$$$$   /$$$$$$  /$$$$$$$
| $$$    /$$$| $$  /$$/| $$__  $$ /$$__  $$| $$__  $$
| $$$$  /$$$$| $$ /$$/ | $$  \\ $$| $$  \\__/| $$  \\ $$
| $$ $$/$$ $$| $$$$$/  | $$$$$$$ |  $$$$$$ | $$  | $$
| $$  $$$| $$| $$  $$  | $$__  $$ \\____  $$| $$  | $$
| $$\\  $ | $$| $$\\  $$ | $$  \\ $$ /$$  \\ $$| $$  | $$
| $$ \\/  | $$| $$ \\  $$| $$$$$$$/|  $$$$$$/| $$$$$$$/
|__/     |__/|__/  \\__/|_______/  \\______/ |_______/

🤑 Starting downloads from your favorite sellout grifter"s wallpaper app...
"""

ascii_art()
os.sleep(5)
waitFor main()
