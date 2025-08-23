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
//////////       STATE PROCESSING   ///////////////////////
export type State = {
    bannedSites: string[];
    tabLimit?: number;
    tabCount: number;
    tabLock: boolean;
};

export const initialState: State = {
    bannedSites: ["instagram"],
    tabLimit: 10,
    tabCount: 0,
    tabLock: false,
};

//////     CHROME TYPES /////////
export type onUpdated = [
    tabId: number,
    changeInfo: chrome.tabs.OnUpdatedInfo,
    tab: chrome.tabs.Tab,
];

export type onCommited =
    chrome.webNavigation.WebNavigationTransitionCallbackDetails;

/////////////// ACTION CLASS INTERFACE ///////////////
// Info: Observables will be mapped to classes which extend action
// So in the end, observable emissions will map to a new state
export interface Action {
    apply(s: State): State;
}
