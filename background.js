
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ "key":"" });
    chrome.storage.sync.set({ "value":"" });
  });