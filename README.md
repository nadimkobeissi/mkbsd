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

MKBSD comes in three variants! Node.js, Python, and Rust.

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

### Running in Rust

1. **Install Rust and Cargo**
   - If you haven't already, install Rust and Cargo by following the instructions at [rustup.rs](https://rustup.rs/).

2. **Navigate to the Rust Implementation Directory**
   - Open your terminal or command prompt.
   - Navigate to the directory containing the Rust implementation (e.g., `mkbsd.rs` or the Cargo project folder).

3. **Build the Project**
   - Run the following command to build the project in release mode:

     ```bash
     cargo build --release
     ```

     - This will create an optimized executable in the `target/release` directory.

4. **Run the Executable**
   - After building, run the executable:

     - On Linux/macOS:

       ```bash
       ./target/release/mkbsd
       ```

     - On Windows:

       ```bash
       .\target\release\mkbsd.exe
       ```

5. **Wait for the Process to Complete**
   - The program will start downloading wallpapers. Wait until it finishes.

6. **Find Your Wallpapers**
   - All wallpapers are now in a newly created `downloads` subfolder.

## FAQ

### Q: What's the story behind this?

On September 24th, 2024, a well-known tech personality released a wallpaper app that:

- Included invasive tracking features.
- Charged artists a high commission fee.
- Required users to watch multiple ads for each wallpaper download, offering only low-resolution images.
- Locked high-resolution wallpapers behind an expensive subscription.
- Featured wallpapers that were of questionable quality.

This project was created as a response to those practices, aiming to provide users with access to wallpapers without such limitations.

### Q: Aren't you stealing from artists by running this script?

MKBSD accesses publicly available media through the app's own API. It doesn't do anything illegal or unethical. The script highlights issues in the app's design regarding content accessibility. Ideally, apps should ensure secure platforms for artists to protect their work.

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
