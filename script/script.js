// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Script loaded successfully!");

  // Check if we're on the homepage
  const isHomePage =
    window.location.pathname === "/" ||
    window.location.pathname === "/index.html";

  if (isHomePage) {
    const hasLoadingScreen = document.getElementById("loading-screen");

    if (hasLoadingScreen) {
      initializeWithLoadingScreen();
    } else {
      // No loading screen (e.g. back navigation, bfcache, or already removed)
      document.body.classList.add("loaded");
      document.documentElement.classList.add("fonts-loaded");
      initializeApp();
    }
  } else {
    initializeApp();
  }
});

/* ==========================
   LOADING SCREEN VERSION (index.html only)
========================== */
function initializeWithLoadingScreen() {
  const MIN_DISPLAY_TIME = 800;
  const startTime = Date.now();
  const loadingScreen = document.getElementById("loading-screen");

  // Guard: if loading screen is already gone (back navigation / bfcache), skip straight through
  if (!loadingScreen) {
    document.body.classList.add("loaded");
    document.documentElement.classList.add("fonts-loaded");
    initializeApp();
    return;
  }

  const logoImg = loadingScreen.querySelector("img");

  if (logoImg) {
    logoImg.style.opacity = "0";
    logoImg.style.transition = "opacity 0.4s ease";
    const revealLogo = () => {
      logoImg.style.opacity = "1";
    };
    if (logoImg.complete) {
      revealLogo();
    } else {
      logoImg.addEventListener("load", revealLogo, { once: true });
    }
  }

  function finishLoading() {
    console.log(`Finishing loading after ${Date.now() - startTime}ms`);
    document.body.classList.add("loaded");
    document.documentElement.classList.add("fonts-loaded");

    if (loadingScreen) {
      loadingScreen.classList.add("fade-out");
      setTimeout(() => loadingScreen.remove(), 500);
    }

    initializeApp();
  }

  const fontsReady = (document.fonts?.ready ?? Promise.resolve()).catch(() => {
    console.warn("Some fonts failed, continuing anyway");
  });

  const imagesReady = Promise.all(
    ["assets/bg.webp", "assets/me.webp"].map(
      (src) =>
        new Promise((res) => {
          const img = new Image();
          img.onload = img.onerror = res;
          img.src = src;
        })
    )
  );

  const minTimeReady = new Promise((res) => setTimeout(res, MIN_DISPLAY_TIME));

  Promise.all([fontsReady, imagesReady, minTimeReady]).then(finishLoading);
}

