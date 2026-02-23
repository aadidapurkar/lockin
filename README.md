# [Lockin](https://chromewebstore.google.com/detail/lockin/ekclemfcpeipfokbhiebmppdpecmapeh)

### Prereqs (Running Live)
-   have a chromium based browser
- then, [download from webstore](https://chromewebstore.google.com/detail/lockin/ekclemfcpeipfokbhiebmppdpecmapeh)
### Prereqs (Running Locally)
-   have [npm/node.js installed](https://nodejs.org/en/download)
-   have a chromium based browser
-   clone repo &rarr run `npm i` &rarr `npm run ai3` &rarr load `dist` folder as unpacked extn in browser

### Code Structure

-   `types.ts` - state definitions and constats
-   `main.ts` - behaviour for popup page of extn
-   `util.ts` - util functions, mostly interacting with chrome apis
-   `service_worker.ts` - behaviour for background of extn (enforcing restrictions)

### Build

`npm run ai3` - compiles extn in to vanilla html/css/js to `dist` folder which can be loaded in chrome
