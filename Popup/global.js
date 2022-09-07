// injects js script to active tab
async function inject(func) {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: func,
    });
  }
  ///////////////////
  function injectClick(elm, func) {
    elm.addEventListener("click", () => {
      inject(func);
    });
  }