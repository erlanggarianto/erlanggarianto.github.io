// Hamburger menu
const hamburger = document.getElementById("navHamburger");
const navLinks = document.getElementById("navLinks");
const navEl = hamburger.closest("nav");

function closeMenu() {
  hamburger.classList.remove("active");
  navEl.classList.remove("menu-open");
  hamburger.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
  hamburger.focus();
}

hamburger.addEventListener("click", () => {
  const isOpen = navEl.classList.toggle("menu-open");
  hamburger.classList.toggle("active", isOpen);
  hamburger.setAttribute("aria-expanded", String(isOpen));
  document.body.style.overflow = isOpen ? "hidden" : "";
  if (isOpen) navLinks.querySelector("a").focus();
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

// Close menu on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navEl.classList.contains("menu-open")) closeMenu();
});

// Lightbox with gallery navigation
(function () {
  const figures = Array.from(document.querySelectorAll(".cs-figure img"));
  if (!figures.length) return;

  const lb = document.createElement("div");
  lb.className = "lb";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", "Image preview");

  const closeBtn = document.createElement("button");
  closeBtn.className = "lb-close";
  closeBtn.setAttribute("aria-label", "Close image preview");
  closeBtn.innerHTML = "&times;";

  const counter = document.createElement("div");
  counter.className = "lb-counter";

  const prevBtn = document.createElement("button");
  prevBtn.className = "lb-nav lb-prev";
  prevBtn.setAttribute("aria-label", "Previous image");
  prevBtn.innerHTML =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg>';

  const nextBtn = document.createElement("button");
  nextBtn.className = "lb-nav lb-next";
  nextBtn.setAttribute("aria-label", "Next image");
  nextBtn.innerHTML =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6" /></svg>';

  const lbImg = document.createElement("img");
  lbImg.className = "lb-img";

  const caption = document.createElement("div");
  caption.className = "lb-caption";
  caption.setAttribute("aria-live", "polite");

  const thumbs = document.createElement("div");
  thumbs.className = "lb-thumbs";
  thumbs.setAttribute("aria-label", "All images on this page");
  const thumbBtns = figures.map((img, i) => {
    const btn = document.createElement("button");
    btn.className = "lb-thumb";
    btn.setAttribute(
      "aria-label",
      "Go to image " + (i + 1) + (img.alt ? ": " + img.alt : ""),
    );
    const thumbImg = document.createElement("img");
    thumbImg.alt = "";
    thumbImg.loading = "lazy";
    btn.appendChild(thumbImg);
    btn.addEventListener("click", () => show(i));
    thumbs.appendChild(btn);
    return btn;
  });
  let thumbsLoaded = false;

  lb.append(closeBtn, counter, prevBtn, lbImg, nextBtn, caption, thumbs);
  document.body.appendChild(lb);

  if (figures.length < 2) {
    prevBtn.hidden = true;
    nextBtn.hidden = true;
    thumbs.hidden = true;
  }

  let current = 0;
  let lastFocused;
  let lbZoomed = false;

  function resetZoom() {
    lbZoomed = false;
    lbImg.classList.remove("lb-zoomed");
  }

  function show(i) {
    current = (i + figures.length) % figures.length;
    const img = figures[current];
    resetZoom();
    lbImg.src = img.src;
    lbImg.alt = img.alt || "";
    caption.textContent = img.alt || "";
    counter.textContent = current + 1 + " / " + figures.length;
    thumbBtns.forEach((btn, n) => {
      btn.classList.toggle("lb-thumb-active", n === current);
    });
    thumbBtns[current].scrollIntoView({ block: "nearest", inline: "center" });
  }

  function openLightbox(i) {
    lastFocused = document.activeElement;
    if (!thumbsLoaded) {
      thumbsLoaded = true;
      thumbBtns.forEach((btn, n) => {
        btn.querySelector("img").src = figures[n].src;
      });
    }
    show(i);
    lb.classList.add("lb-open");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeLightbox() {
    resetZoom();
    lb.classList.remove("lb-open");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  figures.forEach((img, i) => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", () => openLightbox(i));
  });

  lbImg.addEventListener("click", () => {
    lbZoomed = !lbZoomed;
    lbImg.classList.toggle("lb-zoomed", lbZoomed);
  });

  prevBtn.addEventListener("click", () => show(current - 1));
  nextBtn.addEventListener("click", () => show(current + 1));

  closeBtn.addEventListener("click", closeLightbox);
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("lb-open")) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft" && figures.length > 1) show(current - 1);
    else if (e.key === "ArrowRight" && figures.length > 1) show(current + 1);
  });
})();

