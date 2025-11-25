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
chrome.tabs.onCreated.addListener(async _ => {
    const state = await getState();

    const tabCount = await getTabCount();

    if (tabCount >= state.tabLimit) {
        const tabs = await getTabs();
        const tabsToClose = tabs.slice(state.tabLimit, tabs.length);

        chrome.tabs.remove(tabsToClose.map(tab => tab.id!));
    }
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

    // Condition 0 - The URL is not a chrome:// URL
    if (tabData.url && !tabData.url.startsWith("chrome://")) {
        // Condition 1 - There has been a lock previously set for this window
        if (info.windowId in state.lock) {
            console.log("Condition 1 met");
            // Condition 2 - The activated tab is not the locked tab, and the window is locked
            if (
                info.tabId !== state.lock[info.windowId][1] &&
                state.lock[info.windowId][0] === true
            ) {
                console.log("Condition 2 met");
                const lockedTabId = state.lock[info.windowId][1];

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
});
