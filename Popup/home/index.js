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

injectClick(delCookies, () => {
  console.log("devHelper - delete cookies");
  var cookies = document.cookie.split(";");
  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    var eqPos = cookie.indexOf("=");
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
  window.document.cookie = "";
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
