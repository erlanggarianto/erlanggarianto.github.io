(function () {
  const root = document.documentElement;
  const THEME_KEY = 'erlangga-theme';
  const storedTheme = localStorage.getItem(THEME_KEY);

  // Apply stored theme early
  if (storedTheme === 'dark' || storedTheme === 'light') {
    root.setAttribute('data-theme', storedTheme);
  }

  function getCurrentTheme() {
    const explicit = root.getAttribute('data-theme');
    if (explicit) return explicit;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  function setTheme(next) {
    root.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    const pressed = next === 'dark';
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(pressed));
      // When dark is active, show label "Dark" as active; when light is active, show label "Light"
      toggle.setAttribute('aria-label', pressed ? 'Currently dark mode. Switch to light mode' : 'Currently light mode. Switch to dark mode');
    }
  }

  // Toggle button
  document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('theme-toggle');
    const header = document.querySelector('.site-header');
    const toTop = document.getElementById('to-top');
    const brandLink = document.querySelector('.brand');
    if (toggle) {
      toggle.addEventListener('click', function () {
        const next = getCurrentTheme() === 'dark' ? 'light' : 'dark';
        setTheme(next);
      });
      // Initialize aria-pressed and label
      const isDark = getCurrentTheme() === 'dark';
      toggle.setAttribute('aria-pressed', String(isDark));
      toggle.setAttribute('aria-label', isDark ? 'Currently dark mode. Switch to light mode' : 'Currently light mode. Switch to dark mode');
    }

    // Scroll reveal
    const revealEls = Array.from(document.querySelectorAll('.reveal'));
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

      revealEls.forEach((el) => obs.observe(el));
    } else {
      // Fallback
      revealEls.forEach((el) => el.classList.add('is-visible'));
    }

    // Header scroll state
    if (header) {
      // Set body padding to account for fixed header height
      const setHeaderHeight = () => {
        const h = header.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--header-h', h + 'px');
      };
      setHeaderHeight();
      window.addEventListener('resize', setHeaderHeight);
      const onScroll = () => {
        const scrolled = window.scrollY > 8;
        header.classList.toggle('is-scrolled', scrolled);
        // Toggle scroll-to-top visibility
        if (toTop) toTop.classList.toggle('is-visible', window.scrollY > 400);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Scroll to top behavior
    if (toTop) {
      toTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Brand click scroll-to-top
    if (brandLink) {
      brandLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Download fallback for Safari/older browsers
    const downloadLink = document.getElementById('download-resume');
    if (downloadLink) {
      const supportsDownload = 'download' in HTMLAnchorElement.prototype;
      if (!supportsDownload) {
        downloadLink.addEventListener('click', function (e) {
          e.preventDefault();
          // Force open then save via navigating to the file; user can save from viewer
          window.location.href = downloadLink.href;
        });
      }
    }
  });
})();



