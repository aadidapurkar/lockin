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
    shareReplay,
    startWith,
    switchMap,
} from "rxjs";
import type { Action, navCommit } from "./types.js";
import { HandleTabBan } from "./state.js";

// Observable of actions that emits every time the browser makes a navigation commit (basically a tabtries to load some url)
export const navCommit$: Observable<Action> = fromEventPattern<navCommit>(
    f => chrome.webNavigation.onCommitted.addListener(f),
    f => chrome.webNavigation.onCommitted.removeListener(f),
).pipe(
    map((obj: navCommit) => ({ url: obj.url, tabId: obj.tabId })),
    map(({ url, tabId }) => new HandleTabBan(url, tabId)),
);

export const viewReqStateUpdate$: Observable<Action> = fromEventPattern(
    f => chrome.runtime.onMessage.addListener(f),
    f => chrome.runtime.onMessage.removeListener(f),
).pipe();
