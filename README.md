**run the extension**

- npm i <br>
- npm run dev <br>
- load root folder as unpacked extension in chrome://extensions <br>
  <br>

**note**
<br>

- npm run dev only compiles ts files into usable js files for browser <br>
- background script might not respond to changes until you remove extension and reload it into the browser <br>
- chrome.runtime.reload() in any console to reload bg scripts w/o having to do ^^
  <br>

(ignore) useful commands

- npm init <br>
- npm init -y (skip terminal inputs) <br>
- npm install --save-dev typescript <br>
- npm install -g typescript <br>
- npx tsc --init <br>
- npx tsc <br>
- tsc --watch <br>
- npm install --save-dev @types/chrome <br>
- npm i -D @types/chrome <br>
