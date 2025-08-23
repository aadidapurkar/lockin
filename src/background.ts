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
    initialState,
    type Action,
    type onCommited,
    type onUpdated,
    type State,
} from "./types.js";
import { HandleTabBan, HandleTabCreation } from "./state.js";
import { tabChangedURL$, tabCreated$ } from "./observable.js";
console.log("Background");

// Poll to keep backgound script active
interval(5000).subscribe(() => {});

// Merge emissions of Action, starting at an initial state, and applying actions to reduce state
const state$ = merge(tabChangedURL$)
    .pipe(
        scan(
            (reducedState: State, action: Action) => action.apply(reducedState),
            initialState,
        ),
    )
    .subscribe(console.log);

// detect tab count
// detect open sites
// idea
// every time tabs are changed, update current state (add current focused window, current tabs, current window)
// do it by  concatmap that with inner observesables of tabs.query() and get current focused tab (concatmap important for order)
