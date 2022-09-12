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


//sessionStorage add
addToSession.addEventListener("click",async ()=>{
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting
    .executeScript({
      target: { tabId: tab.id },
      args: [{key:AddStuffInpKey.value ,val:AddStuffInpValue.value}],
      func: ({key,val})=>{
        console.log(key,val);
        window.sessionStorage.setItem(key, val);
      },
    })
    .then(() => {
      Logger("Added to sessionStorage");
    })
    .catch(() => {
      Logger("Failed to add to sessionStorage");
    });
})

//localStorage add
addToLocal.addEventListener("click",async ()=>{
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting
    .executeScript({
      target: { tabId: tab.id },
      args: [{key:AddStuffInpKey.value ,val:AddStuffInpValue.value}],
      func: ({key,val})=>{
        window.localStorage.setItem(key, val);
      },
    })
    .then(() => {
      Logger("Added to localStorage");
    })
    .catch(() => {
      Logger("Failed to add to localStorage");
    });
})

//clear sessionStorage
delSessionStorage.addEventListener("click",async ()=>{
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting
    .executeScript({
      target: { tabId: tab.id },
      func: ()=>{
        window.sessionStorage.clear();
      },
    })
    .then(() => {
      Logger("sessionStorage cleared");
    })
    .catch(() => {
      Logger("Failed to clear sessionStorage");
    });
})

//clear localStorage
delLocalStorage.addEventListener("click",async ()=>{
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting
    .executeScript({
      target: { tabId: tab.id },
      func: ()=>{
        window.localStorage.clear();
      },
    })
    .then(() => {
      Logger("localStorage cleared");
    })
    .catch(() => {
      Logger("Failed to clear localStorage");
    });
})


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
    Logger("cleared cookies")
  } catch (e) {
    console.log("something went wrong on deleting cookies", e);
    Logger("something went wrong on deleting cookies");
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
