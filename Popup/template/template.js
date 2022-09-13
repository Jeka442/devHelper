const headerHtml = `
<img src="/img/dev.png" alt="" />
<h1><span><</span> devHelper <span>/></span></h1>
`;

const menuHtml = `
<div id="home">
    <a href="../home/index.html"><img src="../../img/home.png" alt="" /></a>
</div>
<div id="sessionStorage">
    <a href="../sessionStorage/index.html"><img src="../../img/sessionStorage.png" alt="" /></a>
</div>
<div id="localStorage">
    <a href="../localStorage/index.html"><img src="../../img/localStorage.png" alt="" /></a>
</div>
<div id="cookies">
    <a href="../cookies/index.html"><img src="../../img/cookie.png" alt="" /> </a>
</div>
<div id="automation">
    <a href="../automation/index.html"><img src="../../img/automation.png" alt="" /> </a>
</div>
<div id="aboutMe">
    <a href="../aboutMe/index.html"><img src="../../img/aboutMe.png" alt="" /> </a>
</div>
`;
const header = document.getElementsByTagName("header")[0];
const menu = document.getElementsByTagName("menu")[0];
header.innerHTML = headerHtml;
menu.innerHTML = menuHtml;
document.getElementById(window.location.pathname.split("/")[2]).classList.add("active");



const notification = document.createElement("input");
notification.id = "notification";
notification.classList.add("notification-hide");
document.body.appendChild(notification);

document.getElementById("notification").addEventListener("click", (input) => {
    let val = input.target.value;
    if (val == "") {
        input.target.classList.remove("notification-show");
        input.target.classList.add("notification-hide");
    } else {
        input.target.classList.remove("notification-hide");
        input.target.classList.add("notification-show");
    }
});

var task;
var Logger = (val) => {
    if (task) clearTimeout(task);
    const input = document.getElementById("notification");
    input.value = val;
    input.click();
    task = setTimeout(() => {
        const input = document.getElementById("notification");
        input.value = "";
        input.click();
    }, 1000);
}

