/* ==========================
   ELEMENTS & CONSTANTS
========================== */

const contactBtn   = document.getElementById("contactBtn");
const mainContact  = document.getElementById("main_contact");
const mainElement  = document.querySelector("main");
const heroBg       = document.getElementById("hero_bg");
const navElement   = document.querySelector("nav");
const portfolioNav = document.querySelector(".portfolio_nav");
const sentinel     = document.querySelector(".portfolio-nav-sentinel");

const HERO_HIDE_SCROLL    = 100;
const GLOBAL_FADE_SCROLL  = 2;
const TOP_RESET_SCROLL    = 2;

/* ==========================
   STATE
========================== */

let homeScrollY = 0;
let hasScrolled = false;

/* ==========================
   CONTACT BUTTON STATE
========================== */

function updateButton(isOpen) {
  contactBtn.innerHTML = isOpen
    ? 'Close <i class="fas fa-times"></i>'
    : 'Contact <i class="fa-solid fa-face-smile"></i>';

  contactBtn.setAttribute("aria-expanded", String(isOpen));
  contactBtn.classList.toggle("open", isOpen);
}

updateButton(false);

/* ==========================
   CONTACT TOGGLE
========================== */

contactBtn.addEventListener("click", () => {
  const isOpen = mainElement.classList.toggle("contact-open");
  mainContact.classList.toggle("active", isOpen);

  if (isOpen) {
    homeScrollY = mainElement.scrollTop;

    heroBg.classList.add("hidden");
    heroBg.classList.remove("slow-hidden");

    document.body.classList.remove("scrolled-hero");
    navElement.classList.remove("scrolled");
    portfolioNav.classList.remove("scrolled");
  } else {
    heroBg.classList.remove("hidden");
    mainElement.scrollTop = homeScrollY;

    if (homeScrollY > GLOBAL_FADE_SCROLL) {
      document.body.classList.add("scrolled-hero");
    }
  }

  updateButton(isOpen);
});

/* ==========================
   SCROLL CONTROLLER (AUTHORITY)
========================== */

mainElement.addEventListener("scroll", () => {
  const scrollY = mainElement.scrollTop;
  hasScrolled = scrollY > 0;

  /* ---- TOP OF PAGE WINS ---- */
  if (scrollY <= TOP_RESET_SCROLL) {
    navElement.classList.remove("scrolled");
    portfolioNav.classList.remove("scrolled");
  }

  /* ---- HERO EFFECTS ---- */
  if (
    !mainElement.classList.contains("contact-open") &&
    !heroBg.classList.contains("hidden")
  ) {
    heroBg.classList.toggle("slow-hidden", scrollY > HERO_HIDE_SCROLL);
    document.body.classList.toggle(
      "scrolled-hero",
      scrollY > GLOBAL_FADE_SCROLL
    );
  }
});

/* ==========================
   PORTFOLIO NAV STICKY OBSERVER
========================== */

if (sentinel && portfolioNav) {
  const stickyObserver = new IntersectionObserver(
    ([entry]) => {
      if (!hasScrolled) return;
      if (mainElement.scrollTop <= TOP_RESET_SCROLL) return;
      if (mainElement.classList.contains("contact-open")) return;

      const isStuck = !entry.isIntersecting;
      navElement.classList.toggle("scrolled", isStuck);
      portfolioNav.classList.toggle("scrolled", isStuck);
    },
    {
      root: null,
      threshold: 0,
      rootMargin: "-90px 0px 0px 0px"
    }
  );

  stickyObserver.observe(sentinel);
}

/* ==========================
   PORTFOLIO FILTERING
========================== */

const filterBtns     = document.querySelectorAll(".filter-btn");
const portfolioItems = document.querySelectorAll(".portfolio-item");

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;

    portfolioItems.forEach(item => {
      const match =
        filter === "all" || item.dataset.category === filter;

      item.classList.toggle("hidden", !match);
      if (!match) item.classList.remove("expanded");
    });
  });
});

/* ==========================
   PORTFOLIO EXPAND / COLLAPSE
========================== */

portfolioItems.forEach(item => {
  const expandBtn = item.querySelector(".expand-btn");
  const closeBtn  = item.querySelector(".close-btn");

  expandBtn?.addEventListener("click", () => {
    portfolioItems.forEach(i => i.classList.remove("expanded"));
    item.classList.add("expanded");

    requestAnimationFrame(() => {
      item.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  closeBtn?.addEventListener("click", () => {
    item.classList.remove("expanded");
  });
});
