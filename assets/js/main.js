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
