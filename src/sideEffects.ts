import type { State } from "./types.js";

export const render = (s: State) => {
    console.log(s);
    if (s.exit) {
        chrome.tabs.remove(s.exit);
    }
};
