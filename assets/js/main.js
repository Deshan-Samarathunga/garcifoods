const body = document.body;
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const header = document.querySelector(".site-header");
const preloader = document.querySelector("#site-preloader");
let preloaderHidden = false;

const hidePreloader = () => {
  if (preloaderHidden) {
    return;
  }

  preloaderHidden = true;

  if (!preloader) {
    body.classList.remove("is-loading");
    return;
  }

  preloader.classList.add("is-hidden");
  body.classList.remove("is-loading");

  window.setTimeout(() => {
    preloader.remove();
  }, 300);
};

if (document.readyState === "complete") {
  hidePreloader();
} else {
  window.addEventListener("load", hidePreloader, { once: true });
  window.setTimeout(hidePreloader, 2500);
}

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      body.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const syncHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 16);
};

syncHeaderState();
window.addEventListener("scroll", syncHeaderState, { passive: true });

const slider = document.querySelector("[data-slider]");

if (slider) {
  const slides = Array.from(slider.querySelectorAll("[data-slide]"));
  const dots = Array.from(slider.querySelectorAll("[data-dot]"));
  const controls = Array.from(slider.querySelectorAll("[data-direction]"));
  let activeIndex = 0;
  let timerId = null;

  const showSlide = (nextIndex) => {
    activeIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === activeIndex);
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
      dot.setAttribute("aria-current", index === activeIndex ? "true" : "false");
    });
  };

  const restartTimer = () => {
    window.clearInterval(timerId);
    timerId = window.setInterval(() => showSlide(activeIndex + 1), 5500);
  };

  controls.forEach((control) => {
    control.addEventListener("click", () => {
      const direction = Number(control.dataset.direction || 0);
      showSlide(activeIndex + direction);
      restartTimer();
    });
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const nextIndex = Number(dot.dataset.dot || 0);
      showSlide(nextIndex);
      restartTimer();
    });
  });

  showSlide(0);
  restartTimer();
}
