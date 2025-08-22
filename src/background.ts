import { of, from, scan, mergeMap, concatMap, delay, interval } from "rxjs";

console.log("Background");

interval(5000).subscribe(console.log);
