
chrome.runtime.onInstalled.addListener(() => {
    console.log("Setting up storage");
    chrome.storage.sync.set({ "key":"" });
    chrome.storage.sync.set({ "value":"" });
  });