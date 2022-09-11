//buttons
let delSessionStorage = document.getElementById("delSessionStorage");
let delLocalStorage = document.getElementById("delLocalStorage");
let delCookies = document.getElementById("delCookies");
let HardReset = document.getElementById("HardReset");
let InNewTab = document.getElementById("InNewTab");

let AddStuffInpKey = document.getElementById("AddStuffInpKey"); // on change set to storage
let AddStuffInpValue = document.getElementById("AddStuffInpValue"); // on change set to storage

let addToSession = document.getElementById("addToSession");
let addToLocal = document.getElementById("addToLocal");

AddStuffInpKey.addEventListener("blur", (e) => {
  let value = e.target.value;
  chrome.storage.sync.set({ key: value });
});

AddStuffInpValue.addEventListener("blur", (e) => {
  let value = e.target.value;
  chrome.storage.sync.set({ value: value });
});

injectClick(addToSession, () => {
  console.log("devHelper - write to sessionStorage");
  chrome.storage.sync.get("key").then(({ key }) => {
    chrome.storage.sync.get("value").then(({ value }) => {
      window.sessionStorage.setItem(key, value);
    });
  });
});

injectClick(addToLocal, () => {
  console.log("devHelper - write to localStorage");
  chrome.storage.sync.get("key").then(({ key }) => {
    chrome.storage.sync.get("value").then(({ value }) => {
      window.localStorage.setItem(key, value);
    });
  });
});

injectClick(delSessionStorage, () => {
  console.log("devHelper - clears window.sessionStorage");
  window.sessionStorage.clear();
});

injectClick(delLocalStorage, () => {
  console.log("devHelper - clears window.localStorage");
  window.localStorage.clear();
});

delCookies.addEventListener("click", async () => {
  console.log("devHelper - clears cookies");
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let url = new URL(tab.url);
  try {
    const cookies = await chrome.cookies.getAll({ domain: url.hostname });
    cookies.map((cookie) => {
      const protocol = cookie.secure ? "https:" : "http:";
      const cookieUrl = `${protocol}//${cookie.domain}${cookie.path}`;
      chrome.cookies.remove({
        url: cookieUrl,
        name: cookie.name,
        storeId: cookie.storeId,
      });
    });
  } catch (e) {
    console.log("something went wrong on deleting cookies", e);
  }
});

HardReset.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let url = tabs[0].url;
    chrome.tabs.remove(tabs[0].id);
    chrome.tabs.create({ url: url });
  });
});

InNewTab.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let url = tabs[0].url;
    chrome.tabs.create({ url: url });
  });
});
