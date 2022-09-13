const addBtn = document.getElementById("addBtn");
const container = document.getElementById("container");
const startBtn = document.getElementById("activateBtn");
const saveBtn = document.getElementById("saveBtn");

function onSelect(e) {
    let selectValue = e.target.value;
    let firstInput = e.target.nextElementSibling;
    let secondInput = firstInput.nextElementSibling;
    secondInput.value = "";
    firstInput.placeholder = "";
    secondInput.placeholder = "";
    switch (selectValue) {
        case "click":
            firstInput.placeholder = ".selector"
            secondInput.disabled = true;
            break;
        case "setValue":
            firstInput.placeholder = ".selector"
            secondInput.disabled = false;
            secondInput.placeholder = "value"
            break;
        case "wait":
            firstInput.placeholder = "time in ms"
            secondInput.disabled = true;
            break;
        case "setValFrom":
            firstInput.placeholder = "from .selector"
            secondInput.placeholder = "to .selector"
            secondInput.disabled = false;
            break;
    }
}

function deleteRow(e) {
    const index = e.target.getAttribute("for-index");
    const items = document.getElementsByClassName("operation-content");
    [...items].map((item) => {
        if (item.getAttribute("for-index") == index) { item.remove(); }
    })
}

function addAutomation(index, action) {
    let div = document.createElement("div");
    div.classList.add("operation-content");
    div.setAttribute("for-index", index);
    let select = document.createElement("select");
    select.setAttribute("for-index", index);
    select.addEventListener("change", onSelect);
    select.innerHTML = `
        <option value="click">click</option>
        <option value="setValue">set value</option>
        <option value="wait">wait</option>
        <option value="setValFrom">value from</option>
        `;
    let inp1 = document.createElement("input");
    inp1.placeholder = ".selector"
    inp1.classList.add("inp");
    let inp2 = document.createElement("input");
    inp2.disabled = true;
    inp2.classList.add("inp");
    let delBtn = document.createElement("button");
    delBtn.setAttribute("for-index", index);
    delBtn.classList.add("delBtn");
    delBtn.innerText = "delete";
    delBtn.addEventListener("click", deleteRow);
    div.appendChild(select);
    div.appendChild(inp1);
    div.appendChild(inp2);
    div.appendChild(delBtn);

    if (action) {
        if (action.inp2 != "") {
            inp2.disabled = false;
        }
        select.value = action.action;
        inp1.value = action.inp1;
        inp2.value = action.inp2;
    }
    container.appendChild(div);

}
var x = 0;
addBtn.addEventListener("click", () => {
    addAutomation(x++);
})



const getActionObject = () => {
    const actions = document.getElementsByClassName("operation-content");
    if (!actions.length) return Logger("No actions to fire"); // test this
    const track = [...actions].map((item) => {
        let select = item.getElementsByTagName("select")[0].value
        const [inp1, inp2] = item.getElementsByTagName("input");
        return { action: select, inp1: inp1.value, inp2: inp2.value };
    })
    return track;
}

const startActions = async (track) => {
    Logger("Automation start")
    for (let member of track) {
        const { action, inp1, inp2 } = member;
        switch (action) {
            case "click":
                await clickAction(inp1);
                break;
            case "setValFrom":
                await setValFromAction(inp1, inp2);
                break;
            case "wait":
                await waitAction(inp1);
                break;
            case "setValue":
                await setValAction(inp1, inp2);
                break;
        }
    }
    Logger("Automation finish")
}


startBtn.addEventListener("click", () => {
    startActions(getActionObject());
})


const clickAction = async (selector) => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        args: [selector],
        func: (selector) => {
            const elm = document.querySelector(selector);
            if (!elm) return null; // write error to log
            elm.click(); // write to log
        }
    })
}


const setValAction = async (selector, value) => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        args: [{ selector, value }],
        func: (props) => {
            const elm = document.querySelector(props.selector);
            if (!elm) return null; // write error to log
            let tagName = elm.tagName.toLowerCase();
            if (tagName == 'input' || tagName == 'textarea' || tagName == 'select') {
                elm.value = props.value;
                elm.innerText = props.value;
            } else {
                elm.innerText = props.value;
            }
        }
    })
}


const waitAction = (time) => {
    return new Promise((res, rej) => {
        setTimeout(() => {
            res(true);
        }, time);
    })
}

const setValFromAction = async (selectorA, selectorB) => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        args: [{ selectorA, selectorB }],
        func: (props) => {
            const { selectorA, selectorB } = props;
            const elmA = document.querySelector(selectorA);
            const elmB = document.querySelector(selectorB);
            if (!elmA) return null; // write error to log
            if (!elmB) return null; // write error to log

            let val;
            let tagNameA = elmA.tagName.toLowerCase();
            let tagNameB = elmB.tagName.toLowerCase();
            if (tagNameA == 'input' || tagNameA == 'textarea' || tagNameA == 'select') {
                val = elmA.value;
            } else {
                val = elmA.innerText;
            }
            if (tagNameB == 'input' || tagNameB == 'textarea' || tagNameB == 'select') {
                elmB.value = val;
            } else {
                elmB.innerText = val;
            }
        }
    })
}


saveBtn.addEventListener("click", async () => {
    const actions = getActionObject();
    if (!actions || actions.length == 0) {
        chrome.storage.local.remove("automation", () => {
            Logger("Automation cleared")
        });
    } else {
        chrome.storage.local.set({ automation: actions }, () => {
            Logger("Automation saved")
        })
    }
})

function initFromStorage() {
    chrome.storage.local.get(["automation"], (data) => {
        if (data && data.automation && data.automation.length > 0) {
            let index = 0;
            for (let action of data.automation) {
                addAutomation(index, action);
                index++;
            }
        }
    });
}
initFromStorage();
