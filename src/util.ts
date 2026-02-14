import { defaultStorage, storageKeys, type State } from "./types";

// FUNCTION - Remove all children of a parent HTML element
// INPUTS - Parent HTML element
// OUTPUTS - None
// SIDE EFFECTS - Removes all children of parent element
export const removeAllChildren = (parent: HTMLElement) => {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
};

// FUNCTION - Get current state from local storage
// INPUTS - None
// OUTPUTS - State object
// SIDE EFFECTS - None
export const getState = async () => {
    return (await chrome.storage.local.get(storageKeys)) as State;
};

// FUNCTION - Get all tabs
// INPUTS - None
// OUTPUTS - Array of Tab objects
// SIDE EFFECTS - None
export const getTabs = async () => {
    const tabs = await chrome.tabs.query({});
    return tabs;
};

// FUNCTION - Get the currently focused tab
// INPUTS - None
// OUTPUTS - Single Tab object (or undefined)
// SIDE EFFECTS - None
export const getCurrentTab = async () => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    return tab;
};

// FUNCTION - Get current tab count
// INPUTS - None
// OUTPUTS - Number of tabs
// SIDE EFFECTS - None
export const getTabCount = async () => {
    const tabs = await chrome.tabs.query({});
    return tabs.length;
};

// FUNCTION - Check that state has been initialised previously in local storage
// INPUTS - None
// OUTPUTS - Boolean
// SIDE EFFECTS - None
export const stateExists: () => Promise<boolean> = async () => {
    const resObj = await chrome.storage.local.get(storageKeys);
    return storageKeys.reduce(
        (acc: boolean, key: string) => (key in resObj ? acc : false),
        true,
    );
};

// FUNCTION - Delay execution for a given number of milliseconds
// INPUTS - Number of milliseconds
// OUTPUTS - Promise that resolves after given time
// SIDE EFFECTS - None
export const delay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// FUNCTION - Set default state values in local storage, Used for first time loading of extension
// INPUTS - None
// OUTPUTS - None
// SIDE EFFECTS - Sets local storage values
export const initialiseState: () => Promise<void> = async () => {
    await chrome.storage.local.set(defaultStorage);
};


export const extnOrigin = `chrome-extension://${chrome.runtime.id}`;