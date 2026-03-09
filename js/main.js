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
    rx += (mx - rx - 18) * 0.12;
    ry += (my - ry - 18) * 0.12;
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(animRing);
  })();

  document.querySelectorAll("a,button").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      ring.style.width = "52px";
      ring.style.height = "52px";
      ring.style.borderColor = "rgba(0,212,255,0.8)";
    });
    el.addEventListener("mouseleave", () => {
      ring.style.width = "36px";
      ring.style.height = "36px";
      ring.style.borderColor = "rgba(0,212,255,0.5)";
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

// Contact form — async submit with status message
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Sending…";
    formStatus.textContent = "";
    try {
      const res = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        formStatus.textContent = "Message sent! I'll get back to you soon.";
        contactForm.reset();
      } else {
        formStatus.textContent =
          "Something went wrong. Please try again or reach out via LinkedIn.";
      }
    } catch {
      formStatus.textContent =
        "Could not send — please check your connection and try again.";
    }
    btn.disabled = false;
    btn.textContent = originalText;
  });
}
