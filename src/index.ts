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

console.log("Index");

const inputBan: HTMLInputElement = document.getElementById(
    "inputBanSite",
)! as HTMLInputElement;
const banSiteBtn: HTMLElement = document.getElementById("submitBanBtn")!;

const unbanSiteBtn: HTMLElement = document.getElementById("removeBanBtn")!;
const clearBansBtn: HTMLElement = document.getElementById("cleearAllBansBtn")!;

const banNewSite$ = fromEvent<MouseEvent>(banSiteBtn, "click").pipe(
    map(_ => inputBan.value),
);
