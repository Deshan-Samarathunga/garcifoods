const body = document.body;
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const header = document.querySelector(".site-header");
const preloader = document.querySelector("#site-preloader");
const mobileNavQuery = window.matchMedia("(max-width: 900px)");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let preloaderHidden = false;

body.classList.add("js-enabled");

const hidePreloader = () => {
  if (preloaderHidden) {
    return;
  }

  preloaderHidden = true;

  if (!preloader) {
    body.classList.remove("is-loading");
    body.classList.add("is-ready");
    return;
  }

  preloader.classList.add("is-hidden");
  body.classList.remove("is-loading");

  window.setTimeout(() => {
    preloader.remove();
    body.classList.add("is-ready");
  }, 300);
};

if (document.readyState === "complete") {
  hidePreloader();
} else {
  document.addEventListener("DOMContentLoaded", hidePreloader, { once: true });
  window.addEventListener("load", hidePreloader, { once: true });
  window.setTimeout(hidePreloader, 1200);
}

const closeNavigation = () => {
  body.classList.remove("nav-open");
  navToggle?.setAttribute("aria-expanded", "false");
};

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeNavigation();
    });
  });

  document.addEventListener("click", (event) => {
    if (!body.classList.contains("nav-open")) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Node) || siteNav.contains(target) || navToggle.contains(target)) {
      return;
    }

    closeNavigation();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && body.classList.contains("nav-open")) {
      closeNavigation();
    }
  });

  const syncNavigationViewport = () => {
    if (!mobileNavQuery.matches) {
      closeNavigation();
    }
  };

  if (typeof mobileNavQuery.addEventListener === "function") {
    mobileNavQuery.addEventListener("change", syncNavigationViewport);
  } else {
    mobileNavQuery.addListener(syncNavigationViewport);
  }
}

const syncHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 16);
};

syncHeaderState();
window.addEventListener("scroll", syncHeaderState, { passive: true });

const heroVideos = Array.from(document.querySelectorAll("[data-hero-video]"));
const desktopVideoQuery = window.matchMedia("(min-width: 901px) and (prefers-reduced-motion: no-preference)");
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
let heroVideoIdleId = null;
let heroVideoDelayId = null;

const canStreamHeroVideo = () => {
  if (!desktopVideoQuery.matches) {
    return false;
  }

  if (!connection) {
    return true;
  }

  if (connection.saveData) {
    return false;
  }

  const networkType = connection.effectiveType || "";
  return networkType !== "slow-2g" && networkType !== "2g";
};

const clearQueuedHeroVideoLoad = () => {
  if (heroVideoIdleId !== null && typeof window.cancelIdleCallback === "function") {
    window.cancelIdleCallback(heroVideoIdleId);
  }

  if (heroVideoDelayId !== null) {
    window.clearTimeout(heroVideoDelayId);
  }

  heroVideoIdleId = null;
  heroVideoDelayId = null;
};

const queueHeroVideoLoad = (callback) => {
  if (typeof window.requestIdleCallback === "function") {
    heroVideoIdleId = window.requestIdleCallback(() => {
      heroVideoIdleId = null;
      callback();
    }, { timeout: 2200 });
    return;
  }

  heroVideoDelayId = window.setTimeout(() => {
    heroVideoDelayId = null;
    callback();
  }, 1200);
};

const syncHeroVideos = () => {
  clearQueuedHeroVideoLoad();
  const shouldPlay = canStreamHeroVideo();

  heroVideos.forEach((video) => {
    const frame = video.closest(".hero-video-bg");
    const source = video.querySelector("source[data-src]");

    if (!(source instanceof HTMLSourceElement)) {
      return;
    }

    if (!shouldPlay) {
      frame?.setAttribute("hidden", "");
      video.pause();
      return;
    }

    queueHeroVideoLoad(() => {
      frame?.removeAttribute("hidden");

      if (video.dataset.videoLoaded !== "true" && source.dataset.src) {
        source.src = source.dataset.src;
        video.load();
        video.dataset.videoLoaded = "true";
      }

      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    });
  });
};

if (heroVideos.length) {
  syncHeroVideos();

  if (typeof desktopVideoQuery.addEventListener === "function") {
    desktopVideoQuery.addEventListener("change", syncHeroVideos);
  } else {
    desktopVideoQuery.addListener(syncHeroVideos);
  }

  if (connection) {
    if (typeof connection.addEventListener === "function") {
      connection.addEventListener("change", syncHeroVideos);
    } else if (typeof connection.addListener === "function") {
      connection.addListener(syncHeroVideos);
    }
  }
}

const reviewWidget = document.querySelector("[data-review-widget]");

