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

const threeBackgroundTargets = Array.from(document.querySelectorAll("[data-three-bg]"));

if (window.THREE && threeBackgroundTargets.length > 0) {
  const THREE = window.THREE;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const createSeededRandom = (seed) => () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  threeBackgroundTargets.forEach((target, index) => {
    const layer = document.createElement("div");
    layer.className = "three-bg-layer";
    target.prepend(layer);

    let renderer;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      layer.remove();
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = "three-bg-canvas";
    layer.append(renderer.domElement);
    target.classList.add("three-bg-active");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
    camera.position.set(0, 0, 16);

    const variant = target.dataset.threeVariant || "inner";
    const palettes = {
      home: [0x1f5f43, 0x7fa76a, 0xd1a24b, 0xffffff],
      inner: [0x1d4f39, 0x6f9a5d, 0xb98b3d, 0xf5f7f6],
    };
    const palette = palettes[variant] || palettes.inner;
    const seedMap = { home: 7919, inner: 1543 };
    const random = createSeededRandom((seedMap[variant] || seedMap.inner) + index * 97);

    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    const keyLight = new THREE.PointLight(palette[1], 1.35, 80);
    const fillLight = new THREE.PointLight(palette[2], 1.1, 70);
    keyLight.position.set(8, 6, 10);
    fillLight.position.set(-7, -4, 9);
    scene.add(ambient, keyLight, fillLight);

    const cluster = new THREE.Group();
    scene.add(cluster);

    const shapePool = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.OctahedronGeometry(0.9, 0),
      new THREE.TetrahedronGeometry(1, 0),
    ];

    for (let i = 0; i < 22; i += 1) {
      const geometry = shapePool[i % shapePool.length];
      const material = new THREE.MeshStandardMaterial({
        color: palette[i % palette.length],
        transparent: true,
        opacity: 0.36 + random() * 0.22,
        roughness: 0.35,
        metalness: 0.08,
      });
      const mesh = new THREE.Mesh(geometry, material);
      const scale = 0.34 + random() * 0.8;
      const radius = 3.2 + random() * 6.4;
      const speed = 0.22 + random() * 0.42;
      const phase = random() * Math.PI * 2;

      mesh.scale.setScalar(scale);
      mesh.position.set(Math.cos(phase) * radius, Math.sin(phase) * (radius * 0.5), -2 + random() * 6);
      mesh.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
      mesh.userData = {
        radius,
        speed,
        phase,
        drift: 0.25 + random() * 0.6,
      };
      cluster.add(mesh);
    }

    const dustCount = 220;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i += 1) {
      const base = i * 3;
      dustPositions[base] = (random() - 0.5) * 24;
      dustPositions[base + 1] = (random() - 0.5) * 12;
      dustPositions[base + 2] = -4 + random() * 10;
    }

    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));

    const dustMaterial = new THREE.PointsMaterial({
      color: palette[3],
      size: 0.12,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    });

    const dust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dust);

    let pointerX = 0;
    let pointerY = 0;

    const onPointerMove = (event) => {
      const rect = target.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    target.addEventListener("pointermove", onPointerMove);
    target.addEventListener("pointerleave", () => {
      pointerX = 0;
      pointerY = 0;
    });

    const onResize = () => {
      const width = Math.max(target.clientWidth, 1);
      const height = Math.max(target.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    if (window.ResizeObserver) {
      const observer = new ResizeObserver(onResize);
      observer.observe(target);
    }

    const start = performance.now() * 0.001 + index;

    const animate = (now) => {
      const t = now * 0.001 - start;

      if (!prefersReducedMotion) {
        cluster.rotation.y += 0.0018;
        cluster.rotation.x += (pointerY * 0.08 - cluster.rotation.x) * 0.025;
        cluster.rotation.z += (pointerX * 0.12 - cluster.rotation.z) * 0.025;

        cluster.children.forEach((mesh) => {
          const { radius, speed, phase, drift } = mesh.userData;
          mesh.position.x = Math.cos(t * speed + phase) * radius;
          mesh.position.y = Math.sin(t * speed * drift + phase) * (radius * 0.48);
          mesh.rotation.x += 0.003 * drift;
          mesh.rotation.y += 0.0045 * drift;
        });

        dust.rotation.y += 0.0008;
        dust.rotation.x += 0.0002;
      }

      renderer.render(scene, camera);
      window.requestAnimationFrame(animate);
    };

    window.requestAnimationFrame(animate);
  });
}
