

document.getElementById("footer").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            window.location.href = "https://www.github.com/Jeka442";
        }
    })
})