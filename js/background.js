import {retrieveStorage, setStorage, getTabs, removeTab, switchTab, switchWindow} from './helper.js'

// Listeners
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {route(message);});
chrome.tabs.onCreated.addListener((newTab) => {enforceLimit(newTab);});
chrome.tabs.onActivated.addListener(() => {enforceLock();});
chrome.tabs.onUpdated.addListener((newTab) => {enforceLimit(newTab);});
chrome.tabs.onUpdated.addListener(() => {enforceSites();});
chrome.tabs.onCreated.addListener(() => {enforceSites();});
chrome.tabs.onReplaced.addListener(() => {enforceSites();});
chrome.windows.onFocusChanged.addListener((windowId) => { enforceLockNewWindow(windowId); });


// Route runtime messages
async function route(req){
    if(req.action == "updateLimit"){
        updateLimit(req)
    }
}

// Init banned sites
async function initBanned(){
    const data = await retrieveStorage(["banned"])
    if(typeof data.banned == "undefined"){
        await setStorage( {banned: []} );
    }
}
initBanned()

async function updateLimit(req){
    setStorage({ tabLimit: req.desiredTabs });
    // Close excess tabs if needed
    const tabs = await getTabs();
    const tabsToClose = tabs.length - req.desiredTabs;

    for(let i = 0; i < tabsToClose; i++){
        removeTab(tabs[tabs.length - 1 - i].id);
    }
}

async function enforceLimit(newTab){
    const data = await retrieveStorage(["tabLimit"])
    const tabs = await getTabs();
    if(tabs.length > data.tabLimit){
        removeTab(newTab.id)
    }
}

async function enforceLock(){
    const data = await retrieveStorage(["tabLock","tabLockID","tabWindowID"]);
    
    if(data.tabLockID && data.tabLock){
        const activeTabs = await getTabs({ active: true});
        if (activeTabs.length === 0) return;
        const current = activeTabs[0]
        if(current.id != data.tabLockID){
            //console.log(`[lock] switching tab to ${data.tabLockID}`); 
            await switchTab(data.tabLockID)
            //await switchWindow(data.tabWindowID)
        }
    }
}

async function enforceLockNewWindow(windowId){
    const data = await retrieveStorage(["tabLock","tabLockID","tabWindowID"]);
    //console.log("Enforce new window", data.tabLock, data.tabWindowID)
    if(windowId && data.tabWindowID){
        if(data.tabWindowID != windowId){
            await chrome.windows.update(data.tabWindowID, {focused: true})
        }
    }
}

async function enforceSites(){
    const tabs = await getTabs()
    const data = await retrieveStorage(["banned"]);
    for(let i = 0; i < tabs.length; i++){
        for(let j=0; j < data.banned.length; j++){
            //console.log(tabs[i].url, data.banned[j])
            //console.log(tabs[i].url.includes("chrome://newtab" == false))
            // if(tabs[i].url.includes(data.banned[j]) && tabs[i].url.includes("chrome://") == false) {
            if(tabs[i].url.includes(data.banned[j])) {
                //console.log("URL implies critical page" + tabs[i].url.includes("chrome://"))
                if(tabs[i].url.includes("chrome://") == false){
                removeTab(tabs[i].id)}
            }
        }
    }
}

