
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
<div id="settings">
    <a href="../settings/index.html"><img src="../../img/settings.png" alt="" /> </a>
</div>
`
const header = document.getElementsByTagName("header")[0];
const menu = document.getElementsByTagName("menu")[0];
header.innerHTML = headerHtml;
menu.innerHTML = menuHtml;
document.getElementById(window.location.pathname.split("/")[2]).classList.add("active");