if (reviewWidget) {
  let reviewLoadTimeoutId = null;

  const getOrCreateReviewFallback = () => {
    const existingFallback = reviewWidget.querySelector("[data-review-fallback]");

    if (existingFallback) {
      return existingFallback;
    }

    const fallback = document.createElement("div");
    const message = document.createElement("p");
    const link = document.createElement("a");

    fallback.className = "review-fallback";
    fallback.dataset.reviewFallback = "";
    fallback.hidden = true;

    message.textContent = "Reviews are temporarily unavailable. Contact Garci directly while the live widget reconnects.";
    link.className = "btn btn-secondary";
    link.href = "pages/contact.html";
    link.textContent = "Contact Garci";

    fallback.append(message, link);
    reviewWidget.append(fallback);
    return fallback;
  };

  const reviewFallback = getOrCreateReviewFallback();

  const setReviewFallbackVisible = (visible) => {
    reviewFallback.hidden = !visible;
  };

  const clearReviewLoadTimeout = () => {
    if (reviewLoadTimeoutId !== null) {
      window.clearTimeout(reviewLoadTimeoutId);
      reviewLoadTimeoutId = null;
    }
  };

  const hasReviewWidgetRendered = () => {
    return Boolean(reviewWidget.querySelector(".ti-widget-container, .ti-reviews-container, .ti-review-item"));
  };

  if ("MutationObserver" in window) {
    const reviewMutationObserver = new MutationObserver(() => {
      if (!hasReviewWidgetRendered()) {
        return;
      }

      clearReviewLoadTimeout();
      reviewWidget.dataset.widgetLoaded = "true";
      setReviewFallbackVisible(false);
    });

    reviewMutationObserver.observe(reviewWidget, { childList: true, subtree: true });
  }

  const finalizeReviewWidgetLoad = () => {
    const widgetRendered = hasReviewWidgetRendered();

    clearReviewLoadTimeout();
    reviewWidget.dataset.widgetLoaded = widgetRendered ? "true" : "false";
    setReviewFallbackVisible(!widgetRendered);
  };

  const queueReviewWidgetVerification = () => {
    clearReviewLoadTimeout();
    reviewLoadTimeoutId = window.setTimeout(finalizeReviewWidgetLoad, 3200);
  };

  const loadReviewWidget = () => {
    const widgetState = reviewWidget.dataset.widgetLoaded;

    if (widgetState === "loading" || widgetState === "true") {
      return;
    }

    reviewWidget.dataset.widgetLoaded = "loading";
    setReviewFallbackVisible(false);

    const existingScript = document.querySelector('script[src^="https://cdn.trustindex.io/loader.js"]');

    if (existingScript) {
      queueReviewWidgetVerification();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.trustindex.io/loader.js?ver=1";
    script.async = true;
    script.addEventListener("load", queueReviewWidgetVerification, { once: true });
    script.addEventListener("error", () => {
      clearReviewLoadTimeout();
      reviewWidget.dataset.widgetLoaded = "false";
      setReviewFallbackVisible(true);
      script.remove();
    }, { once: true });
    document.body.append(script);
  };

  if ("IntersectionObserver" in window) {
    const reviewObserver = new IntersectionObserver((entries) => {
      const reviewEntry = entries.find((entry) => entry.isIntersecting);

      if (!reviewEntry) {
        return;
      }

      loadReviewWidget();
      reviewObserver.disconnect();
    }, {
      rootMargin: "220px 0px"
    });

    reviewObserver.observe(reviewWidget);
  } else {
    loadReviewWidget();
  }
}

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

  const hydrateSlideImage = (slide) => {
    const image = slide?.querySelector("img[data-src]");

    if (!(image instanceof HTMLImageElement) || !image.dataset.src) {
      return;
    }

    image.src = image.dataset.src;
    image.removeAttribute("data-src");
  };

  const primeSlideAssets = (index) => {
    hydrateSlideImage(slides[index]);
    hydrateSlideImage(slides[(index + 1) % slides.length]);
  };

  const showSlide = (nextIndex) => {
    activeIndex = (nextIndex + slides.length) % slides.length;
    primeSlideAssets(activeIndex);

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

    if (reducedMotionQuery.matches || slides.length < 2 || interval <= 0) {
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

  const syncSliderMotion = () => {
    if (reducedMotionQuery.matches) {
      stopTimer();
      return;
    }

    restartTimer();
  };

  if (typeof reducedMotionQuery.addEventListener === "function") {
    reducedMotionQuery.addEventListener("change", syncSliderMotion);
  } else {
    reducedMotionQuery.addListener(syncSliderMotion);
  }

  showSlide(activeIndex);
  restartTimer();
});

const contactForms = Array.from(document.querySelectorAll("[data-contact-form]"));

const setContactFormFeedback = (note, message, status) => {
  if (!note) {
    return;
  }

  note.textContent = message;
  note.classList.remove("is-success", "is-error");

  if (status) {
    note.classList.add(`is-${status}`);
  }
};

contactForms.forEach((form) => {
  const note = form.querySelector("[data-contact-form-note]");
  const whatsappNumber = (form.dataset.contactWhatsapp || "").replace(/\D/g, "");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!whatsappNumber) {
      setContactFormFeedback(
        note,
        "WhatsApp contact details are unavailable right now. Please use the phone numbers above.",
        "error"
      );
      return;
    }

    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const subject = String(formData.get("subject") || "").trim() || "Product inquiry";
    const message = String(formData.get("message") || "").trim();
    const whatsappUrl = new URL(`https://wa.me/${whatsappNumber}`);
    const inquiryLines = [
      "Hello Garci, I would like to make an inquiry.",
      "",
      `Name: ${name}`,
      `Reply email: ${email}`,
      `Subject: ${subject}`,
      "Message:",
      message
    ];

    whatsappUrl.searchParams.set("text", inquiryLines.join("\n"));
    setContactFormFeedback(note, "Opening WhatsApp with your inquiry...", "success");
    window.location.assign(whatsappUrl.toString());
  });
});

