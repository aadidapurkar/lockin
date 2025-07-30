// This file runs in the background while chrome is open 
// and does tasks while the user doesn't have the extension popup open

import {retrieveStorage, setStorage, getTabs, removeTab, switchTab, switchWindow} from './helper.js'

// Listeners (these connect the chrome events to the extension behaviour defined by functions in this file)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {route(message);});
chrome.tabs.onCreated.addListener((newTab) => {enforceLimit(newTab);});
chrome.tabs.onActivated.addListener(() => {enforceLockTab();});
chrome.tabs.onUpdated.addListener((newTab) => {enforceLimit(newTab);});
chrome.tabs.onUpdated.addListener(() => {enforceSites();});
chrome.tabs.onCreated.addListener(() => {enforceSites();});
chrome.tabs.onReplaced.addListener(() => {enforceSites();});
chrome.windows.onFocusChanged.addListener((windowId) => enforceLockWindow(windowId),{windowTypes: ['normal']});
chrome.windows.onCreated.addListener((windowId) => enforceLockWindow(windowId),{windowTypes: ['normal']});

// Listens for messages from the extension popup
async function route(req){
    if(req.action == "updateLimit"){
        updateLimit(req)
    }
}

// Init banned sites array in local storage (first install/run of extension)
async function initBanned(){
    const data = await retrieveStorage(["banned"])
    if(typeof data.banned == "undefined"){
        await setStorage( {banned: []} );
    }
}

initBanned()

// Updates the tab limit in local storage and closes excess tabs
// The reason this needs to be done by a background worker is to handle the case in which
// The extension popup is opened on an excessive tab (closing that tab will lead the extension popup too)
async function updateLimit(req){
    setStorage({ tabLimit: req.desiredTabs });
    // Close excess tabs if needed
    const tabs = await getTabs();
    const tabsToClose = tabs.length - req.desiredTabs;

    for(let i = 0; i < tabsToClose; i++){
        removeTab(tabs[tabs.length - 1 - i].id);
    }
}

// Every time a tab is opened if it exceeds the limit close it
async function enforceLimit(newTab){
    const data = await retrieveStorage(["tabLimit"])
    const tabs = await getTabs();
    if(tabs.length > data.tabLimit){
        removeTab(newTab.id)
    }
}

// Every time a tab is switched if there is a tab lock, switch back
async function enforceLockTab(){
    const data = await retrieveStorage(["tabLock","tabLockID","tabWindowID"]);
    
    if(data.tabLockID && data.tabLock){
        const activeTabs = await getTabs({ active: true});
        if (activeTabs.length === 0) return;
        const current = activeTabs[0]
        if(current.id != data.tabLockID && current.url.startsWith("chrome-extension") == false){
            console.log(`[lock] switching tab from ${current.title} to ${data.tabLockID}`); 
            await switchTab(data.tabLockID)
        }
    }
}

// Every time a window is switched, if there's a tab lock, switch back
async function enforceLockWindow(windowId){
    const data = await retrieveStorage(["tabLock","tabLockID","tabWindowID"]);
    console.log("Enforce new window", data.tabLock, data.tabWindowID)
    if(windowId && data.tabWindowID){
        if(data.tabWindowID != windowId){
            await chrome.windows.update(data.tabWindowID, {focused: true})
        }
    }
}

// Every time a tab changes state check that the url doesn't include a banned site
async function enforceSites(){
    const tabs = await getTabs()
    const data = await retrieveStorage(["banned"]);
    for(let i = 0; i < tabs.length; i++){
        for(let j=0; j < data.banned.length; j++){
            if(tabs[i].url.includes(data.banned[j])) {
                //console.log("URL implies critical page" + tabs[i].url.includes("chrome://"))
                if(tabs[i].url.startsWith("chrome") == false){
                removeTab(tabs[i].id)}
            }
        }
    }
}

