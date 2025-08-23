import {
    of,
    from,
    scan,
    mergeMap,
    concatMap,
    delay,
    interval,
    fromEventPattern,
    Observable,
    map,
    merge,
    fromEvent,
} from "rxjs";
import {
    HandleViewBanAdd,
    HandleViewBanRemove,
    HandleViewClearBans,
} from "./state.js";
import type { Action, ViewActionReq } from "./types.js";

console.log("Index");

// References for popup view elems ///////////////////////////////////////////
const inputAddBan: HTMLInputElement = document.getElementById(
    "inputBanSite",
)! as HTMLInputElement;

const banSiteBtn: HTMLElement = document.getElementById(
    "submitBanBtn",
)! as HTMLButtonElement;

const inputRemoveBan: HTMLInputElement = document.getElementById(
    "inputRemoveBanSite",
)! as HTMLInputElement;

const unbanSiteBtn: HTMLElement = document.getElementById(
    "removeBanBtn",
)! as HTMLButtonElement;

const clearBansBtn: HTMLElement = document.getElementById("clearAllBansBtn")!;

// Streams created from user interactions with view
// NOTE: These streams are used to send JSON messages to the background service worker
// So, a problem that arises is that Action class instances cannot be sent through json
// So, had to create an object type for the JSON message and a map to map arbitrary strings -> Action class references (see types.ts)
const usrAddBan$: Observable<ViewActionReq> = fromEvent(
    banSiteBtn,
    "click",
).pipe(map(_ => ({ action: "VIEW_ADD_BAN", ban: inputAddBan.value })));

const usrRemoveBan$: Observable<ViewActionReq> = fromEvent(
    unbanSiteBtn,
    "click",
).pipe(map(_ => ({ action: "VIEW_REMOVE_BAN", ban: inputRemoveBan.value })));

const usrClearBan$: Observable<ViewActionReq> = fromEvent(
    clearBansBtn,
    "click",
).pipe(map(_ => ({ action: "VIEW_CLEAR_BANS", ban: "" })));

// Side effect: runtime message sent, changing global browser state
// For any user input in the popup view, send message to background, who will pipe this stream into Actions and then reduce state
merge(usrAddBan$, usrRemoveBan$, usrClearBan$).subscribe(
    (action: ViewActionReq) => chrome.runtime.sendMessage(action),
);
