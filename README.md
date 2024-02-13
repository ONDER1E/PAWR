# PAWR - PTFS ATC Workload Reducer

PAWR is a tool designed to reduce the workload of Air Traffic Controllers (ATC) on Discord. It achieves this by handling various tasks such as breaking Discord's Terms of Service (TOS), listing flight plans that're only associated with your airport, and more.

## Configuration Instructions (config.json):

1. Edit the file `config.json`.
2. Set "Token" to your Discord token. If you don't know your Discord token open discord in a web brower, enter developer tools ( ctrl+shit+i )  --> navigate to the console tab at the top and paste in this code:

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
3. Set `"listen_to_arrival"` to `"false"` if your a ground controller so you don't recieve the flight plans of planes that are arriving since your only job is to talk to those who are taxing/pushing back and those who want their IFR/VFR clearance
4. Set `"departure_is_with"` to `"Tower"` if you're a ground controller
5. Set `"airport"` to your ICAO airport code
6. Set `"default_runway"` to the runway you're normally gonna use for departures

## Instructions for use:
1. If you haven't already install the **latest release from this repo** ( bottom right of your screen ), **node.js**, **python** and the following dependencies using cmd:
```js
npm i discord.js-selfbot-v13
winget install "FFmpeg (Essentials Build)"
```
2. After configuring `config.json` extract the release you've just downloaded.
3. Open the release you've just downloaded and run start.bat.
4. You might get a firewall prompt for python, allow it.
5. Go on your web brower and enter [http://](http://localhost:8000/). 
6. To stop the code press close the two teminals that open when you opened start.bat.
