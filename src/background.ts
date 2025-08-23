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
import type { State } from "./types.js";
import { navCommit$, viewReqStateUpdate$ } from "./observable.js";
import { render } from "./sideEffects.js";
console.log("Background");

/**
 * Note that background service workers in chrome are not persistent
 * Therefore, intialState should ideally be intialised from localStorage
 * Hmm. problem, when the background script is terminated, the reduced state will be lost.
 * That is, unless, you store two copies of state, one in background, one in localStorage, but that seems hard to manage
 */

// Define initial state - hard coding for now
const initialState: State = {
    bans: ["instagram"],
    lock: false,
    open: 0,
    //exit?
    //limit?
};

// Master state steam
const action$ = merge(navCommit$, viewReqStateUpdate$);
const state$ = action$.pipe(
    scan((reducedState, action) => action.apply(reducedState), initialState),
);

state$.subscribe(s => render(s));
