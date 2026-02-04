const contactBtn = document.getElementById("contactBtn");
const mainContact = document.getElementById("main_contact");
const mainElement = document.querySelector("main");
const heroBg = document.getElementById("hero_bg");
const HERO_HIDE_SCROLL = 300;

/* ------------------------
   Button state
------------------------ */
function updateButton(isOpen) {
  contactBtn.innerHTML = isOpen
    ? 'Close <i class="fas fa-times"></i>'
    : 'Contact <i class="fa-solid fa-face-smile"></i>';
  contactBtn.setAttribute("aria-expanded", String(isOpen));
  contactBtn.classList.toggle("open", isOpen);
}

/* ------------------------
   Contact toggle
------------------------ */
let homeScrollY = 0;

contactBtn.addEventListener("click", () => {
  const isOpen = mainElement.classList.toggle("contact-open");
  mainContact.classList.toggle("active", isOpen);

  if (isOpen) {
    // save current scroll position main
    homeScrollY = mainElement.scrollTop;

    // fast hide hero
    heroBg.classList.add("hidden");
    heroBg.classList.remove("slow-hidden");
  } else {
    heroBg.classList.remove("hidden");
    // restore scroll
    mainElement.scrollTop = homeScrollY;
  }

  updateButton(isOpen);
});

updateButton(false);

/* ------------------------
   Scroll-based hero bg toggle
------------------------ */
mainElement.addEventListener("scroll", () => {
  if (mainElement.classList.contains("contact-open") || heroBg.classList.contains("hidden"))
    return;

  heroBg.classList.toggle(
    "slow-hidden",
    mainElement.scrollTop > HERO_HIDE_SCROLL
  );
});
