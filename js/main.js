const cursor = document.getElementById("cursor");
const ring = document.getElementById("cursorRing");
let mx = 0,
  my = 0,
  rx = 0,
  ry = 0;

const isTouch =
  window.matchMedia("(hover: none) and (pointer: coarse)").matches ||
  "ontouchstart" in window ||
  navigator.maxTouchPoints > 0;

if (isTouch) {
  cursor.style.display = "none";
  ring.style.display = "none";
}

if (!isTouch) {
  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.transform = `translate(${mx - 5}px,${my - 5}px)`;
  });

  (function animRing() {
    rx += (mx - rx - 18) * 0.25;
    ry += (my - ry - 18) * 0.25;
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(animRing);
  })();

  document.querySelectorAll("a,button,.cs-figure img").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      ring.style.width = "52px";
      ring.style.height = "52px";
      ring.style.borderColor = "rgba(159,21,21,0.8)";
    });
    el.addEventListener("mouseleave", () => {
      ring.style.width = "36px";
      ring.style.height = "36px";
      ring.style.borderColor = "rgba(159,21,21,0.4)";
    });
  });
}

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

// Lightbox
(function () {
  const figures = document.querySelectorAll(".cs-figure img");
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

  const lbImg = document.createElement("img");
  lbImg.className = "lb-img";

  lb.appendChild(closeBtn);
  lb.appendChild(lbImg);
  document.body.appendChild(lb);

  let lastFocused;

  function openLightbox(src, alt) {
    lastFocused = document.activeElement;
    lbImg.src = src;
    lbImg.alt = alt || "";
    lb.classList.add("lb-open");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeLightbox() {
    lb.classList.remove("lb-open");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  figures.forEach((img) => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", () => openLightbox(img.src, img.alt));
  });

  closeBtn.addEventListener("click", closeLightbox);
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lb.classList.contains("lb-open")) closeLightbox();
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
    ".project-card,.t-card,.tl,.about-grid,.contact-layout,.exp-badge",
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
        "Could not send — please check your connection and try again.",
        "error",
      );
    }

    btn.disabled = false;
    btn.textContent = originalText;
  });
}
