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
import type { Action, State } from "./types.js";

export class HandleTabBan implements Action {
    constructor(
        public readonly url: string,
        public readonly tabId: number,
    ) {}

    apply(s: State): State {
        // Check if any of the banned site URL's include this instance's url
        const tabBanned: boolean = s.bans.reduce(
            (accBan, bannedSite) =>
                this.url.includes(bannedSite) ? true : accBan,
            false,
        );

        return tabBanned ? { ...s, exit: this.tabId } : { ...s, exit: null }; // potential problem, will updating exit to null conflict with other Actions which update exit?
    }
}

export class HandleViewBanAdd implements Action {
    constructor(public readonly newBan: string) {}

    apply(s: State): State {
        return {
            ...s,
            bans: s.bans.concat([this.newBan]),
        };
    }
}

export class HandleViewBanRemove implements Action {
    constructor(public readonly banToRemove: string) {}

    apply(s: State): State {
        return {
            ...s,
            bans: s.bans.filter(ban => ban !== this.banToRemove),
        };
    }
}

export class HandleViewClearBans implements Action {
    constructor() {}

    apply(s: State): State {
        return {
            ...s,
            bans: [],
        };
    }
}
