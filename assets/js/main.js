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

const supportsGarciCursor = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");

if (body) {
  const cursor = document.createElement("div");
  const cursorCircle = document.createElement("div");
  const cursorFrames = Array.from(document.querySelectorAll("iframe"));
  const cursorHoverSelector = [
    "a[href]",
    "button",
    "[role='button']",
    ".nav-toggle",
    "[data-product-modal-trigger]",
    "[data-product-modal-close]"
  ].join(", ");
  const cursorSuspendSelector = "input, textarea, select";
  let cursorVisible = false;
  let cursorSuspended = false;
  let cursorHovering = false;
  let cursorPressed = false;

  cursor.className = "garci-cursor";
  cursorCircle.className = "garci-cursor-circle";
  cursor.setAttribute("aria-hidden", "true");
  cursor.append(cursorCircle);
  body.append(cursor);

  const syncCursorState = () => {
    const isVisible = cursorVisible && !cursorSuspended;

    body.classList.toggle("garci-cursor-visible", isVisible);
    body.classList.toggle("garci-cursor-hover", isVisible && cursorHovering);
    body.classList.toggle("garci-cursor-pressed", isVisible && cursorPressed);
  };

  const resetGarciCursor = () => {
    cursorVisible = false;
    cursorSuspended = false;
    cursorHovering = false;
    cursorPressed = false;
    body.classList.remove("garci-cursor-visible", "garci-cursor-hover", "garci-cursor-pressed");
  };

  const syncGarciCursorState = () => {
    const enabled = supportsGarciCursor.matches;

    body.classList.toggle("garci-cursor-enabled", enabled);

    if (!enabled) {
      resetGarciCursor();
    }
  };

  document.addEventListener("pointermove", (event) => {
    if (!supportsGarciCursor.matches) {
      return;
    }

    const currentTarget = event.target instanceof Element ? event.target : null;
    cursorSuspended = Boolean(currentTarget?.closest(cursorSuspendSelector));
    cursorHovering = Boolean(currentTarget?.closest(cursorHoverSelector));
    cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
    cursorVisible = true;

    if (cursorSuspended) {
      cursorPressed = false;
    }

    syncCursorState();
  }, { passive: true });

  document.documentElement.addEventListener("mouseleave", resetGarciCursor);
  window.addEventListener("blur", resetGarciCursor);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      resetGarciCursor();
    }
  });

  document.addEventListener("pointerdown", () => {
    if (supportsGarciCursor.matches && cursorVisible && !cursorSuspended) {
      cursorPressed = true;
      syncCursorState();
    }
  });

  document.addEventListener("pointerup", () => {
    cursorPressed = false;
    syncCursorState();
  });

  cursorFrames.forEach((frame) => {
    frame.addEventListener("mouseenter", () => {
      if (supportsGarciCursor.matches) {
        cursorSuspended = true;
        cursorPressed = false;
        syncCursorState();
      }
    });

    frame.addEventListener("mouseleave", () => {
      if (supportsGarciCursor.matches) {
        cursorSuspended = false;
      }
    });
  });

  if (typeof supportsGarciCursor.addEventListener === "function") {
    supportsGarciCursor.addEventListener("change", syncGarciCursorState);
  } else {
    supportsGarciCursor.addListener(syncGarciCursorState);
  }

  syncGarciCursorState();
}

const sliders = Array.from(document.querySelectorAll("[data-slider]"));

sliders.forEach((slider) => {
  const slides = Array.from(slider.querySelectorAll("[data-slide]"));

  if (!slides.length) {
    return;
  }

  const dots = Array.from(slider.querySelectorAll("[data-dot]"));
  const controls = Array.from(slider.querySelectorAll("[data-direction]"));
  const interval = Number(slider.dataset.sliderInterval || 5500);
  const initialIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
  let activeIndex = initialIndex >= 0 ? initialIndex : 0;
  let timerId = null;

  const showSlide = (nextIndex) => {
    activeIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");
    });

    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  };

  const stopTimer = () => {
    window.clearInterval(timerId);
    timerId = null;
  };

  const restartTimer = () => {
    stopTimer();

    if (slides.length < 2 || interval <= 0) {
      return;
    }

    timerId = window.setInterval(() => showSlide(activeIndex + 1), interval);
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

  slider.addEventListener("mouseenter", stopTimer);
  slider.addEventListener("mouseleave", restartTimer);
  slider.addEventListener("focusin", stopTimer);
  slider.addEventListener("focusout", (event) => {
    const nextFocusedElement = event.relatedTarget;

    if (!(nextFocusedElement instanceof Node) || !slider.contains(nextFocusedElement)) {
      restartTimer();
    }
  });

  showSlide(activeIndex);
  restartTimer();
});

const staticForms = Array.from(document.querySelectorAll("[data-static-form]"));

staticForms.forEach((form) => {
  const note = form.querySelector("[data-static-form-note]");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (note) {
      note.textContent = "Demo mode only. No message was sent because a real form endpoint is not connected yet.";
      note.classList.add("is-demo-feedback");
    }
  });
});

const productModal = document.querySelector("#product-modal");

if (productModal) {
  const productTriggers = Array.from(document.querySelectorAll("[data-product-modal-trigger]"));
  const closeControls = Array.from(productModal.querySelectorAll("[data-product-modal-close]"));
  const modalTitle = productModal.querySelector("#product-modal-title");
  const modalImage = productModal.querySelector("#product-modal-image");
  const modalFeatures = productModal.querySelector("#product-modal-features");
  let previousFocusedElement = null;

  const setModalFeatures = (featureList) => {
    if (!modalFeatures) {
      return;
    }

    modalFeatures.innerHTML = "";

    featureList.forEach((feature) => {
      const item = document.createElement("li");
      item.textContent = feature;
      modalFeatures.append(item);
    });
  };

  const openProductModal = (trigger) => {
    const title = trigger.dataset.title || "Product Details";
    const image = trigger.dataset.image || "";
    const alt = trigger.dataset.alt || title;
    const features = (trigger.dataset.features || "")
      .split("|")
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (modalTitle) {
      modalTitle.textContent = title;
    }

    if (modalImage && image) {
      modalImage.src = image;
      modalImage.alt = alt;
    }

    setModalFeatures(features);
    previousFocusedElement = document.activeElement;
    productModal.hidden = false;
    body.classList.add("product-modal-open");
    navToggle?.setAttribute("aria-expanded", "false");
    body.classList.remove("nav-open");
    productModal.querySelector(".product-modal-close")?.focus();
  };

  const closeProductModal = () => {
    if (productModal.hidden) {
      return;
    }

    productModal.hidden = true;
    body.classList.remove("product-modal-open");

    if (previousFocusedElement instanceof HTMLElement) {
      previousFocusedElement.focus();
    }
  };

  productTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => openProductModal(trigger));
    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openProductModal(trigger);
      }
    });
  });

  closeControls.forEach((control) => {
    control.addEventListener("click", closeProductModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeProductModal();
    }
  });
}
