let menuOpen = false;
const menuButton = document.querySelector(".menu-button");
const menuButtonImg = document.querySelector(".menu-button img");
const nav = document.querySelector(".open-nav");

function toggleMenu()
{
    setMenu(!menuOpen);
}

function setMenu(open) 
{
    menuOpen = open;
    if (open) {
        nav.classList.remove("closed");
        menuButtonImg.src = "./images/close.svg";
    } else {
        nav.classList.add("closed");
        menuButtonImg.src = "./images/menu.svg";
    }
}

setMenu(false);

menuButton.addEventListener("click", () => {
    toggleMenu();
});