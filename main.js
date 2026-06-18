document.addEventListener("DOMContentLoaded", () => {
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // Initialize Core Systems
  initPageTransitions();
  initLenisScroll();
  initCustomCursor();
  initHeaderScroll();
  initMobileMenu();
  initTextSplitting();
  initHoverTilt();
  initScrollAnimations();
});

// 1. Lenis Smooth Scroll Engine Setup
let lenis;
function initLenisScroll() {
  // Skip smooth scroll on mobile devices for performance
  if (window.innerWidth < 992) return;

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.5,
    infinite: false,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

// 2. Custom Awwwards-style Cursor Tracker
function initCustomCursor() {
  const cursor = document.querySelector(".custom-cursor");
  const follower = document.querySelector(".custom-cursor-follower");
  if (!cursor || !follower) return;

  // Position coordinates
  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Quick move for raw cursor
    gsap.to(cursor, {
      x: mouseX,
      y: mouseY,
      duration: 0.05,
      overwrite: "auto"
    });
  });

  // Smooth follow loop for follower circle
  gsap.ticker.add(() => {
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    gsap.set(follower, {
      x: followerX,
      y: followerY
    });
  });

  // Hover states for links and interactive elements
  const hoverElements = document.querySelectorAll("a, button, .clickable, .tier-btn, .btn");
  hoverElements.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.classList.add("hovering");
      follower.classList.add("hovering");
      
      // If it is a programs card, add magnetic label view state
      if (el.classList.contains("magnetic-indicator")) {
        follower.classList.add("magnetic-btn");
      }
    });

    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("hovering");
      follower.classList.remove("hovering");
      follower.classList.remove("magnetic-btn");
    });
  });
}

// 3. Page Transition — removed. Navigation is instant.
// Hero entrance animations still fire after DOM is ready.
function initPageTransitions() {
  // Trigger hero entrance immediately on page load
  triggerHeroEntrance();

  // Restore smooth scroll for internal anchor links only
  document.querySelectorAll("a").forEach((link) => {
    const href = link.getAttribute("href");

    if (href && href.startsWith("#") && href.length > 1) {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          if (lenis) {
            lenis.scrollTo(target, { offset: -60 });
          } else {
            window.scrollTo({ top: target.offsetTop - 60, behavior: "smooth" });
          }
        }
      });
    }
    // All .html links are left alone — browser navigates instantly
  });
}

// 4. Header Dynamic Scrolling Styles
function initHeaderScroll() {
  const header = document.querySelector("header.main-header");
  const progress = document.querySelector(".scroll-progress-bar");
  
  if (!header) return;

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    
    // Sticky visual class
    if (scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    // Scroll progress calculation
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0 && progress) {
      const scrollPercent = (scrollY / docHeight) * 100;
      progress.style.width = scrollPercent + "%";
    }
  });
}

// 5. Mobile Toggle Navigation
function initMobileMenu() {
  const toggle = document.querySelector(".mobile-toggle");
  const navMenu = document.querySelector("nav.nav-menu");
  
  if (!toggle || !navMenu) return;

  toggle.addEventListener("click", () => {
    toggle.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  // Close menu when clicked on items
  navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      toggle.classList.remove("active");
      navMenu.classList.remove("active");
    });
  });
}

// 6. Text Splitting Helper for Character-by-Character Entrance animations
function initTextSplitting() {
  const splitTargets = document.querySelectorAll(".split-text");
  splitTargets.forEach(el => {
    const text = el.textContent.trim();
    el.textContent = "";
    
    const words = text.split(" ");
    words.forEach((word, wordIdx) => {
      const wordSpan = document.createElement("span");
      wordSpan.className = "word-wrap";
      
      const innerWord = document.createElement("span");
      innerWord.className = "word-inner";
      
      // Split into characters
      const chars = word.split("");
      chars.forEach(char => {
        const charSpan = document.createElement("span");
        charSpan.textContent = char;
        charSpan.className = "char-el";
        innerWord.appendChild(charSpan);
      });
      
      wordSpan.appendChild(innerWord);
      el.appendChild(wordSpan);
      
      // Re-insert spaces
      if (wordIdx < words.length - 1) {
        el.appendChild(document.createTextNode(" "));
      }
    });
  });
}

// 7. Hero Cinematic Entrance Timeline Animation
function triggerHeroEntrance() {
  const heroTitle = document.querySelector(".hero-title");
  const heroSubtitle = document.querySelector(".hero-subtitle");
  const heroDesc = document.querySelector(".hero-description");
  const heroBgs = document.querySelectorAll(".hero-bg-media img");
  const heroBtns = document.querySelector(".hero-buttons");
  const headerElements = document.querySelectorAll("header.main-header > *");

  const mainTimeline = gsap.timeline();

  // Background zoom out sequence
  if (heroBgs.length > 0) {
    mainTimeline.fromTo(heroBgs, 
      { scale: 1.25 },
      { scale: 1.0, duration: 2.2, ease: "power3.out" },
      0
    );
  }

  // Header slide down
  if (headerElements.length > 0) {
    mainTimeline.fromTo(headerElements,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" },
      0.5
    );
  }

  // Subtitle fade + move
  if (heroSubtitle) {
    mainTimeline.fromTo(heroSubtitle,
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
      0.8
    );
  }

  // Title character slide up staggered
  if (heroTitle) {
    const chars = heroTitle.querySelectorAll(".char-el");
    if (chars.length > 0) {
      mainTimeline.fromTo(chars,
        { yPercent: 100 },
        { yPercent: 0, duration: 1.0, stagger: 0.02, ease: "power4.out" },
        0.9
      );
    } else {
      mainTimeline.fromTo(heroTitle,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.0, ease: "power4.out" },
        0.9
      );
    }
  }

  // Description and buttons stagger
  if (heroDesc) {
    mainTimeline.fromTo(heroDesc,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 0.85, duration: 0.8, ease: "power2.out" },
      1.2
    );
  }

  if (heroBtns) {
    mainTimeline.fromTo(heroBtns,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
      1.4
    );
  }
}

