# PAWR - PTFS ATC Workload Reducer

PAWR is a tool designed to reduce the workload of Air Traffic Controllers (ATC) on Discord. It achieves this by handling various tasks, such as breaking Discord's Terms of Service (TOS), listing flight plans, and more.

## Configuration Instructions (config.json):

1. Edit the file `config.json`.
2. Set "Token" to your Discord token. If you don't know your Discord token, follow these steps:

```javascript
// Paste this code in the browser console (Ctrl+Shift+I in Chrome) while Discord is open.
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
3. Set `"listen_to_arrival"` to `"false"` if your a ground controller so you don't recieve the flight plans of planes that are arriving since your only job is to talk to those who are taxing/pushing back and those who want their IFR/VFR clearance
4. Set `"departure_is_with"` to `"Tower"` if you're a ground controller
5. Set `"airport"` to your ICAO airport code
6. Set `"default_runway"` to the runway you're normally gonna use for departures

## Instructions for use:
1. If you haven't already install the **latest release from this repo** ( bottom right of your screen ), **vscode**, **node.js**, **python** and the following dependencies using cmd:
```js
npm i discord.js-selfbot-v13
winget install "FFmpeg (Essentials Build)"
```
2. After configuring `config.json` extract the release you've just downloaded.
3. Open `vscode` then open folder by pressing `ctrl+k+o` then navigate to a folder that contains `"main.js"` from the release you've just downloaded.
4. Press `F5` to run `main.js`, now the code is running.
5. View `Departure.yaml` and `Arrival.yaml` in vscode to see a **live update of flight plans** coming to and from your airport.
6. To stop the code press the red square at the top of vscode

7. To delete a flight plan run the script using `F5` if you haven't already and navigate to the terminal tab at the bottom then run this command:
```py
python rm
```
