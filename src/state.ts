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
