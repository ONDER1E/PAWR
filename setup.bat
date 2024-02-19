@echo off
setlocal

NET FILE 1>NUL 2>NUL
if '%errorlevel%' == '0' (
    echo Administrative privileges confirmed.
) else (
    echo Please run this script as an administrator.
    echo Right-click on the script file and select "Run as administrator."
    pause
    exit /b 1
)

if not "%1"=="install_ffmpeg" (
    goto install_ffmpeg
)

set "chocoInstalled="
where choco >nul 2>nul
if %errorlevel% equ 0 (
    goto install_ffmpeg
) else (
    goto install_choco
)

endlocal

:install_choco
powershell Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
start setup.bat install_ffmpeg
exit

:install_ffmpeg
choco install ffmpeg -y
goto check_pip

:check_pip
setlocal

set "pythonInstalled="
set "pipInstalled="

for /f "delims=" %%i in ('where python 2^>nul') do set "pythonInstalled=%%i"
for /f "delims=" %%i in ('where pip 2^>nul') do set "pipInstalled=%%i"

if defined pythonInstalled (
    echo Python is installed.
) else (
    echo Error: Python is not installed.
    pause
    exit
)

if defined pipInstalled (
    goto install_flask
) else (
    echo pip is not installed.
    pause
    exit
)

endlocal

:install_flask
pip install flask
goto check_npm

:check_npm
setlocal

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% equ 0 (
    echo Node.js is installed.
) else (
    echo Error: Node.js is not installed, you can get it from here https://nodejs.org/en/download/current.
    pause
    exit
)

:: Check if npm is installed
where npm >nul 2>nul
if %errorlevel% equ 0 (
    goto install_discord
) else (
    echo Error: npm is not installed.
    pause
    exit
)

endlocal

:install_discord
npm i discord.js-selfbot-v13
cls
echo Setup Complete.
pause