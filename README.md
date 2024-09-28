```
 /$$      /$$ /$$   /$$ /$$$$$$$   /$$$$$$  /$$$$$$$ 
| $$$    /$$$| $$  /$$/| $$__  $$ /$$__  $$| $$__  $$
| $$$$  /$$$$| $$ /$$/ | $$  \ $$| $$  \__/| $$  \ $$
| $$ $$/$$ $$| $$$$$/  | $$$$$$$ |  $$$$$$ | $$  | $$
| $$  $$$| $$| $$  $$  | $$__  $$ \____  $$| $$  | $$
| $$\  $ | $$| $$\  $$ | $$  \ $$ /$$  \ $$| $$  | $$
| $$ \/  | $$| $$ \  $$| $$$$$$$/|  $$$$$$/| $$$$$$$/
|__/     |__/|__/  \__/|_______/  \______/ |_______/ 
```

_Because selling out is bad_

## How to use

MKBSD comes in two variants! Node.js and Python.

### Running in Node.js

1. Ensure you have Node.js installed.
2. Clone the repository or download the source files.
3. Run `node mkbsd.js`
4. Wait a little.
5. All wallpapers are now in a newly created `downloads` subfolder. The filenames include the artist's name and a unique identifier, helping to give credit to the artist.

### Running in Python

1. Ensure you have Python installed.
2. Ensure you have the `aiohttp` Python package installed (`pip install aiohttp`).
3. Clone the repository or download the source files.
4. Run `python mkbsd.py`
5. Wait a little.
6. All wallpapers are now in a newly created `downloads` subfolder. The filenames include the artist's name and a unique identifier, helping to give credit to the artist.

### Running the Script Again

When you re-run the script, it will automatically check for existing wallpapers in the `downloads` folder and skip any files that have already been downloaded. The script keeps track of previously downloaded files by storing their unique keys in a `downloadedList.json` file. If this file is lost, the script will rebuild it by checking for existing files in the folder and skipping those files to avoid duplicates. This ensures that only new wallpapers are downloaded.

## FAQ

### Q: What's the story behind this?

On September 24th, 2024, well-known tech YouTuber MKBHD released Panels, a wallpaper app that:

- Had insanely invasive, unjustified tracking, including for location history and search history.
- Charged artists a predatory 50% commission (even Apple takes only 30% for app purchases).
- Forced you to watch two ads for every wallpaper that you wanted to download, and then only let you download it in SD.
- Gatekept all HD wallpapers behind a **fifty dollars a year subscription**.
- Featured many wallpapers that were essentially AI-generated content or poorly edited stock photos.

Given MKBHD's previous criticism of substandard companies and products, people were justifiably upset by what appeared to be a blatant cash grab, exploitative of the fan base that had trusted his editorial integrity for over fifteen years. On the same day, MKBHD wrote a post doubling down on the app, which further fueled the controversy.

### Q: Aren't you stealing from artists by running this script?

MKBSD accesses publicly available media through the Panels app's API. It doesn't bypass security or do anything illegal. The real issue lies with Panels and MKBHD's failure to provide a secure platform for the artists they claim to be supporting. The wallpapers are made publicly accessible, and this tool simply automates the download process.

Additionally, as a way to credit the artists, the filenames of the downloaded wallpapers include the artist's name and a unique identifier. This ensures that the artist’s name remains associated with their work, even outside the app.

## License

This project is licensed under the WTFPL License. Including the artist’s name in the file names is intended to help give credit to the original creators of the wallpapers. While this script offers an alternative to the exploitative practices of the Panels app, we encourage everyone to support artists fairly, wherever possible.


```
            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
                    Version 2, December 2004

 Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>

 Everyone is permitted to copy and distribute verbatim or modified
 copies of this license document, and changing it is allowed as long
 as the name is changed.

            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

  0. You just DO WHAT THE FUCK YOU WANT TO.
```
