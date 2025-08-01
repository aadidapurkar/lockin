import {retrieveStorage, setStorage, getTabs} from './helper.js'

// Elements
const changeLimitBtn = document.getElementById("changeLimitBtn");
const labelLimit = document.getElementById("labelLimit");
const checkboxLock = document.getElementById("checkboxLock");
const labelLock = document.getElementById("labelLock")
const inputTabLimit = document.getElementById("desiredTabCount")
const inputBan = document.getElementById("inputBanSite")
const submitBanBtn = document.getElementById("submitBanBtn")
const clearAllBansBtn = document.getElementById("clearAllBansBtn")
const removeBanBtn = document.getElementById("removeBanBtn")
const selectSite = document.getElementById("selectSite");
const resetLimitBtn = document.getElementById("resetLimitBtn");


// Event Listeners
changeLimitBtn.addEventListener("click", updateLimit);
checkboxLock.addEventListener("change", updateLock);
submitBanBtn.addEventListener("click", updateBans);
clearAllBansBtn.addEventListener("click",clearBans)
removeBanBtn.addEventListener("click", removeBan)
resetLimitBtn.addEventListener("click",resetLimit)

// Retrieve previous lockin state from local storage
async function initStatus(){
    const data = await retrieveStorage(["tabLimit", "tabLock","tabLockID"]);
    const tabs = await getTabs({active: true, lastFocusedWindow: true });

    // Retrieve tab limit
    if(data.tabLimit){
        if(data.tabLimit < 1000){
        labelLimit.textContent = data.tabLimit;}
    }

    // Retrieve tab lock
    if(data.tabLock && data.tabLockID && tabs[0].id == data.tabLockID && data.tabLock == true){
        checkboxLock.checked = true;
        labelLock.style.display = "none";
    }

}

// Set HTML page's dropdown options based on current state of banned sites in storage
async function populateDropdown(){
    const data = await retrieveStorage(["banned"]);
    selectSite.innerHTML = '';

    for(let i = 0; i < data.banned.length; i++){
        const option = document.createElement("option");
        option.value = data.banned[i];
        option.textContent = data.banned[i];
        selectSite.appendChild(option);
    }
}

initStatus()
populateDropdown() // This function is separated from initStatus because it is used both for init + updating

// Update tab limit
async function updateLimit(){
    if(inputTabLimit.value > 0){
    chrome.runtime.sendMessage({ action: "updateLimit", desiredTabs: inputTabLimit.value});
    labelLimit.textContent = inputTabLimit.value;}
}

// Clear tab limit
async function resetLimit(){
    chrome.runtime.sendMessage({ action: "updateLimit", desiredTabs: 999999999});
    labelLimit.textContent = "unlimited"
}

// Update tab lock
async function updateLock(){
    const tabs = await getTabs({active: true, lastFocusedWindow: true });

    if(checkboxLock.checked){
        labelLock.style.display = "none";
        console.log(`Locking tab ${tabs[0].title}`)
        await setStorage({tabLock: true, tabLockID: tabs[0].id, tabWindowID: tabs[0].windowId}); //

    } else {
        labelLock.style.display = "inline";
        await setStorage({tabLock: false, tabLockID: null, tabWindowID: null});
    }

}

// Add to bans
async function updateBans(){
    const data = await retrieveStorage(["banned"]);
    data.banned.push(inputBan.value)
    await setStorage({banned: data.banned})
    await populateDropdown()
    inputBan.value = ''
}

// Clear bans
async function clearBans(){
    await setStorage({banned: []});
    await populateDropdown()

}

async function removeBan(){
    const toRemove = selectSite.value;
    const data = await retrieveStorage(["banned"]);
    const filtered = data.banned.filter(item => item != toRemove);
    await setStorage({banned: filtered})
    await populateDropdown()
}