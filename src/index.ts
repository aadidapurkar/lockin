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
import type { Action } from "./types.js";

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

// User interacts with view to make changes in state
const usrAddBan$: Observable<Action> = fromEvent(banSiteBtn, "click").pipe(
    map(_ => inputAddBan.value),
    map(newBan => new HandleViewBanAdd(newBan)),
);

const usrRemoveBan$: Observable<Action> = fromEvent(unbanSiteBtn, "click").pipe(
    map(_ => inputRemoveBan.value),
    map(newBan => new HandleViewBanRemove(newBan)),
);

const usrClearBan$: Observable<Action> = fromEvent(clearBansBtn, "click").pipe(
    map(_ => new HandleViewClearBans()),
);

merge(usrAddBan$, usrRemoveBan$, usrClearBan$).subscribe(
    async (action: Action) => {
        // Message sender
        const { statusCode } = await chrome.runtime.sendMessage({
            action: action,
        });
    },
);