/* ==========================
   MAIN APP INITIALIZATION
========================== */
function initializeApp() {
  console.log("Initializing app...");

  /* ==========================
     GLITTER STAR RANDOMIZATION (index.html only)
  ========================== */
  document.querySelectorAll(".star").forEach((el) => {
    const randomDuration = (Math.random() * 2 + 1).toFixed(2);
    const randomDelay = (Math.random() * 2).toFixed(2);

    el.style.animationDuration = randomDuration + "s";
    el.style.animationDelay = randomDelay + "s";
  });

  console.log("Stars randomized:", document.querySelectorAll(".star").length);

  /* ==========================
     CONFIGURATION & CONSTANTS
  ========================== */
  const CONFIG = {
    HERO_HIDE_SCROLL: 100,
    GLOBAL_FADE_SCROLL: 2,
    TOP_RESET_SCROLL: 2,
    TRANSITION_DELAY: 100,
    STICKY_NAV_OFFSET: 80,
  };

  const SELECTORS = {
    contactBtn: "#contactBtn",
    mobileContactBtn: "#mobileContactBtn",
    resumeBtn: "#resumeBtn",
    mobileResumeBtn: "#mobileResumeBtn",
    main: "main",
    mainContact: "#main_contact",
    heroBg: "#hero_bg",
    nav: "nav",
    portfolioNav: ".portfolio_nav",
    portfolioNavSingle: ".portfolio_nav_single",
    sentinel: ".portfolio-nav-sentinel",
    hamburgerBtn: ".hamburger-btn",
    mobileMenu: ".mobile-menu",
    profileImg: ".profile_img_container",
    heroText: ".hero_text_container",
    heroTextTop: ".top_text",
    logo: "#logo",
    contactForm: "#contact-form",
    navBtn: "#navBtn",
    socialDropdown: ".social_dropdown",
  };

  /* ==========================
     DOM ELEMENTS
  ========================== */
  const elements = {};
  Object.entries(SELECTORS).forEach(([key, selector]) => {
    elements[key] = document.querySelector(selector);
  });

  console.log("Elements found:", {
    navBtn: !!elements.navBtn,
    socialDropdown: !!elements.socialDropdown,
    contactBtn: !!elements.contactBtn,
    hamburgerBtn: !!elements.hamburgerBtn,
  });

  if (elements.logo) {
    elements.logo.setAttribute("href", "/index.html");
  }

  /* ==========================
     STATE MANAGEMENT
  ========================== */
  const state = {
    homeScrollY: 0,
    hasScrolled: false,
    isHomePage:
      window.location.pathname === "/" ||
      window.location.pathname.includes("index.html"),
  };

  /* ==========================
     UTILITY FUNCTIONS
  ========================== */
  const utils = {
    setVisibility(element, visible) {
      if (element) {
        element.style.visibility = visible ? "" : "hidden";
      }
    },

    setMultipleVisibility(elements, visible) {
      elements.forEach((el) => this.setVisibility(el, visible));
    },

    closeMobileMenu() {
      if (!elements.hamburgerBtn || !elements.mobileMenu) return;

      elements.hamburgerBtn.classList.remove("active");
      elements.mobileMenu.classList.remove("active");
      elements.hamburgerBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    },

    toggleClass(element, className, condition) {
      if (!element) return;
      element.classList.toggle(className, condition);
    },
  };

  /* ==========================
     SCROLL POSITION PERSISTENCE
  ========================== */
  const scrollPersistence = {
    save() {
      if (!state.isHomePage || !elements.main) return;
      sessionStorage.setItem("homeScrollPosition", elements.main.scrollTop);
    },

    restore() {
      if (!state.isHomePage || !elements.main) return;

      const savedScrollPos = sessionStorage.getItem("homeScrollPosition");
      if (savedScrollPos === null) return;

      const scrollPos = parseInt(savedScrollPos, 10);

      // Only hide main if we actually have a position to restore
      elements.main.style.opacity = "0";

      document.body.classList.add("no-transitions");
      document.documentElement.classList.add("no-transitions");

      if (scrollPos > CONFIG.TOP_RESET_SCROLL) {
        elements.nav?.classList.add("scrolled");
        elements.nav?.classList.remove("not-scrolled");
      } else {
        elements.nav?.classList.add("not-scrolled");
        elements.nav?.classList.remove("scrolled");
      }

      utils.toggleClass(
        document.body,
        "scrolled-hero",
        scrollPos > CONFIG.GLOBAL_FADE_SCROLL
      );

      requestAnimationFrame(() => {
        elements.main.scrollTop = scrollPos;
        this.setHeroState(scrollPos);
        sessionStorage.removeItem("homeScrollPosition");

        setTimeout(() => {
          document.body.classList.remove("no-transitions");
          document.documentElement.classList.remove("no-transitions");
          elements.main.style.opacity = "1";
        }, CONFIG.TRANSITION_DELAY);
      });
    },

    setNavState(scrollPos) {
      if (scrollPos > CONFIG.TOP_RESET_SCROLL) {
        elements.nav?.classList.add("scrolled");
        elements.nav?.classList.remove("not-scrolled");
        elements.portfolioNav?.classList.add("scrolled");
        elements.portfolioNavSingle?.classList.add("scrolled");
      } else {
        elements.nav?.classList.add("not-scrolled");
        elements.nav?.classList.remove("scrolled");
        elements.portfolioNav?.classList.remove("scrolled");
        elements.portfolioNavSingle?.classList.remove("scrolled");
      }
    },

    setHeroState(scrollPos) {
      if (scrollPos > CONFIG.HERO_HIDE_SCROLL) {
        elements.heroBg?.classList.add("hidden", "slow-hidden");
      } else {
        elements.heroBg?.classList.remove("hidden", "slow-hidden");
      }
    },
  };

  if (state.isHomePage) {
    window.addEventListener("beforeunload", () => scrollPersistence.save());
  }

  scrollPersistence.restore();

  /* ==========================
     CONTACT OVERLAY (index.html only)
  ========================== */
  const contactOverlay = {
    emailJsLoaded: false,

    async loadEmailJS() {
      if (this.emailJsLoaded) return;

      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
        script.onload = () => {
          emailjs.init("QPwvxbXR9QADme2kc");
          this.emailJsLoaded = true;
          console.log("EmailJS loaded successfully");
          resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    },

    updateButton(isOpen) {
      if (!state.isHomePage) {
        this.updateButtonForNonHomePage();
        return;
      }

      const buttonText = isOpen
        ? 'Close <svg class="icon"><use href="#icon-times"></use></svg>'
        : 'Contact <svg class="icon"><use href="#icon-face-smile"></use></svg>';

      if (elements.contactBtn) {
        elements.contactBtn.innerHTML = buttonText;
        elements.contactBtn.setAttribute("aria-expanded", String(isOpen));
        utils.toggleClass(elements.contactBtn, "open", isOpen);
      }

      if (elements.mobileContactBtn) {
        elements.mobileContactBtn.innerHTML = isOpen
          ? '<svg class="icon"><use href="#icon-arrow-left"></use></svg><span>Back Home</span>'
          : '<svg class="icon"><use href="#icon-face-smile"></use></svg><span>Contact</span>';
      }

      utils.toggleClass(elements.nav, "contact-open", isOpen);
      utils.toggleClass(elements.navBtn, "contact-open", isOpen);
      utils.toggleClass(elements.hamburgerBtn, "contact-open", isOpen);
    },

    updateButtonForNonHomePage() {
      if (elements.contactBtn) {
        elements.contactBtn.innerHTML =
          'Home <svg class="icon"><use href="#icon-arrow-left"></use></svg>';
      }
      if (elements.mobileContactBtn) {
        elements.mobileContactBtn.innerHTML =
          '<svg class="icon"><use href="#icon-arrow-left"></use></svg><span>Back Home</span>';
      }
    },

    async open() {
      if (!state.isHomePage) {
        window.location.href = "/index.html";
        return;
      }

      const isOpen = elements.main.classList.toggle("contact-open");
      utils.toggleClass(elements.mainContact, "active", isOpen);

      if (isOpen) {
        await this.handleOpen();
      } else {
        this.handleClose();
      }

      this.updateButton(isOpen);
      hamburgerMenu.updateState();
    },

    async handleOpen() {
      state.homeScrollY = elements.main.scrollTop;
      elements.heroBg?.classList.add("hidden");
      elements.heroBg?.classList.remove("slow-hidden");
      document.body.classList.remove("scrolled-hero");

      if (state.homeScrollY <= CONFIG.HERO_HIDE_SCROLL) {
        elements.nav?.classList.remove("scrolled");
        elements.nav?.classList.add("not-scrolled");
        elements.portfolioNav?.classList.remove("scrolled");
      }

      utils.closeMobileMenu();

      try {
        await this.loadEmailJS();
      } catch (error) {
        console.error("Failed to load EmailJS:", error);
      }
    },

    handleClose() {
      document.body.classList.add("no-transitions");

      scrollPersistence.setNavState(state.homeScrollY);

      elements.main.scrollTop = state.homeScrollY;

      const heroElements = [
        elements.profileImg,
        elements.heroText,
        elements.heroTextTop,
      ];
      const isScrolledPastHero = state.homeScrollY > CONFIG.HERO_HIDE_SCROLL;

      utils.setMultipleVisibility(heroElements, !isScrolledPastHero);

      requestAnimationFrame(() => {
        if (isScrolledPastHero) {
          elements.heroBg?.classList.remove("hidden");
          elements.heroBg?.classList.add("slow-hidden");
          utils.setMultipleVisibility(heroElements, false);
        } else {
          elements.heroBg?.classList.remove("hidden", "slow-hidden");
          utils.setMultipleVisibility(heroElements, true);
        }

        utils.toggleClass(
          document.body,
          "scrolled-hero",
          state.homeScrollY > CONFIG.GLOBAL_FADE_SCROLL
        );

        setTimeout(() => {
          document.body.classList.remove("no-transitions");
        }, CONFIG.TRANSITION_DELAY);
      });

      utils.closeMobileMenu();
    },
  };

  contactOverlay.updateButton(false);

  elements.contactBtn?.addEventListener("click", () => contactOverlay.open());
  elements.mobileContactBtn?.addEventListener("click", () =>
    contactOverlay.open()
  );

  /* ==========================
     SOCIAL DROPDOWN
  ========================== */
  if (elements.navBtn && elements.socialDropdown) {
    elements.navBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = elements.socialDropdown.classList.toggle("social-active");
      elements.navBtn.classList.toggle("open", isOpen);

      if (isOpen) {
        elements.navBtn.innerHTML =
          'SOCIAL <svg class="icon"><use href="#icon-angle-up"></use></svg>';
      } else {
        elements.navBtn.innerHTML =
          'SOCIAL <svg class="icon"><use href="#icon-angle-down"></use></svg>';
      }

      console.log("Social dropdown toggled:", isOpen);
    });

    document.addEventListener("click", (e) => {
      if (
        elements.socialDropdown.classList.contains("social-active") &&
        !elements.socialDropdown.contains(e.target) &&
        !elements.navBtn.contains(e.target)
      ) {
        elements.socialDropdown.classList.remove("social-active");
        elements.navBtn.classList.remove("open");
        elements.navBtn.innerHTML =
          'SOCIAL <svg class="icon"><use href="#icon-angle-down"></use></svg>';
      }
    });
  }

  /* ==========================
     HAMBURGER MENU
  ========================== */
  const hamburgerMenu = {
    updateState() {
      if (!elements.hamburgerBtn) return;

      const isContactOpen = elements.main?.classList.contains("contact-open");
      const shouldShowX = !state.isHomePage || isContactOpen;

      utils.toggleClass(elements.hamburgerBtn, "active", shouldShowX);
    },

    handleClick() {
      const isContactOpen = elements.main?.classList.contains("contact-open");

      if (!state.isHomePage) {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = "/index.html";
        }
        return;
      }

      if (isContactOpen) {
        contactOverlay.open();
        return;
      }

      this.toggle();
    },

    toggle() {
      const isOpen = elements.hamburgerBtn.classList.toggle("active");
      utils.toggleClass(elements.mobileMenu, "active", isOpen);
      elements.hamburgerBtn.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    },

    closeOnOutsideClick(event) {
      if (
        elements.mobileMenu.classList.contains("active") &&
        !elements.mobileMenu.contains(event.target) &&
        !elements.hamburgerBtn.contains(event.target)
      ) {
        utils.closeMobileMenu();
      }
    },
  };

  if (elements.hamburgerBtn && elements.mobileMenu) {
    hamburgerMenu.updateState();

    elements.hamburgerBtn.addEventListener("click", () =>
      hamburgerMenu.handleClick()
    );
    document.addEventListener("click", (e) =>
      hamburgerMenu.closeOnOutsideClick(e)
    );
  }

  /* ==========================
     RESUME BUTTON
  ========================== */
  const resumeHandler = () => {
    alert("Resume functionality - Add your resume URL or PDF here!");
    utils.closeMobileMenu();
  };

  elements.resumeBtn?.addEventListener("click", resumeHandler);
  elements.mobileResumeBtn?.addEventListener("click", resumeHandler);

  /* ==========================
     SCROLL CONTROLLER
  ========================== */
  const scrollController = {
    handleScroll() {
      const scrollY = elements.main.scrollTop;
      state.hasScrolled = scrollY > 0;

      this.updateNavState(scrollY);
      this.updateHeroState(scrollY);
    },

    updateNavState(scrollY) {
      if (scrollY <= CONFIG.TOP_RESET_SCROLL) {
        elements.nav?.classList.remove("scrolled");
        elements.nav?.classList.add("not-scrolled");
        elements.portfolioNav?.classList.remove("scrolled");
        elements.portfolioNavSingle?.classList.remove("scrolled");
      } else if (elements.sentinel) {
        const sentinelRect = elements.sentinel.getBoundingClientRect();
        const isStuck = sentinelRect.top < CONFIG.STICKY_NAV_OFFSET;
        utils.toggleClass(elements.nav, "scrolled", isStuck);
        utils.toggleClass(elements.nav, "not-scrolled", !isStuck);
        utils.toggleClass(elements.portfolioNav, "scrolled", isStuck);
        utils.toggleClass(elements.portfolioNavSingle, "scrolled", isStuck);
      }
    },

    updateHeroState(scrollY) {
      if (
        !state.isHomePage ||
        elements.main?.classList.contains("contact-open")
      ) {
        return;
      }

      const heroElements = [
        elements.profileImg,
        elements.heroText,
        elements.heroTextTop,
      ];

      if (scrollY > CONFIG.HERO_HIDE_SCROLL) {
        elements.heroBg?.classList.add("slow-hidden");
        utils.setMultipleVisibility(heroElements, false);
      } else {
        elements.heroBg?.classList.remove("hidden", "slow-hidden");
        utils.setMultipleVisibility(heroElements, true);
      }

      utils.toggleClass(
        document.body,
        "scrolled-hero",
        scrollY > CONFIG.GLOBAL_FADE_SCROLL
      );
    },
  };

  elements.main?.addEventListener("scroll", () =>
    scrollController.handleScroll()
  );

  /* ==========================
     PORTFOLIO NAV OBSERVER
  ========================== */
  if (
    elements.sentinel &&
    (elements.portfolioNav || elements.portfolioNavSingle)
  ) {
    const stickyObserver = new IntersectionObserver(
      ([entry]) => {
        if (!state.hasScrolled) return;

        if (elements.main.scrollTop <= CONFIG.TOP_RESET_SCROLL) {
          elements.nav?.classList.remove("scrolled");
          elements.nav?.classList.add("not-scrolled");
          elements.portfolioNav?.classList.remove("scrolled");
          elements.portfolioNavSingle?.classList.remove("scrolled");
          return;
        }

        if (elements.main?.classList.contains("contact-open")) return;

        const isStuck = !entry.isIntersecting;
        utils.toggleClass(elements.nav, "scrolled", isStuck);
        utils.toggleClass(elements.nav, "not-scrolled", !isStuck);
        utils.toggleClass(elements.portfolioNav, "scrolled", isStuck);
        utils.toggleClass(elements.portfolioNavSingle, "scrolled", isStuck);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: `-${CONFIG.STICKY_NAV_OFFSET}px 0px 0px 0px`,
      }
    );

    stickyObserver.observe(elements.sentinel);
  }

  /* ==========================
     CONTACT FORM + EMAILJS (index.html only)
  ========================== */
  if (elements.contactForm) {
    window.onSubmit = function (token) {
      if (typeof emailjs === "undefined") {
        console.error("EmailJS not loaded yet");
        alert("Please wait a moment and try again.");
        grecaptcha.reset();
        return;
      }

      const submitBtn = elements.contactForm.querySelector(
        'button[type="submit"]'
      );
      const originalBtnText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = "Sending...";

      const formData = {
        title: "lineaoldenburg.com",
        time: new Date().toLocaleString(),
        user_name: elements.contactForm.user_name.value,
        user_email: elements.contactForm.user_email.value,
        message: elements.contactForm.message.value,
        "g-recaptcha-response": token,
      };

      emailjs
        .send("service_wla42p6", "template_wbeyz9s", formData)
        .then(() => {
          alert("Thanks for reaching out; I'll get back to you!");
          elements.contactForm.reset();
        })
        .catch((error) => {
          console.error("EmailJS error:", error);
          alert("Failed to send message.");
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
          grecaptcha.reset();
        });
    };

    elements.contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      grecaptcha.execute();
    });
  }

  console.log("App initialized successfully!");
}
