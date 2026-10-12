// =========================================================
// BOLD SPORTS-BRAND PORTFOLIO SCRIPT
// Interactive liquid canvas, sticky rail, scroll typography,
// and accessible card interactions.
// =========================================================

// ================= EDIT YOUR PHOTOS HERE =================
// cutout: a PNG with transparent background (best result). Leave "" to use the fallback slanted frame.
const PHOTOS = {
  cutout: "",
  main: "images/sangharsha_portrait.jpg"
};
// =========================================================

// ---------- 1. Hero Image Setup ----------
const stage = document.getElementById("stage");
const imgBase = document.getElementById("imgBase");
const src = PHOTOS.cutout || PHOTOS.main;

if (imgBase) {
  imgBase.src = src;
}

// If no cutout transparent PNG is provided, apply the slanted parallelogram frame
if (!PHOTOS.cutout && stage) {
  stage.classList.add("no-cutout");
}

// ---------- 2. Fullscreen Loader ----------
const pct = document.getElementById("pct");
const loader = document.getElementById("loader");
let count = 0;

const loadTimer = setInterval(() => {
  count += Math.ceil(Math.random() * 8) + 2;
  if (count >= 100) {
    count = 100;
    clearInterval(loadTimer);
    setTimeout(() => {
      if (loader) loader.classList.add("done");
    }, 350);
  }
  if (pct) pct.textContent = count;
}, 50);

// ---------- 3. Full-Screen Menu Overlay ----------
const menu = document.getElementById("menu");
const menuBtn = document.getElementById("menuBtn");

function toggleMenu(open) {
  if (!menu || !menuBtn) return;
  menu.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
}

if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    const isOpen = menu.classList.contains("open");
    toggleMenu(!isOpen);
  });
}

if (menu) {
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => toggleMenu(false));
  });
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") toggleMenu(false);
});

// ---------- 4. Fluid Liquid Duotone Reveal ----------
// Soft blob follows mouse or drifts smoothly, creating an organic liquid window
const hero = document.getElementById("hero");
const duo = document.getElementById("duoCanvas");
const dctx = duo ? duo.getContext("2d") : null;

const photo = new Image();
photo.referrerPolicy = "no-referrer";
photo.src = src;

// Offscreen buffer canvases for smooth fast fluid thresholding
const low = document.createElement("canvas");
const lctx = low.getContext("2d", { willReadFrequently: true });
const thr = document.createElement("canvas");
const tctx = thr.getContext("2d");

let W = 0, H = 0, LW = 0, LH = 0, dpr = 1;
const pos = { x: 0, y: 0 };
const target = { x: 0, y: 0 };
let active = false;

function resizeHero() {
  if (!stage || !duo || !lctx || !tctx) return;
  const b = stage.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = b.width;
  H = b.height;
  duo.width = W * dpr;
  duo.height = H * dpr;
  LW = low.width = thr.width = Math.max(40, Math.round(W / 5));
  LH = low.height = thr.height = Math.max(50, Math.round(H / 5));
  pos.x = target.x = LW / 2;
  pos.y = target.y = LH / 2;
}

window.addEventListener("resize", resizeHero);
resizeHero();

if (hero && stage) {
  hero.addEventListener("pointermove", (e) => {
    const b = stage.getBoundingClientRect();
    if (b.width > 0 && b.height > 0) {
      target.x = ((e.clientX - b.left) / b.width) * LW;
      target.y = ((e.clientY - b.top) / b.height) * LH;
      active = true;
    }
  });

  hero.addEventListener("pointerleave", () => {
    active = false;
  });
}

function drawPhoto() {
  if (!dctx || !photo.naturalWidth) return;
  const cover = !PHOTOS.cutout;
  const iw = photo.naturalWidth;
  const ih = photo.naturalHeight;
  const s = cover ? Math.max(W / iw, H / ih) : Math.min(W / iw, H / ih);
  const w = iw * s;
  const h = ih * s;
  dctx.drawImage(
    photo,
    ((W - w) / 2) * dpr,
    (cover ? 0 : H - h) * dpr,
    w * dpr,
    h * dpr
  );
}

