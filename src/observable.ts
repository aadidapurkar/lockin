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
import { HandleTabCreation, HandleTabBan } from "./state.js";
import type { Action, onCommited } from "./types.js";

export const tabCreated$: Observable<Action> =
    fromEventPattern<chrome.tabs.Tab>(
        f => chrome.tabs.onCreated.addListener(f),
        f => chrome.tabs.onCreated.removeListener(f),
    ).pipe(map(_ => new HandleTabCreation()));

export const tabChangedURL$: Observable<Action> = fromEventPattern<onCommited>(
    f => chrome.webNavigation.onCommitted.addListener(f),
    f => chrome.webNavigation.onCommitted.removeListener(f),
).pipe(map((obj: onCommited) => new HandleTabBan(obj.url, obj.tabId)));
