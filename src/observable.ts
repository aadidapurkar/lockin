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
import {
    actionStringClassMap,
    type Action,
    type navCommit,
    type ViewActionReq,
} from "./types.js";
import { DoNothing, HandleTabBan } from "./state.js";

// Observable of actions that emits every time the browser makes a navigation commit (basically a tabtries to load some url)
export const navCommit$: Observable<Action> = fromEventPattern<navCommit>(
    f => chrome.webNavigation.onCommitted.addListener(f),
    f => chrome.webNavigation.onCommitted.removeListener(f),
).pipe(
    map((obj: navCommit) => ({ url: obj.url, tabId: obj.tabId })),
    map(({ url, tabId }) => new HandleTabBan(url, tabId)),
);

// Stream of incoming messages, keeping only the message
// Note: no response sent
export const viewCreateAction$ = fromEventPattern<
    [ViewActionReq, chrome.runtime.MessageSender, (response?: any) => void]
>(
    handler => chrome.runtime.onMessage.addListener(handler),
    handler => chrome.runtime.onMessage.removeListener(handler),
).pipe(map(([message, sender, sendResponse]) => message));

// Map the abovve stream's JSON emissions into emissions of Actions
export const viewAction$: Observable<Action> = viewCreateAction$.pipe(
    map((a: ViewActionReq) => {
        if (a.action === "VIEW_ADD_BAN") {
            return new actionStringClassMap[a.action](a.ban!);
        }
        if (a.action === "VIEW_REMOVE_BAN") {
            return new actionStringClassMap[a.action](a.ban!);
        }
        if (a.action === "VIEW_CLEAR_BANS") {
            return new actionStringClassMap[a.action]();
        }
        if (a.action === "VIEW_LOCK_TAB") {
            return new actionStringClassMap[a.action](a.lock!, -1);
        } else {
            return new DoNothing();
        }
    }),
);