function renderFluidFrame(t) {
  if (photo.complete && photo.naturalWidth && dctx && lctx && tctx && duo) {
    // 1. Move target (drift automatically if mouse is outside)
    if (!active) {
      target.x = LW * (0.5 + 0.32 * Math.sin(t / 1100));
      target.y = LH * (0.45 + 0.28 * Math.sin(t / 850 + 1));
    }

    const px = pos.x;
    const py = pos.y;
    pos.x += (target.x - pos.x) * 0.12;
    pos.y += (target.y - pos.y) * 0.12;

    const speed = Math.hypot(pos.x - px, pos.y - py);
    const r = LW * (0.14 + Math.min(speed * 0.012, 0.13));

    // 2. Fade previous trail and draw wobbling soft circles
    lctx.globalCompositeOperation = "destination-out";
    lctx.fillStyle = "rgba(0,0,0,0.07)";
    lctx.fillRect(0, 0, LW, LH);
    lctx.globalCompositeOperation = "source-over";

    for (let i = 0; i < 3; i++) {
      const a = t / 400 + i * 2.1;
      const x = pos.x + Math.cos(a) * r * 0.35;
      const y = pos.y + Math.sin(a * 1.3) * r * 0.35;
      const g = lctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      lctx.fillStyle = g;
      lctx.beginPath();
      lctx.arc(x, y, r, 0, Math.PI * 2);
      lctx.fill();
    }

    // 3. Threshold soft blobs to create liquid edge
    const imgData = lctx.getImageData(0, 0, LW, LH);
    const d = imgData.data;
    for (let i = 3; i < d.length; i += 4) {
      const s = Math.min(Math.max((d[i] / 255 - 0.3) / 0.25, 0), 1);
      d[i] = s * s * (3 - 2 * s) * 255;
      d[i - 1] = d[i - 2] = d[i - 3] = 255;
    }
    tctx.putImageData(imgData, 0, 0);

    // 4. Composite photo with duotone mask
    dctx.globalCompositeOperation = "source-over";
    dctx.clearRect(0, 0, duo.width, duo.height);
    drawPhoto();
    dctx.globalCompositeOperation = "destination-in";
    dctx.imageSmoothingEnabled = true;
    dctx.imageSmoothingQuality = "high";
    dctx.drawImage(thr, 0, 0, duo.width, duo.height);
    dctx.globalCompositeOperation = "source-over";
  }

  requestAnimationFrame(renderFluidFrame);
}

requestAnimationFrame(renderFluidFrame);

// ---------- 5. Word-by-Word Scroll Story Reveal ----------
const storyEl = document.querySelector(".big");
let storyWords = [];

if (storyEl) {
  const originalText = storyEl.textContent.trim();
  storyEl.innerHTML = originalText
    .split(/\s+/)
    .map((word) => `<span class="w">${word}</span> `)
    .join("");
  storyWords = storyEl.querySelectorAll(".w");
}

// ---------- 6. Sticky Horizontal Rail & Story Scroll ----------
const rail = document.getElementById("rail");
const track = document.getElementById("track");

function onPageScroll() {
  // Horizontal rail transform
  if (rail && track) {
    const r = rail.getBoundingClientRect();
    const maxScroll = rail.offsetHeight - window.innerHeight;
    if (maxScroll > 0) {
      const p = Math.min(Math.max(-r.top / maxScroll, 0), 1);
      const trackMax = track.scrollWidth - window.innerWidth;
      track.style.transform = `translateX(${-p * Math.max(trackMax, 0)}px)`;
    }
  }

  // Word lighting progress
  if (storyEl && storyWords.length) {
    const b = storyEl.getBoundingClientRect();
    const progress = Math.min(
      Math.max((window.innerHeight * 0.85 - b.top) / (b.height + window.innerHeight * 0.3), 0),
      1
    );
    storyWords.forEach((span, idx) => {
      span.classList.toggle("lit", idx < progress * storyWords.length);
    });
  }
}

window.addEventListener("scroll", onPageScroll, { passive: true });
window.addEventListener("resize", onPageScroll);
onPageScroll();

// ---------- 7. 3D Flip Cards (Tap & Keyboard Accessible) ----------
document.querySelectorAll(".flip").forEach((card) => {
  card.addEventListener("click", () => {
    card.classList.toggle("on");
  });

  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      card.classList.toggle("on");
    }
  });
});

// ---------- 8. Animated Count-Up Stats ----------
function animateCounter(el) {
  const target = +el.dataset.count;
  const suffix = el.dataset.suffix || "";
  const startTime = performance.now();
  const duration = 1600;

  function step(currentTime) {
    const elapsed = Math.min((currentTime - startTime) / duration, 1);
    // Cubic ease-out curve
    const currentVal = Math.round(target * (1 - Math.pow(1 - cursorProgress(elapsed), 3)));
    el.textContent = currentVal + suffix;
    if (elapsed < 1) {
      requestAnimationFrame(step);
    }
  }

  function cursorProgress(x) {
    return x;
  }

  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll("[data-count]").forEach((el) => {
  statsObserver.observe(el);
});