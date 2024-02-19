#!/bin/bash

start() {
    # Check if Python is installed
    if command -v python3 &>/dev/null; then
        echo "Python is installed"
    else
        echo "Error: Python is not installed"
        read -p "Press enter to continue . . ."
        exit
    fi

    # Check if Node.js or NVM is installed
    if command -v node &>/dev/null; then
        echo "Node.js is installed"
        main
    else
        if command -v nvm &>/dev/null; then
            echo "Error: NVM is installed, but Node.js may not be installed. Use 'nvm install' to install Node.js."
            read -p "Press enter to continue . . ."
            exit
        else
            echo "Node.js or NVM is not installed"
            read -p "Error: Press enter to continue . . ."
            exit
        fi
    fi
}

main() {
    npm i discord.js-selfbot-v13
    pip install flask
    echo "Setup sucessful, run 'sudo apt install ffmpeg' if you haven't already"
}

# Start the script
start
