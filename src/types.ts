// Constants

// An array of all storage keys used in the extension
export const storageKeys: (keyof State)[] = ["lock", "tabLimit", "bannedSites"];
// An object which maps keys to default values for initialising local storage
export const defaultStorage = {
    lock: {},
    tabLimit: 999,
    bannedSites: [],
};

// Types

export type State = {
    lock: { [key: number]: [boolean, number] }; // An object mapping window IDs to a tuple (first element: whether window is locked, second element: tab ID)
    tabLimit: number; // Maximum number of tabs allowed
    bannedSites: string[]; // An array of banned site URLs / substrings
};
