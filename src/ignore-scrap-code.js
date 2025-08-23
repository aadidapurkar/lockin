//Observable<onUpdated>
// const tabsChanged$: Observable<string> = fromEventPattern<onUpdated>(
//     f => chrome.tabs.onUpdated.addListener(f),
//     f => chrome.tabs.onUpdated.removeListener(f),
// ).pipe(map(_ => "Tab Changed"));
