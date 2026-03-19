import { storageKeys, defaultStorage, type State } from "./types.ts";
import {
    delay,
    extnOrigin,
    getCurrentTab,
    getState,
    getTabCount,
    getTabs,
    initialiseState,
    stateExists,
} from "./util.ts";

const handleInitial = async () => {
    const exists = await stateExists();

    // First time load - Case state doesn't exist - initialise and set state
    if (!exists) {
        initialiseState();
    }

    // If state exists, validate and fix tabLimit if invalid
    const state = await getState();
    if (state.tabLimit < 1) {
        await chrome.storage.local.set({ tabLimit: defaultStorage.tabLimit });
        //console.log("Invalid tabLimit detected and reset to default.");
    }
};
handleInitial().catch(console.error);;

// EVENT LISTENER - Enforce tab limit
chrome.tabs.onCreated.addListener(async info => {
    const state = await getState();

    const tabCount = await getTabCount();

    if (tabCount >= state.tabLimit) {
        const tabs = await getTabs();
        const tabsToClose = tabs.slice(state.tabLimit, tabs.length);

        chrome.tabs.remove(tabsToClose.map(tab => tab.id!));
    }

    const tabData = await chrome.tabs.get(info.id!);
    const state2 = await getState();
    const exists = await stateExists();
    if (!exists) {
        await chrome.storage.local.set(defaultStorage);
    }
    enforceLock(info.id!, tabData, info, state, extnOrigin);
});

// EVENT LISTENER - Enforce site bans
chrome.webNavigation.onBeforeNavigate.addListener(async details => {
    const state = await getState();

    state.bannedSites.map(site => {
        if (details.url.includes(site)) {
            chrome.tabs.remove(details.tabId);
        }
    });
});

// EVENT LISTENER - Enforce tab lock "Early Bird" listener
chrome.tabs.onHighlighted.addListener(async info => {
    const state = await getState();

    // onHighlighted gives an array of IDs (for multi-select), we check the first
    const highlightedTabId = info.tabIds[0];
    const tabData = await chrome.tabs.get(highlightedTabId);
    enforceLock(highlightedTabId, tabData, info, state, extnOrigin);
});

// EVENT LISTENER - Enforce tab lock
chrome.tabs.onActivated.addListener(async info => {
    //console.log("Tab activation detected");

    const tabData = await chrome.tabs.get(info.tabId);
    const state = await getState();

    const exists = await stateExists();
    if (!exists) {
        await chrome.storage.local.set(defaultStorage);
    }
    // each of the below condition tries to validate that the tab just activated/created is a 'naughty' tab
    // if any of the conditions fail then the tab lock integrity is fine and we dont need to do whats in the innermost condition (switch back)

    enforceLock(info.tabId, tabData, info, state, extnOrigin);
});

const enforceLock = async (
    currentTabId: number,
    tabData: chrome.tabs.Tab,
    info:
        | chrome.tabs.OnActivatedInfo
        | chrome.tabs.Tab
        | chrome.tabs.OnHighlightedInfo,
    state: State,
    extnOrigin: string,
) => {
    // Condition 0 - The URL does not belong to the extension itself (need to whitelist extn so user can turn tab lock off)
    if (tabData.url && !tabData.url.startsWith(extnOrigin)) {
        //const currentTabId = 'tabId' in info ? info.tabId : info.id;
        // Condition 1 - There has been a lock previously set for this window and is currently set
        if (
            info.windowId in state.lock &&
            state.lock[info.windowId][0] === true
        ) {
            //console.log("Condition 1 met");

            // Condition 2 - The activated tab is not the locked tab, and the window is locked
            if (currentTabId !== state.lock[info.windowId][1]) {
                //console.log("Condition 2 met");
                const lockedTabId = state.lock[info.windowId][1];

                // DETECTED that the current tab is naughty
                // Retry switching back sequentially up to 10 times
                for (let i = 0; i < 10; i++) {
                    const tbs = await chrome.tabs.query({
                        active: true,
                        windowId: info.windowId,
                    });
                    const activeTabId = tbs[0]?.id;
                    if (activeTabId === lockedTabId) {
                        break; // Already switched; no need to continue
                    }
                    try {
                        await chrome.tabs.update(lockedTabId, { active: true });
                        break; // Success; exit the loop
                    } catch (error) {
                        //console.log("Error switching to locked tab:", error);
                        await delay(50); // Wait before next attempt
                    }
                }
            }
        }
    }
};

// 
const enforceLockPoll = async () => {
    const state = await getState();

    const exists = await stateExists();
    if (!exists) {
        await chrome.storage.local.set(defaultStorage);
    }
    const tab = await getCurrentTab();
    if (!tab) {
        //console.log("No tab in focus (Are you looking at DevTools?)");
        return;
    }
    enforceLock(tab.id!, tab, tab, state, extnOrigin);
};



// EVENT LISTENER / POLLER - Enforce tab lock every 1500ms 
// NOTE - Try and optimise this to increase efficiency and reduce battery drain potential
// Why? - There is a fatal flaw in the Chrome Extension API that allows the user to cheat their way into unlocking a tab
// By hogging the input and holding down mouse1 on another tab to beat the tab lock.
// Tab state cannot be changed by the service worker during this time because the Chrome API rejects it for the reason 'user is dragging a tab'
// The best fix I can think of is to poll every 1500ms (maybe less often would be ideal for cases of laptops who dont want excessive power usage)
// The poll effectively handles the case where the user has used the cheat
// It also seems to handle the case where the user drag opens a bookmark in a new tab to defeat the tab lock
setInterval(enforceLockPoll, 1500);


// Bug fix (https://github.com/aadidapurkar/lockin/issues/1)
chrome.tabs.onRemoved.addListener(
  async (tabId : number, removeInfo : any) => {
        console.log(`DEBUG EVENT`)
        // The way i've stored the lock state is not compatible to hand this bug efficiently
        // Would need a refactor for how the lock state is stored
        const localStorageLockState = (await getState()).lock // note that this is potentially mutated inside the for loop 

        const removedWindowId : number = removeInfo.windowId 

        for (const [windowId, [lockState, lockedTabId]] of Object.entries(localStorageLockState)) {
            console.log(`\t DEBUG windowId${windowId} lockState${lockState} lockedTabId${lockedTabId}`)
            if (Number(windowId) == removedWindowId) {
                if (lockedTabId == tabId) {
                    // Detected that the locked tab was closed
                    console.log(`DEBUG detected locked tab was closed, need to update local storage and refresh ui`)
                    // can this happen while the popup happens? if so need to somehow refresh() popup again in main.ts
                    localStorageLockState[Number(windowId)] = [false, -1]
                    await chrome.storage.local.set({lock: localStorageLockState})
                    await chrome.action.setIcon({path: "./icon.png"})
                }   
            }
        }
  }
)