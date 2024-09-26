@echo off
:: Ensure the script runs in the directory where it's located
cd /d %~dp0

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed. Please install Python and try again.
    pause
    exit /b
)

:: Check if aiohttp is installed
pip show aiohttp >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing aiohttp package...
    pip install aiohttp
)

:: Run the Python script mkbsd.py
echo Running mkbsd.py...
python mkbsd.py

:: Wait for a few seconds to ensure all processes complete
echo Waiting for the process to finish...
timeout /t 5 /nobreak >nul

:: Notify user
echo All wallpapers are now in the newly created downloads subfolder.
pause
