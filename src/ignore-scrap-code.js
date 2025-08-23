//Observable<onUpdated>
// const tabsChanged$: Observable<string> = fromEventPattern<onUpdated>(
//     f => chrome.tabs.onUpdated.addListener(f),
//     f => chrome.tabs.onUpdated.removeListener(f),
// ).pipe(map(_ => "Tab Changed"));

// merge(tabChangedURL$)
//     .pipe(
//         scan(
//             (reducedState: State, action: Action) => action.apply(reducedState),
//             initialState,
//         ),
//     )
//     .subscribe(console.log);


//////////       STATE PROCESSING   ///////////////////////
export type State = {
    bannedSites: string[];
    tabLimit?: number;
    tabCount: number;
    tabLock: boolean;
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


import type { Action, State } from "./types.js";

// export class ClassName implements Action {
//     constructor(url: string) {}

//     apply(s: State): State {
//         return {
//             ...s,
//         };
//     }
// }

export class HandleTabBan implements Action {
    constructor(
        public readonly url: string,
        public readonly tabId: number,
    ) {}

    apply(s: State): State {
        // Check if any of the banned site URL's include this instance's url
        const tabBanned: boolean = s.bannedSites.reduce(
            (accBan, bannedSite) =>
                this.url.includes(bannedSite) ? true : accBan,
            false,
        );
        if (tabBanned) chrome.tabs.remove(this.tabId);

        // If the tab was banned add it to the exit tabs
        return {
            ...s,
        };
    }
}

export class HandleTabCreation implements Action {
    constructor() {}

    apply(s: State): State {
        return {
            ...s,
            tabCount: s.tabCount + 1,
        };
    }
}

export class HandleTabDeletion implements Action {
    constructor() {}

    apply(s: State): State {
        return {
            ...s,
            tabCount: s.tabCount - 1,
        };
    }
}


export const tabCreated$: Observable<Action> =
    fromEventPattern<chrome.tabs.Tab>(
        f => chrome.tabs.onCreated.addListener(f),
        f => chrome.tabs.onCreated.removeListener(f),
    ).pipe(map(_ => new HandleTabCreation()));

export const tabChangedURL$: Observable<Action> = fromEventPattern<onCommited>(
    f => chrome.webNavigation.onCommitted.addListener(f),
    f => chrome.webNavigation.onCommitted.removeListener(f),
).pipe(map((obj: onCommited) => new HandleTabBan(obj.url, obj.tabId)));
