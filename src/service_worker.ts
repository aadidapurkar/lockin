import { from } from "rxjs";
import { storageKeys, defaultStorage, type State } from "./types.ts";
import {
    delay,
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
};
handleInitial();

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
    const extnOrigin = `chrome-extension://${chrome.runtime.id}`;
    enforceLock(tabData, info, state, extnOrigin)
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

// EVENT LISTENER - Enforce tab lock
chrome.tabs.onActivated.addListener(async info => {
    console.log("Tab activation detected");

    const tabData = await chrome.tabs.get(info.tabId);
    const state = await getState();

    const exists = await stateExists();
    if (!exists) {
        await chrome.storage.local.set(defaultStorage);
    }
    // each of the below condition tries to validate that the tab just activated/created is a 'naughty' tab
    // if any of the conditions fail then the tab lock integrity is fine and we dont need to do whats in the innermost condition (switch back)

    const extnOrigin = `chrome-extension://${chrome.runtime.id}`;
    enforceLock(tabData, info, state, extnOrigin)
});


const enforceLock = async (tabData : chrome.tabs.Tab, info : chrome.tabs.OnActivatedInfo | chrome.tabs.Tab, state : State, extnOrigin : string) => {
    // Condition 0 - The URL does not belong to the extension itself (need to whitelist extn so user can turn tab lock off)
    if (tabData.url && !tabData.url.startsWith(extnOrigin)) {
        const currentTabId = 'tabId' in info ? info.tabId : info.id;
        // Condition 1 - There has been a lock previously set for this window and is currently set
        if (info.windowId in state.lock && state.lock[info.windowId][0] === true) {
            console.log("Condition 1 met");

            // Condition 2 - The activated tab is not the locked tab, and the window is locked
            if (currentTabId !== state.lock[info.windowId][1]) {
                console.log("Condition 2 met");
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
                        console.log("Error switching to locked tab:", error);
                        await delay(50); // Wait before next attempt
                    }
                }
            }
        }
    }
}