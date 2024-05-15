# PAWR - PTFS ATC Workload Reducer

PAWR is a tool designed to reduce the workload of Air Traffic Controllers (ATC) on Discord. It achieves this by handling various tasks such as listing flight plans that're only associated with your airport, and more.

## Configuration Instructions (config.json):

1. Copy and paste `config_example.json` into a new file called `config.json` and edit it with the next steps.
2. Set "Token" to your Discord token. If you don't know your Discord token open discord in a web brower, enter developer tools ( ctrl+shit+i )  --> navigate to the console tab at the top and paste in this code (might have to **type** in 'allow pasting' prior):

```javascript
window.webpackChunkdiscord_app.push([
  [Math.random()],
  {},
  req => {
    if (!req.c) return;
    for (const m of Object.keys(req.c)
      .map(x => req.c[x].exports)
      .filter(x => x)) {
      if (m.default && m.default.getToken !== undefined) {
        return copy(m.default.getToken());
      }
      if (m.getToken !== undefined) {
        return copy(m.getToken());
      }
    }
  },
]);
console.log('%cWorked!', 'font-size: 50px');
console.log(`%cYou now have your token in the clipboard!`, 'font-size: 16px');
```
3. Set `"listen_to_arrival": ` to `"false"` if your a ground controller so you don't recieve the flight plans of planes that are arriving since your only job is to talk to those who are taxing/pushing back and those who want their IFR/VFR clearance
4. Set `"departure_is_with": ` to `"Tower"` if you're a ground controller
5. Set `"airport": ` to your ICAO airport code
6. Set `"default_runway": ` to the runway you're normally gonna use for departures

## Instructions for use:
1. I made a setup so you can **skip this step, just run `setup.bat` or `setup.sh` if you're on linux** but if you dont want to run the script then install  **node.js**, **python** and the following dependencies if you haven't already:
```js
// ensure node.js, nvm and python is installed
npm i discord.js-selfbot-v13
pip install flask
// for windows:
winget install "FFmpeg (Essentials Build)"
// for linux:
sudo apt install ffmpeg
```
2. Install the **latest release from this repo** ( bottom right of your screen )
3. Extract the release you've just downloaded and configure `config.json` 
4. Open the release you've just downloaded and run `start.bat` if you're on windows, if you're on linux run `start.sh`
5. You might get a firewall prompt for python, allow it.
6. Go on your web brower and enter [http://localhost:8000/](http://localhost:8000/). 
7. To stop the program go in settings (located bottom left of the GUI) and click **shutdown** but if you're on linux then just close the teminal that appeared when you opened start.bat.
