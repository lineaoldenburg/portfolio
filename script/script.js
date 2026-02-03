const contactBtn = document.getElementById("contactBtn");
const mainHome = document.getElementById("main_home");
const mainContact = document.getElementById("main_contact");

let isContactOpen = false;
let homeScrollY = 0;

function updateButton() {
  if (isContactOpen) {
    contactBtn.innerHTML = 'Close <i class="fas fa-times"></i>';
    contactBtn.setAttribute("aria-expanded", "true");
    contactBtn.classList.add("open");
  } else {
    contactBtn.innerHTML = 'Contact <i class="fa-solid fa-face-smile"></i>';
    contactBtn.setAttribute("aria-expanded", "false");
    contactBtn.classList.remove("open");
  }
}

contactBtn.addEventListener("click", () => {
  isContactOpen = !isContactOpen;

  if (isContactOpen) {
    homeScrollY = window.scrollY;
    mainHome.hidden = true;
    mainContact.hidden = false;
    window.scrollTo({ top: 0, behavior: "instant" });
  } else {
    mainHome.hidden = false;
    mainContact.hidden = true;
    window.scrollTo({ top: homeScrollY, behavior: "instant" });
  }

  updateButton();
});

// initialize button text on page load
updateButton();