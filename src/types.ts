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
    HandleTabBan,
    HandleViewBanAdd,
    HandleViewBanRemove,
    HandleViewClearBans,
} from "./state.js";

// STATE
export type State = {
    /**
     * Values of arr represent banned websites
     * e.g "insta" / "instagram" / "https://instagram.com"
     */
    bans: string[];

    /**
     * Defines a limit for total tab count
     * e.g limit is 15 -> a 16th tab is opened -> the 16th tab is closed
     */
    limit?: number;

    /**
     * Defines whether a particular tab's focus should be locked
     * If so, then we need an additional value, the tabId to lock to.
     */
    lock: false | [true, number];

    /**
     * Defines the number of tabs currently opened
     * e.g open = 5, limit = 5 ->  new tab is opened -> close it
     */
    open: number;

    /**
     * Defines a tabId that should be closed
     * e.g banned site opened -> add to exit -> side effect: tab removal in subscribe call of master state stream
     */
    exit?: number | null;
};

// CHROME EVENT TYPES
export type navCommit =
    chrome.webNavigation.WebNavigationTransitionCallbackDetails;

// CHROME RUNTIME MESSAGES SENT FROM VIEW
// type of JSON object sent from popup index.html view runtime messsage
export type ViewActionReq =
    | { action: "VIEW_ADD_BAN"; ban: string }
    | { action: "VIEW_REMOVE_BAN"; ban: string }
    | { action: "VIEW_CLEAR_BANS"; ban: string };

// helper object to parse this JSON into Actions in background script (message receiver)
export const actionStringClassMap = {
    VIEW_ADD_BAN: HandleViewBanAdd,
    VIEW_REMOVE_BAN: HandleViewBanRemove,
    VIEW_CLEAR_BANS: HandleViewClearBans,
};
// ACTION TYPE (ALL OBSERVABLES END UP EMITING THIS)
export interface Action {
    apply(s: State): State;
}
