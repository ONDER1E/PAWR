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