const productModal = document.querySelector("#product-modal");

if (productModal) {
  const productTriggers = Array.from(document.querySelectorAll("[data-product-modal-trigger]"));
  const closeControls = Array.from(productModal.querySelectorAll("[data-product-modal-close]"));
  const modalDialog = productModal.querySelector(".product-modal-dialog");
  const modalTitle = productModal.querySelector("#product-modal-title");
  const modalImage = productModal.querySelector("#product-modal-image");
  const modalFeatures = productModal.querySelector("#product-modal-features");
  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(", ");
  const backgroundState = new Map();
  let previousFocusedElement = null;
  let activeTrigger = null;

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

  const getFocusableModalElements = () => {
    return Array.from(productModal.querySelectorAll(focusableSelector)).filter((element) => {
      return element instanceof HTMLElement && !element.closest("[hidden]");
    });
  };

  const setBackgroundInert = (isInert) => {
    const backgroundElements = Array.from(body.children).filter((element) => element !== productModal);

    backgroundElements.forEach((element) => {
      if (!(element instanceof HTMLElement)) {
        return;
      }

      if (isInert) {
        if (!backgroundState.has(element)) {
          backgroundState.set(element, {
            ariaHidden: element.getAttribute("aria-hidden"),
            inert: "inert" in element ? element.inert : undefined
          });
        }

        element.setAttribute("aria-hidden", "true");

        if ("inert" in element) {
          element.inert = true;
        }

        return;
      }

      const previousState = backgroundState.get(element);

      if (!previousState) {
        return;
      }

      if (previousState.ariaHidden === null) {
        element.removeAttribute("aria-hidden");
      } else {
        element.setAttribute("aria-hidden", previousState.ariaHidden);
      }

      if ("inert" in element && typeof previousState.inert === "boolean") {
        element.inert = previousState.inert;
      }
    });

    if (!isInert) {
      backgroundState.clear();
    }
  };

  const trapProductModalFocus = (event) => {
    if (productModal.hidden) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeProductModal();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = getFocusableModalElements();

    if (!focusableElements.length) {
      event.preventDefault();
      modalDialog?.focus();
      return;
    }

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey) {
      if (activeElement === firstFocusableElement || !productModal.contains(activeElement)) {
        event.preventDefault();
        lastFocusableElement.focus();
      }

      return;
    }

    if (activeElement === lastFocusableElement || !productModal.contains(activeElement)) {
      event.preventDefault();
      firstFocusableElement.focus();
    }
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
    activeTrigger = trigger;
    activeTrigger.setAttribute("aria-expanded", "true");
    productModal.hidden = false;
    productModal.setAttribute("aria-hidden", "false");
    body.classList.add("product-modal-open");
    closeNavigation();
    setBackgroundInert(true);

    const firstFocusableElement = getFocusableModalElements()[0];
    (firstFocusableElement || modalDialog)?.focus();
  };

  const closeProductModal = () => {
    if (productModal.hidden) {
      return;
    }

    productModal.hidden = true;
    productModal.setAttribute("aria-hidden", "true");
    body.classList.remove("product-modal-open");
    setBackgroundInert(false);

    if (activeTrigger instanceof HTMLElement) {
      activeTrigger.setAttribute("aria-expanded", "false");
    }

    if (previousFocusedElement instanceof HTMLElement) {
      previousFocusedElement.focus();
    }

    activeTrigger = null;
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

  document.addEventListener("keydown", trapProductModalFocus);
}
