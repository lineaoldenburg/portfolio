// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Script loaded successfully!");
  
  /* ==========================
     CONFIGURATION & CONSTANTS
  ========================== */
  const CONFIG = {
    HERO_HIDE_SCROLL: 100,
    GLOBAL_FADE_SCROLL: 2,
    TOP_RESET_SCROLL: 2,
    TRANSITION_DELAY: 100,
    STICKY_NAV_OFFSET: 80
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
    sentinel: ".portfolio-nav-sentinel",
    hamburgerBtn: ".hamburger-btn",
    mobileMenu: ".mobile-menu",
    profileImg: ".profile_img_container",
    heroText: ".hero_text_container",
    heroTextTop: ".top_text",
    logo: "#logo",
    contactForm: "#contact-form",
    navBtn: "#navBtn",
    socialDropdown: ".social_dropdown"
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
    contactBtn: !!elements.contactBtn
  });

  // Ensure logo always links to homepage
  if (elements.logo) {
    elements.logo.setAttribute("href", "/index.html");
  }

  /* ==========================
     STATE MANAGEMENT
  ========================== */
  const state = {
    homeScrollY: 0,
    hasScrolled: false,
    isHomePage: window.location.pathname === "/" || 
                window.location.pathname.includes("index.html")
  };

  /* ==========================
     UTILITY FUNCTIONS
  ========================== */
  const utils = {
    // Toggle element visibility
    setVisibility(element, visible) {
      if (element) {
        element.style.visibility = visible ? "" : "hidden";
      }
    },

    // Set multiple elements visibility
    setMultipleVisibility(elements, visible) {
      elements.forEach(el => this.setVisibility(el, visible));
    },

    // Close mobile menu
    closeMobileMenu() {
      if (!elements.hamburgerBtn || !elements.mobileMenu) return;
      
      elements.hamburgerBtn.classList.remove("active");
      elements.mobileMenu.classList.remove("active");
      elements.hamburgerBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    },

    // Toggle class based on condition
    toggleClass(element, className, condition) {
      if (!element) return;
      element.classList.toggle(className, condition);
    }
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
      
      // Disable transitions during restoration
      document.body.classList.add("no-transitions");
      
      // Pre-set nav state to prevent flicker
      this.setNavState(scrollPos);
      
      // Pre-set body scrolled state
      utils.toggleClass(document.body, "scrolled-hero", scrollPos > CONFIG.GLOBAL_FADE_SCROLL);
      
      // Restore scroll position
      requestAnimationFrame(() => {
        elements.main.scrollTop = scrollPos;
        this.setHeroState(scrollPos);
        sessionStorage.removeItem("homeScrollPosition");
        
        // Re-enable transitions
        setTimeout(() => {
          document.body.classList.remove("no-transitions");
        }, CONFIG.TRANSITION_DELAY);
      });
    },

    setNavState(scrollPos) {
      if (scrollPos > CONFIG.TOP_RESET_SCROLL) {
        elements.nav?.classList.add("scrolled");
        elements.portfolioNav?.classList.add("scrolled");
      } else {
        elements.nav?.classList.remove("scrolled");
        elements.portfolioNav?.classList.remove("scrolled");
      }
    },

    setHeroState(scrollPos) {
      if (scrollPos > CONFIG.HERO_HIDE_SCROLL) {
        elements.heroBg?.classList.add("hidden", "slow-hidden");
      } else {
        elements.heroBg?.classList.remove("hidden", "slow-hidden");
      }
    }
  };

  // Save scroll position when leaving homepage
  if (state.isHomePage) {
    window.addEventListener("beforeunload", () => scrollPersistence.save());
  }

  // Restore scroll position on page load
  scrollPersistence.restore();

  /* ==========================
     CONTACT OVERLAY
  ========================== */
  const contactOverlay = {
    updateButton(isOpen) {
      if (!state.isHomePage) {
        this.updateButtonForNonHomePage();
        return;
      }

      const buttonText = isOpen
        ? 'Close <i class="fas fa-times"></i>'
        : 'Contact <i class="fa-solid fa-face-smile"></i>';

      if (elements.contactBtn) {
        elements.contactBtn.innerHTML = buttonText;
        elements.contactBtn.setAttribute("aria-expanded", String(isOpen));
        utils.toggleClass(elements.contactBtn, "open", isOpen);
      }

      if (elements.mobileContactBtn) {
        elements.mobileContactBtn.innerHTML = isOpen
          ? '<i class="fa-solid fa-arrow-left"></i><span>Back Home</span>'
          : '<i class="fa-solid fa-face-smile"></i><span>Contact</span>';
      }
    },

    updateButtonForNonHomePage() {
      if (elements.contactBtn) {
        elements.contactBtn.innerHTML = 'Home <i class="fa-solid fa-arrow-left"></i>';
      }
      if (elements.mobileContactBtn) {
        elements.mobileContactBtn.innerHTML = 
          '<i class="fa-solid fa-arrow-left"></i><span>Back Home</span>';
      }
    },

    open() {
      if (!state.isHomePage) {
        window.location.href = "/index.html";
        return;
      }

      const isOpen = elements.main.classList.toggle("contact-open");
      utils.toggleClass(elements.mainContact, "active", isOpen);

      if (isOpen) {
        this.handleOpen();
      } else {
        this.handleClose();
      }

      this.updateButton(isOpen);
      hamburgerMenu.updateState(); // Update hamburger icon
    },

    handleOpen() {
      state.homeScrollY = elements.main.scrollTop;
      elements.heroBg?.classList.add("hidden");
      elements.heroBg?.classList.remove("slow-hidden");
      document.body.classList.remove("scrolled-hero");
      
      // Keep nav scrolled if we were scrolled past hero
      if (state.homeScrollY <= CONFIG.HERO_HIDE_SCROLL) {
        elements.nav?.classList.remove("scrolled");
        elements.portfolioNav?.classList.remove("scrolled");
      }
      // else: keep nav scrolled state as is
      
      utils.closeMobileMenu();
    },

    handleClose() {
      // Disable transitions to prevent flicker
      document.body.classList.add("no-transitions");
      
      // Set nav state before restoring scroll to prevent flicker
      scrollPersistence.setNavState(state.homeScrollY);

      // Restore scroll position
      elements.main.scrollTop = state.homeScrollY;

      // Handle hero elements visibility
      const heroElements = [elements.profileImg, elements.heroText, elements.heroTextTop];
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
        
        // Re-enable transitions after state is set
        setTimeout(() => {
          document.body.classList.remove("no-transitions");
        }, CONFIG.TRANSITION_DELAY);
      });

      utils.closeMobileMenu();
    }
  };

  // Initialize contact button state
  contactOverlay.updateButton(false);

  // Attach contact button listeners
  elements.contactBtn?.addEventListener("click", () => contactOverlay.open());
  elements.mobileContactBtn?.addEventListener("click", () => contactOverlay.open());

  /* ==========================
     SOCIAL DROPDOWN
  ========================== */
  if (elements.navBtn && elements.socialDropdown) {
    elements.navBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = elements.socialDropdown.classList.toggle("social-active");
      elements.navBtn.classList.toggle("open", isOpen);
      
      // Toggle button content and icon
      if (isOpen) {
        elements.navBtn.innerHTML = 'SOCIAL <i class="fa-solid fa-angle-up"></i>';
      } else {
        elements.navBtn.innerHTML = 'SOCIAL <i class="fa-solid fa-angle-down"></i>';
      }
      
      console.log("Social dropdown toggled:", isOpen);
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (elements.socialDropdown.classList.contains("social-active") &&
          !elements.socialDropdown.contains(e.target) &&
          !elements.navBtn.contains(e.target)) {
        elements.socialDropdown.classList.remove("social-active");
        elements.navBtn.classList.remove("open");
        elements.navBtn.innerHTML = 'SOCIAL <i class="fa-solid fa-angle-down"></i>';
      }
    });
  } else {
    console.log("Social dropdown elements not found:", {
      navBtn: !!elements.navBtn,
      socialDropdown: !!elements.socialDropdown
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
      
      // Use the existing 'active' class to show X
      utils.toggleClass(elements.hamburgerBtn, "active", shouldShowX);
    },

    handleClick() {
      const isContactOpen = elements.main?.classList.contains("contact-open");
      
      // If not on homepage, go back home
      if (!state.isHomePage) {
        window.location.href = "/index.html";
        return;
      }
      
      // If contact is open, close it
      if (isContactOpen) {
        contactOverlay.open(); // This will toggle it closed
        return;
      }
      
      // Otherwise, toggle mobile menu normally
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
    }
  };

  if (elements.hamburgerBtn && elements.mobileMenu) {
    // Initialize hamburger state
    hamburgerMenu.updateState();
    
    elements.hamburgerBtn.addEventListener("click", () => hamburgerMenu.handleClick());
    document.addEventListener("click", (e) => hamburgerMenu.closeOnOutsideClick(e));
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
        elements.portfolioNav?.classList.remove("scrolled");
      } else if (elements.sentinel) {
        const sentinelRect = elements.sentinel.getBoundingClientRect();
        const isStuck = sentinelRect.top < CONFIG.STICKY_NAV_OFFSET;
        utils.toggleClass(elements.nav, "scrolled", isStuck);
        utils.toggleClass(elements.portfolioNav, "scrolled", isStuck);
      }
    },

    updateHeroState(scrollY) {
      if (!state.isHomePage || elements.main.classList.contains("contact-open")) {
        return;
      }

      const heroElements = [elements.profileImg, elements.heroText, elements.heroTextTop];

      if (scrollY > CONFIG.HERO_HIDE_SCROLL) {
        elements.heroBg?.classList.add("slow-hidden");
        utils.setMultipleVisibility(heroElements, false);
      } else {
        elements.heroBg?.classList.remove("hidden", "slow-hidden");
        utils.setMultipleVisibility(heroElements, true);
      }

      utils.toggleClass(document.body, "scrolled-hero", scrollY > CONFIG.GLOBAL_FADE_SCROLL);
    }
  };

  elements.main?.addEventListener("scroll", () => scrollController.handleScroll());

  /* ==========================
     PORTFOLIO NAV OBSERVER
  ========================== */
  if (elements.sentinel && elements.portfolioNav) {
    const stickyObserver = new IntersectionObserver(
      ([entry]) => {
        if (!state.hasScrolled) return;
        
        if (elements.main.scrollTop <= CONFIG.TOP_RESET_SCROLL) {
          elements.nav?.classList.remove("scrolled");
          elements.portfolioNav?.classList.remove("scrolled");
          return;
        }
        
        if (elements.main.classList.contains("contact-open")) return;
        
        const isStuck = !entry.isIntersecting;
        utils.toggleClass(elements.nav, "scrolled", isStuck);
        utils.toggleClass(elements.portfolioNav, "scrolled", isStuck);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: `-${CONFIG.STICKY_NAV_OFFSET}px 0px 0px 0px`
      }
    );

    stickyObserver.observe(elements.sentinel);
  }

  /* ==========================
     CONTACT FORM + EMAILJS
  ========================== */
  if (elements.contactForm) {
    emailjs.init("QPwvxbXR9QADme2kc");

    // Global function for reCAPTCHA
    window.onSubmit = function (token) {
      const submitBtn = elements.contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      const formData = {
        title: "lineaoldenburg.com",
        time: new Date().toLocaleString(),
        user_name: elements.contactForm.user_name.value,
        user_email: elements.contactForm.user_email.value,
        message: elements.contactForm.message.value,
        "g-recaptcha-response": token
      };

      emailjs
        .send("service_wla42p6", "template_wbeyz9s", formData)
        .then(() => {
          alert("Message sent successfully!");
          elements.contactForm.reset();
        })
        .catch((error) => {
          console.error("EmailJS error:", error);
          alert("Failed to send message.");
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
          grecaptcha.reset();
        });
    };

    elements.contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      grecaptcha.execute();
    });
  }
});