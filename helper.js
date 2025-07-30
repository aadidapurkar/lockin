// Helper Functions
export async function retrieveStorage(paramArr){
    return await chrome.storage.local.get(paramArr);
}

export async function setStorage(paramArr){
    return await chrome.storage.local.set(paramArr);
}

export async function getTabs(queryParams = {}){
    return await chrome.tabs.query(queryParams);
}

export async function removeTab(id){
    return await chrome.tabs.remove(id);
}

export async function switchTab(id){
    const res = await chrome.tabs.update(id, {active: true}, () => {
        if (chrome.runtime.lastError) {
            switchTab(id)
        } else {
            return res
        }
    })
}

export async function switchWindow(id) {
  try {
    // promise-based signature: single object arg
    return await chrome.windows.update({ windowId: id, focused: true });
  } catch (e) {
    //console.error("[switchWindow] failed, retrying:", e);
    return switchWindow(id);
  }
}
