const addBtn = document.getElementById("addBtn");
const container = document.getElementById("container");
const startBtn = document.getElementById("activateBtn");
const addAutomationTrackBtn = document.getElementById("Add-automation-track");
const deleteAutomationTrackBtn = document.getElementById(
    "select-automation-del"
);
const automationSelect = document.getElementById("select-automation");
const delAutomationTrack = document.getElementById("select-automation-del");
const newAutomationName = document.getElementById("new-automation-name");

function onSelect(e) {
    let selectValue = e.target.value;
    let firstInput = e.target.nextElementSibling;
    let secondInput = firstInput.nextElementSibling;
    secondInput.value = "";
    setInputs(selectValue, firstInput, secondInput);
}

const setInputs = (selectValue, firstInput, secondInput) => {
    firstInput.placeholder = "";
    secondInput.placeholder = "";
    switch (selectValue) {
        case "click":
            firstInput.placeholder = ".selector";
            secondInput.disabled = true;
            break;
        case "setValue":
            firstInput.placeholder = ".selector";
            secondInput.disabled = false;
            secondInput.placeholder = "value";
            break;
        case "wait":
            firstInput.placeholder = "time in ms";
            secondInput.disabled = true;
            break;
        case "setValFrom":
            firstInput.placeholder = "from .selector";
            secondInput.placeholder = "to .selector";
            secondInput.disabled = false;
            break;
    }
}

function deleteRow(e) {
    const index = e.target.getAttribute("for-index");
    const items = document.getElementsByClassName("operation-content");
    [...items].map((item) => {
        if (item.getAttribute("for-index") == index) {
            item.remove();
        }
    });
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
    inp1.placeholder = ".selector";
    inp1.classList.add("inp");
    let inp2 = document.createElement("input");
    setInputs(action ? action.action : "click", inp1, inp2);
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
    const value = automationSelect.value;
    if (!value || value == "") return Logger("Add automation name first");
    addAutomation(x++);
});

const getActionObject = () => {
    const actions = document.getElementsByClassName("operation-content");
    if (!actions.length) return;
    const track = [...actions].map((item) => {
        let select = item.getElementsByTagName("select")[0].value;
        const [inp1, inp2] = item.getElementsByTagName("input");
        return { action: select, inp1: inp1.value, inp2: inp2.value };
    });
    return track;
};

const startActions = async (track) => {
    if (!track || !track.length) return Logger("Track is empty");
    Logger("Automation start");
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
    Logger("Automation finish");
};

startBtn.addEventListener("click", () => {
    startActions(getActionObject());
});

const clickAction = async (selector) => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        args: [selector],
        func: (selector) => {
            const elm = document.querySelector(selector);
            if (!elm) return null; // write error to log
            elm.click(); // write to log
        },
    });
};


const setValAction = async (selector, value) => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        args: [{ selector, value }],
        func: (props) => {
            const elm = document.querySelector(props.selector);
            if (!elm) return null; // write error to log
            let tagName = elm.tagName.toLowerCase();
            if (tagName == "input" || tagName == "textarea" || tagName == "select") {
                elm.setAttribute("value", props.value);
                elm.innerText = props.value;
                let changeEvent = new Event("change", { bubbles: true, cancelable: true, composed: true });
                elm.dispatchEvent(changeEvent);
            } else {
                elm.innerText = props.value;
            }
        },
    });
};

const waitAction = (time) => {
    return new Promise((res, rej) => {
        setTimeout(() => {
            res(true);
        }, time);
    });
};

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
            if (
                tagNameA == "input" ||
                tagNameA == "textarea" ||
                tagNameA == "select"
            ) {
                val = elmA.value;
            } else {
                val = elmA.innerText;
            }
            if (
                tagNameB == "input" ||
                tagNameB == "textarea" ||
                tagNameB == "select"
            ) {
                elmB.value = val;
            } else {
                elmB.innerText = val;
            }
        },
    });
};

const saveTrack = (name) => {
    const actions = getActionObject();
    chrome.storage.local.set({ [name]: actions ? actions : [] });
    chrome.storage.local.set({ lastTrackSelected: automationSelect.value });
};

window.onblur = () => { saveTrack(automationSelect.value) };
window.onbeforeunload = () => { saveTrack(automationSelect.value) };

addAutomationTrackBtn.addEventListener("click", async () => {
    addNewAutomation();
});

newAutomationName.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() == 'enter') {
        addNewAutomation();
    }
})

const addNewAutomation = async () => {
    const trackName = newAutomationName.value;
    newAutomationName.value = "";
    if (!trackName || trackName == "" || !/^[a-zA-Z]+$/.test(trackName)) {
        Logger("Invalid name");
        return;
    }
    let trackList = [];
    const oldList = await chrome.storage.local.get(["automationNames"]);
    if (oldList && oldList.automationNames) {
        if (oldList.automationNames.length > 6) {
            Logger("You reached the limit of saved items");
            return;
        }
        trackList = trackList.concat(oldList.automationNames);
    }
    if (trackList.filter((val) => val == trackName).length > 0) {
        Logger("This name already exists!");
        return;
    } else {
        trackList.push(trackName);
    }

    await chrome.storage.local.set({ automationNames: trackList });
    let op = document.createElement("option");
    op.value = trackName;
    op.innerText = trackName;
    automationSelect.appendChild(op);
    Logger("Automation track added");
}

async function initFromStorage() {
    container.innerHTML = "";
    automationSelect.innerHTML = "";
    chrome.storage.local.get(["automationNames"]).then((data) => {
        if (data && data.automationNames && data.automationNames.length > 0) {
            const list = data.automationNames;
            for (let name of list) {
                let op = document.createElement("option");
                op.value = name;
                op.innerText = name;
                automationSelect.appendChild(op);
            }
        }
    });

}

delAutomationTrack.addEventListener("click", async () => {
    const valueToDelete = automationSelect.value;
    if (!valueToDelete || valueToDelete == "") {
        Logger("No value selected");
        return;
    }
    chrome.storage.local.get(["automationNames"]).then(async ({ automationNames }) => {
        if (automationNames && automationNames.length > 0) {
            const list = automationNames.filter(val => val != valueToDelete);
            await chrome.storage.local.set({ automationNames: list });
            await chrome.storage.local.remove(valueToDelete);
            container.innerHTML = "";
            automationSelect.value = "";
            setTrackByName(list[0]);
            initFromStorage();
        }
    })

});


automationSelect.addEventListener("focus", async (e) => {
    saveTrack(automationSelect.value);
})

automationSelect.addEventListener("change", async (e) => {
    setTrackByName(e.target.value);
})

const setTrackByName = async (name) => {
    if (!name || name == "") return;
    container.innerHTML = "";
    chrome.storage.local.get([name], (data) => {
        if (data && data[name] && data[name].length > 0) {
            let index = 0;
            for (let action of data[name]) {
                addAutomation(index, action);
                index++;
            }
        }
    });
}

initFromStorage();


const openLastTrack = () => {
    chrome.storage.local.get("lastTrackSelected").then(({ lastTrackSelected }) => {
        if (lastTrackSelected) {
            automationSelect.value = lastTrackSelected;
            setTrackByName(lastTrackSelected);
        }
    })
}



openLastTrack();