// Scroll-triggered fade-in
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.style.opacity = "1";
        e.target.style.transform = "translateY(0)";
      }
    });
  },
  { threshold: 0.1 },
);

document
  .querySelectorAll(
    ".project-card,.t-card,.tl,.about-grid,.contact-layout",
  )
  .forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(28px)";
    el.style.transition = "opacity 0.7s ease, transform 0.7s ease";
    io.observe(el);
  });

// About section carousel
const acSlides = document.querySelectorAll(".ac-slide");
const acDots = document.querySelectorAll(".ac-dot");
let acIndex = 0;
let acTimer;

function acGoTo(i) {
  acSlides[acIndex].classList.remove("ac-active");
  acDots[acIndex].classList.remove("ac-dot-active");
  acIndex = (i + acSlides.length) % acSlides.length;
  acSlides[acIndex].classList.add("ac-active");
  acDots[acIndex].classList.add("ac-dot-active");
}

function acStart() {
  acTimer = setInterval(() => acGoTo(acIndex + 1), 4000);
}

if (acSlides.length) {
  acStart();
  document.querySelector(".about-img-frame")?.addEventListener("mouseenter", () => clearInterval(acTimer));
  document.querySelector(".about-img-frame")?.addEventListener("mouseleave", acStart);
  document.querySelector(".ac-btn-prev")?.addEventListener("click", () => { clearInterval(acTimer); acGoTo(acIndex - 1); acStart(); });
  document.querySelector(".ac-btn-next")?.addEventListener("click", () => { clearInterval(acTimer); acGoTo(acIndex + 1); acStart(); });
}

// Contact form — validation + async submit
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

function setStatus(msg, type) {
  formStatus.textContent = msg;
  formStatus.className = "form-status" + (type ? ` form-status--${type}` : "");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(input, msg) {
  input.classList.add("invalid");
  input.setAttribute("aria-invalid", "true");
  let err = input.parentElement.querySelector(".field-error");
  if (!err) {
    err = document.createElement("span");
    err.className = "field-error";
    input.parentElement.appendChild(err);
  }
  err.textContent = msg;
}

function clearFieldError(input) {
  input.classList.remove("invalid");
  input.removeAttribute("aria-invalid");
  const err = input.parentElement.querySelector(".field-error");
  if (err) err.textContent = "";
}

if (contactForm && formStatus) {
  contactForm.querySelectorAll("input, textarea").forEach((el) => {
    el.addEventListener("input", () => clearFieldError(el));
  });

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nameEl = document.getElementById("contact-name");
    const emailEl = document.getElementById("contact-email");
    const messageEl = document.getElementById("contact-message");

    [nameEl, emailEl, messageEl].forEach(clearFieldError);
    setStatus("", "");

    let valid = true;

    if (!nameEl.value.trim()) {
      showFieldError(nameEl, "Please enter your name.");
      valid = false;
    }
    if (!emailEl.value.trim()) {
      showFieldError(emailEl, "Please enter your email.");
      valid = false;
    } else if (!isValidEmail(emailEl.value.trim())) {
      showFieldError(emailEl, "Please enter a valid email address.");
      valid = false;
    }
    if (!messageEl.value.trim()) {
      showFieldError(messageEl, "Please write a message.");
      valid = false;
    }

    if (!valid) {
      contactForm.querySelector(".invalid")?.focus();
      return;
    }

    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Sending…";

    try {
      const res = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("Message sent! I'll get back to you soon.", "success");
        contactForm.reset();
      } else {
        setStatus(
          "Something went wrong. Please try again or reach out via LinkedIn.",
          "error",
        );
      }
    } catch {
      setStatus(
        "Could not send. Please check your connection and try again.",
        "error",
      );
    }

    btn.disabled = false;
    btn.textContent = originalText;
  });
}

// Scroll to top
(function () {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;
  window.addEventListener('scroll', function () {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
