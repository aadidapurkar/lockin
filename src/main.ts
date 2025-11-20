import { from } from "rxjs";
import { storageKeys, defaultStorage, type State } from "./types.ts";

// THIS FILE DEFINES BEHAVIOUR FOR THE POPUP PAGE

// HTML elements
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

// Check that state has been initialsied previously in local storage
// Should evaluate to false when the extension is first loaded
const stateExists = async () => {
    const resObj = await chrome.storage.local.get(storageKeys);
    return storageKeys.reduce(
        (acc: boolean, key: string) => (key in resObj ? acc : false),
        true,
    );
};

// Set default state values in local storage
// Used for first time loading of extension
const initialiseState = async () => {
    await chrome.storage.local.set(defaultStorage);
};

const getState = async () => {
    return (await chrome.storage.local.get(storageKeys)) as State;
};
// Function that runs when popup is loaded
const refresh = async () => {
    // First time load - check if state exists in local storage
    const exists = await stateExists();

    // Case state doesn't exist - initialise and set state
    if (!exists) {
        initialiseState();
    }

    // Get state
    const state = await getState();

    // Populate status text

    if (state.lock) {
        txtLock.innerText = "Current tab is locked";
    } else {
        txtLock.innerText = "Current tab is not locked";
    }

    if (state.tabLimit === 999) {
        txtLimit.innerText = "Tab limit is unlimited";
    } else {
        txtLimit.innerText = `Tab limit is ${state.tabLimit}`;
    }

    // Fill dropdowns
    state.bannedSites.map(site => {
        const option = document.createElement("option");
        option.text = site;
        option.value = site;

        inpUnbanExistingBan.appendChild(option);
    });
};

inpLock.addEventListener("change", async () => {
    await chrome.storage.local.set({ lock: inpLock.checked });
});

btnSubmitNewLimit.addEventListener("click", async () => {
    await chrome.storage.local.set({ tabLimit: inpLimit.value });
});

btnSubmitNewBan.addEventListener("click", async () => {
    const state = await getState();

    await chrome.storage.local.set({
        bannedSites: state.bannedSites.concat([inpNewBan.value]),
    });
});

btnSubmitUnban.addEventListener("click", async () => {
    const state = await getState();

    await chrome.storage.local.set({
        bannedSites: state.bannedSites.filter(
            site => site !== inpUnbanExistingBan.value,
        ),
    });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    refresh();
});

refresh();
