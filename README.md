# Lockin

### Prereqs

-   node, chromium browser
-   `npm i`

### Code Structure

-   `types.ts` - state definitions and constats
-   `main.ts` - behaviour for popup page of extn
-   `util.ts` - util functions, mostly interacting with chrome apis
-   `service_worker.ts` - behaviour for background of extn (enforcing restrictions)

### Build

`npm run ai2` - compiles extn in to vanilla html/css/js which can be loaded in chrome
