

const container = document.getElementById("container");
const counter = document.getElementById("count");
const refreshBtn = document.getElementById("refresh");

async function getStorage() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            return Object.entries(window.localStorage);
        },
    }).then((value) => {
        const content = value[0].result
        if (content != undefined && content.length > 0) {
            container.innerHTML = "";
        } else {
            container.innerHTML = `<h2>Local storage is empty</h2>`
        }
        let index = 0;
        for (let [key, val] of content) {
            let elm = document.createElement("div");
            let isLongString = val.length > 8000;
            let inputStyle = isLongString ? `style="border:1px solid red; color:red"` : "";
            let inputValue = isLongString ? '*OVER 8k CHARS*' : val;
            elm.classList.add("item");
            elm.classList.add("flexRow");
            elm.innerHTML = `
            <div>
              <input class="keyInp" value="${key}" type="text" for-index="${index}"/>
              <input ${inputStyle} class="valInp" value="${inputValue}" type="text" for-index="${index}"/>
            </div>
            <div class="delBtn" for-index="${index}">delete</div>
        `;
            container.appendChild(elm);
            index++;
        }
        counter.innerText = index;
        attachListeners(tab);
    });
}

async function attachListeners(tab) {
    const elements = document.getElementsByClassName("item");
    for (let elm of elements) {
        let keyInp = elm.getElementsByClassName("keyInp")[0];
        let valInp = elm.getElementsByClassName("valInp")[0];
        let delBtn = elm.getElementsByClassName("delBtn")[0];
        keyInp.addEventListener("keydown", (e) => { e.preventDefault() })
        valInp.addEventListener("blur", () => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                args: [{ key: keyInp.value, val: valInp.value }],
                func: ({ key, val }) => {
                    localStorage.setItem(key, val);
                },
            }).then(() => {
                Logger("value updated");
            });
        })
        delBtn.addEventListener("click", () => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                args: [keyInp.value],
                func: (key) => {
                    localStorage.removeItem(key);
                },
            }).then(() => {
                Logger("delete value");
            });
            counter.innerText = parseInt(counter.innerText) - 1;
            elm.style.display = "none";
        })
    }
}
getStorage();

refreshBtn.addEventListener("click", () => {
    container.innerHTML = "";
    getStorage();
})