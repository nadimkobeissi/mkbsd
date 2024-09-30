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
2. Run `node mkbsd.js`
3. Wait a little.
4. All wallpapers are now in a newly created `downloads` subfolder.

### Running in Python

1. Ensure you have Python installed.
2. Ensure you have the `aiohttp` Python package installed (`pip install aiohttp`).
3. Run `python mkbsd.py`
4. Wait a little.
5. All wallpapers are now in a newly created `downloads` subfolder.

### Running using docker

1. Ensure you have docker installed
2. Build the image with `docker build -t mkbsd .`
3. Run the image, mounting a directory where you want the image to be stored as a volume at `/app/downloads`. For example, `docker run -v $PWD:/app/downloads mkbsd`

## FAQ

### Q: What's the story behind this?

On September 24th, 2024, well-known tech YouTuber MKBHD released Panels, a wallpaper app that:

- Had insanely invasive, unjustified tracking including for location history and search history.
- Charged artists a predatory 50% commission (even Apple takes only 30% for app purchases).
- Forced you to watch two ads for every wallpaper that you wanted to download, and then only letting you download it in SD.
- Gatekept all HD wallpapers behind a **fifty dollars a year subscription**.
- Had many wallpapers that were essentially AI-generated slop or badly edited stock photos.

Especially given MKBHD's previous criticism of substandard companies and products, people justifiably got upset given that this looked like a pretty blatant grift and cash-grab that is exploitative of the fan base that's trusted his editorial integrity over the past fifteen years. However, on the same day, MKBHD wrote a post doubling down on the app.

### Q: Aren't you stealing from artists by running this script?

MKBSD accesses publicly available media through the Panels app's own API. It doesn't do anything shady or illegal. The real problem here is Panels and MKBHD's complete inability to provide a secure platform for the artists that they're ~~exploiting~~ working with. Any other app could have avoided the issues that make MKBSD possible had it been engineered competently.

## License

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
