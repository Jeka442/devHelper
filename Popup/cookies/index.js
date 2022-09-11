
const container = document.getElementById("container");

const getDate = (val) => {
    if (!val) return "";
    console.log(val.toFixed(0));
    const date = new Date(val * 1000);
    return date.toISOString();
}//2023-03-12T21:37:10.990Z

const initFunc = async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    try {
        let url = new URL(tab.url);
        const cookies = await chrome.cookies.getAll({ domain: url.hostname });
        let index = 0;
        for (let cookie of cookies) {
            let elm = document.createElement("div");
            elm.id = `container-${index}`;
            elm.innerHTML = `
            <div class="cookie-name" for-data="${index}">
            <span>${cookie.name}</span>
            <button domain="${cookie.domain}" path="${cookie.path}" protocol="${cookie.secure ? "https:" : "http:"}" storeId="${cookie.storeId}" name="${cookie.name}">Delete</button>
            </div>
            <div class="cookie-content" for-data="${index}" state="closed">
                <p>value</p>
                <textarea disabled class="cookie-value">${cookie.value}</textarea>
                <p>domain</p>
                <input disabled class="cookie-domain" value="${cookie.domain}"></input>
                <p>path</p>
                <input disabled class="cookie-path" value="${cookie.path}"></input>
                <p>expire date</p>
                <input disabled type="text" value="${getDate(cookie.expirationDate)}"></input>
                <div class="tags">
                    <input disabled type="checkbox" ${cookie.httpOnly ? 'checked=true' : ''} ">
                    <p>httpOnly</p>
                    <input disabled type="checkbox" ${cookie.session ? 'checked=true' : ''} ">
                    <p>session</p>
                    <input disabled type="checkbox" ${cookie.hostOnly ? 'checked=true' : ''} ">
                    <p>hostOnly</p>
                    <input disabled type="checkbox" ${cookie.secure ? 'checked=true' : ''} ">
                    <p>secure</p>
                </div>
            </div>
            `
            container.appendChild(elm);
            index++;
        }

        for (let i = 0; i < cookies.length; i++) {
            let elm = document.getElementById(`container-${i}`)
            let cookieName = elm.getElementsByClassName("cookie-name")[0];
            let cookieContent = elm.getElementsByClassName("cookie-content")[0];
            let delBtn = elm.getElementsByTagName("button")[0];
            // let cookieValue = elm.getElementsByClassName("cookie-value")[0];
            cookieName.addEventListener("click", () => {
                const state = cookieContent.getAttribute("state");
                if (state == 'closed') {
                    cookieContent.style.height = 'fit-content';
                    cookieContent.setAttribute("state", "open");
                } else {
                    cookieContent.style.height = '0';
                    cookieContent.setAttribute("state", "closed");
                }
            })

            delBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                const domain = e.currentTarget.getAttribute("domain");
                const path = e.currentTarget.getAttribute("path");
                const protocol = e.currentTarget.getAttribute("protocol");
                const storeId = e.currentTarget.getAttribute("storeId");
                const name = e.currentTarget.getAttribute("name");
                const cookieUrl = `${protocol}//${domain}${path}`;
                chrome.cookies.remove({
                    url: cookieUrl,
                    name: name,
                    storeId: storeId,
                }).then(() => {
                    elm.remove();
                }).catch((e) => {
                    console.log("something went wrong on deleting cookie", e)
                });
            })
        }

    } catch (e) {

        console.log("failed on loading cookies", e);
    }
}





initFunc();