// 8. 3D Card Hover Tilt Interaction
function initHoverTilt() {
  // Mobile check: skip resource-heavy 3D effects on narrow layouts
  if (window.innerWidth < 992) return;

  const tiltCards = document.querySelectorAll(".tilt-card");
  tiltCards.forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - (rect.width / 2);
      const y = e.clientY - rect.top - (rect.height / 2);
      
      // subtle rotation proportional to offset
      gsap.to(card, {
        rotateY: x * 0.08,
        rotateX: -y * 0.08,
        transformPerspective: 800,
        ease: "power3.out",
        duration: 0.4,
        overwrite: "auto"
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        ease: "power3.out",
        duration: 0.6,
        overwrite: "auto"
      });
    });
  });
}

// 9. Standard scroll trigger hooks for entry animations
function initScrollAnimations() {
  const isMobile = window.innerWidth < 768;

  // Parallax elements using data-speed attribute
  if (window.innerWidth >= 992) {
    gsap.utils.toArray("[data-speed]").forEach(el => {
      const speed = parseFloat(el.getAttribute("data-speed") || "1.0");
      // speed = 1 means normal. speed > 1 is faster, speed < 1 is slower.
      const movement = (1 - speed) * 120; // total range of motion
      
      gsap.to(el, {
        y: movement,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });
  }

  // Stagger reveal groups (e.g. grid items)
  gsap.utils.toArray(".stagger-group").forEach(group => {
    const items = group.querySelectorAll(".stagger-item");
    if (items.length === 0) return;

    gsap.from(items, {
      opacity: 0,
      y: isMobile ? 20 : 40,
      duration: isMobile ? 0.5 : 0.8,
      stagger: isMobile ? 0.1 : 0.15,
      ease: "power2.out",
      scrollTrigger: {
        trigger: group,
        start: isMobile ? "top 92%" : "top 85%",
        toggleActions: "play none none none"
      }
    });
  });

  // Reveal elements on viewport enter
  gsap.utils.toArray(".scroll-reveal").forEach(el => {
    gsap.from(el, {
      opacity: 0,
      y: isMobile ? 15 : 30,
      duration: isMobile ? 0.5 : 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: isMobile ? "top 92%" : "top 85%",
        toggleActions: "play none none none"
      }
    });
  });
  
  // Custom SVG path drawing triggers on scroll
  gsap.utils.toArray(".svg-draw-path").forEach(path => {
    const pathLength = path.getTotalLength();
    gsap.set(path, { strokeDasharray: pathLength, strokeDashoffset: pathLength });

    gsap.to(path, {
      strokeDashoffset: 0,
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: path,
        start: "top 80%",
        end: "bottom 50%",
        scrub: 1
      }
    });
  });
}

// Helper: Setup donation calculation inside Donate Page
window.setupDonateForm = function() {
  const tierBtns = document.querySelectorAll(".tier-btn");
  const customInput = document.querySelector(".custom-amount-input");
  const summaryText = document.querySelector(".donate-impact-summary");
  
  if (!tierBtns.length || !summaryText) return;

  const impacts = {
    "25": "feeds a refugee child for two full weeks, providing vital nutrition and vitamins.",
    "50": "provides clean, safe drinking water to an entire rural school of 200+ pupils.",
    "100": "purchases and distributes 50 native, resilient tree saplings to restore deforested lands.",
    "250": "funds medical check-ups and vaccines for 10 community mothers and newborns.",
    "custom": "supports our ongoing grassroots missions where the funds are most urgently required."
  };

  function updateImpactText(amount) {
    let key = impacts[amount] ? amount : "custom";
    let desc = impacts[key];
    
    // GSAP fade text transition
    gsap.to(summaryText, {
      opacity: 0,
      y: -10,
      duration: 0.25,
      onComplete: () => {
        summaryText.innerHTML = `Your donation of <strong>$${amount}</strong> ${desc}`;
        gsap.to(summaryText, {
          opacity: 1,
          y: 0,
          duration: 0.25
        });
      }
    });
  }

  tierBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tierBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const val = btn.getAttribute("data-amount");
      if (customInput) customInput.value = "";
      updateImpactText(val);
    });
  });

  if (customInput) {
    customInput.addEventListener("input", () => {
      tierBtns.forEach(b => b.classList.remove("active"));
      const val = customInput.value.trim();
      if (val && !isNaN(val) && parseFloat(val) > 0) {
        updateImpactText(val);
      } else {
        updateImpactText("0");
      }
    });
  }
};
