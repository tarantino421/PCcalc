const menuBtn = document.querySelector(".menu-btn");
const headerContent = document.querySelector(".header__content");
const headerContentMenu = document.querySelector(".header__content .menu");
menuBtn.addEventListener("click", () => {
  menuBtn.classList.toggle("open");
  headerContent.classList.toggle("open");
  headerContentMenu.classList.toggle("open");
});
