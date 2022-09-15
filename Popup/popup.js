async function onLoad() {
    try {

        const { lastPage } = await chrome.storage.local.get("lastPage");
        if (lastPage) {
            window.location.href = `./${lastPage}/index.html`;
        } else {
            window.location.href = "./home/index.html";
        }
    } catch (e) {
        window.localStorage.href = "./home/index.html";
    }
}
onLoad();