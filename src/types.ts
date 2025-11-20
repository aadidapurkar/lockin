// Constants
export const storageKeys: (keyof State)[] = [
    "lock",
    "tabId",
    "tabLimit",
    "bannedSites",
];
export const defaultStorage = {
    lock: false,
    tabId: -1,
    tabLimit: 999,
    bannedSites: [],
};

// Types
export type State = {
    lock: boolean;
    tabId: number;
    tabLimit: number;
    bannedSites: [string];
};
