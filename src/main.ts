import { storageKeys, defaultStorage, type State } from "./types.ts";
import {
    getState,
    getTabCount,
    getTabs,
    initialiseState,
    removeAllChildren,
    stateExists,
} from "./util.ts";
// THIS FILE DEFINES BEHAVIOUR FOR THE POPUP PAGE

// HTML elements
const statusDiv = document.getElementById("status")!;
const txtLock = document.getElementById("htmlLockText")!;
const txtLimit = document.getElementById("htmlLimitText")!;
const inpLock = document.getElementById("htmlLockInp")! as HTMLInputElement;
const inpLimit = document.getElementById("htmlLimitInp")! as HTMLInputElement;
const btnSubmitNewLimit = document.getElementById("btnSubmitTabLimit")!;
const inpNewBan = document.getElementById("htmlNewBanInp")! as HTMLInputElement;
const btnSubmitNewBan = document.getElementById("btnSubmitNewBan")!;
const inpUnbanExistingBan = document.getElementById(
    "htmlBanDropdown",
)! as HTMLInputElement;
const btnSubmitUnban = document.getElementById("htmlBtnUnban")!;

// FUNCTION - Function that runs when popup is loaded
// INPUTS - None
// OUTPUTS - None
// SIDE EFFECTS - Updates popup HTML elements such as informative status sentences, checkboxes, dropdown options
const refresh = async () => {
    // Check if state exists in local storage
    const exists = await stateExists();

    // First time load - Case state doesn't exist - initialise and set state
    if (!exists) {
        initialiseState();
    }

    // Get state
    const state = await getState();

    // Refresh tab lock
    const currWindowId = await (
        await chrome.windows.getLastFocused({ populate: false })
    ).id!;

    const focusedWindow = await chrome.windows.getLastFocused({
        populate: true,
    });
    const activeTab = focusedWindow.tabs?.find(tab => tab.active);
    const activeTabId = activeTab!.id;

    const tabLocked =
        currWindowId in state.lock && state.lock[currWindowId][0] === true;

    if (tabLocked) {
        txtLock.innerText = "This tab in this window is locked";
        inpLock.checked = true;
        statusDiv.style.backgroundColor = "#ff8826"
    } else {
        txtLock.innerText = "This tab in this window is not locked";
         statusDiv.style.backgroundColor = "#90ee90"
    }

    // Refresh tab limit text
    if (state.tabLimit === 999) {
        txtLimit.innerText = "Tab limit is unlimited";
    } else {
        txtLimit.innerText = `Tab limit is ${state.tabLimit}`;
    }

    // Refresh bans (select options in dropdown)
    removeAllChildren(inpUnbanExistingBan);
    const placeholderOption = document.createElement("option");
    placeholderOption.selected = true;
    placeholderOption.disabled = true;
    placeholderOption.text = "Select";//"Select a site to unban";
    inpUnbanExistingBan.appendChild(placeholderOption);
    state.bannedSites.map(site => {
        const option = document.createElement("option");
        option.text = site;
        option.value = site;

        inpUnbanExistingBan.appendChild(option);
    });
};

// EVENT LISTENER
// When lock checkbox is changed, update local storage keys lock (which is an object mapping window IDs to [boolean, tabID])
// Semantic change - The tab in this window is locked/unlocked
inpLock.addEventListener("change", async () => {
    const state = await getState();

    const currWindowId = await (
        await chrome.windows.getLastFocused({ populate: false })
    ).id!;

    const focusedWindow = await chrome.windows.getLastFocused({
        populate: true,
    });
    const activeTab = focusedWindow.tabs?.find(tab => tab.active);
    const activeTabId = activeTab!.id;

    await chrome.storage.local.set({
        lock: { ...state.lock, [currWindowId]: [inpLock.checked, activeTabId] },
    });
});

// EVENT LISTENER
// When new tab limit is submitted, update local storage key tabLimit
// Semantic change - When n+1th tab is opened, close it
btnSubmitNewLimit.addEventListener("click", async () => {
    // prevent user from bricking their browser by checking tab limit provided >= 1
    // before this check, if a user entered a tab limit like 0, they would have had to delete and relogin chrome profile or delete local extn code files
    if (inpLimit.valueAsNumber >= 1 && inpLimit.checkValidity()) {
        await chrome.storage.local.set({ tabLimit: inpLimit.value });

    } else {
        alert("You set an invalid tab limit and this was not put through.")
        return
    }
    // Remove excess tabs
    const state = await getState();

    const tabCount = await getTabCount();
    if (tabCount > state.tabLimit) {
        const tabs = await getTabs();
        const tabsToClose = tabs.slice(state.tabLimit, tabs.length);
        chrome.tabs.remove(tabsToClose.map(tab => tab.id!));
    }
});

// EVENT LISTENER
// When new ban is submitted, update local storage key bannedSites
// Semantic change - When user navigates to banned site, close tab
btnSubmitNewBan.addEventListener("click", async () => {
    const state = await getState();

    await chrome.storage.local.set({
        bannedSites: state.bannedSites.concat([inpNewBan.value]),
    });
});

// EVENT LISTENER
// When unban is submitted, update local storage key bannedSites
// Semantic change - When user navigates to unbanned site, allow tab to stay open
btnSubmitUnban.addEventListener("click", async () => {
    const state = await getState();

    await chrome.storage.local.set({
        bannedSites: state.bannedSites.filter(
            site => site !== inpUnbanExistingBan.value,
        ),
    });
});

// EVENT LISTENER
// When local storage is changed, refresh popup to reflect changes (e.g unban a site --> semantic effect of the site no longer being an option in the dropdown)
chrome.storage.onChanged.addListener((_, __) => {
    refresh();
});

// Initial call of refresh - for when popup is opened
refresh();



// UX Optimisations - when enter is keyed, get the active input html element and submit