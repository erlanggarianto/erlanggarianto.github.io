(function () {
  const root = document.documentElement;
  const THEME_KEY = 'erlangga-theme';
  
  // Safe localStorage access with fallback
  function safeStorageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('localStorage access failed:', e);
      return null;
    }
  }
  
  function safeStorageSet(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn('localStorage set failed:', e);
      return false;
    }
  }
  
  const storedTheme = safeStorageGet(THEME_KEY);

  // Apply stored theme early
  if (storedTheme === 'dark' || storedTheme === 'light') {
    root.setAttribute('data-theme', storedTheme);
  }

  function getCurrentTheme() {
    const explicit = root.getAttribute('data-theme');
    if (explicit) return explicit;
    
    // Try to detect system preference, with fallback to light mode
    try {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    } catch (e) {
      console.warn('System theme detection failed:', e);
      return 'light'; // Default to light mode if detection fails
    }
  }

  function setTheme(next) {
    // Ensure we have a valid theme
    if (next !== 'dark' && next !== 'light') {
      console.warn('Invalid theme:', next);
      return;
    }
    
    root.setAttribute('data-theme', next);
    
    // Try to save to localStorage, but don't fail if it doesn't work
    safeStorageSet(THEME_KEY, next);
    
    const pressed = next === 'dark';
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(pressed));
      // When dark is active, show label "Dark" as active; when light is active, show label "Light"
      toggle.setAttribute('aria-label', pressed ? 'Currently dark mode. Switch to light mode' : 'Currently light mode. Switch to dark mode');
    }
    
    // Dispatch a custom event for embedded contexts that might need to know about theme changes
    try {
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: next } }));
    } catch (e) {
      console.warn('Failed to dispatch theme change event:', e);
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

    // Listen for system theme changes (useful for embedded contexts)
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery && mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', (e) => {
          // Only auto-switch if no explicit theme is set
          if (!safeStorageGet(THEME_KEY)) {
            const newTheme = e.matches ? 'dark' : 'light';
            setTheme(newTheme);
          }
        });
      }
    } catch (e) {
      console.warn('System theme change listener failed:', e);
    }

    // Debug information for embedded contexts
    if (window.location.search.includes('debug=theme')) {
      console.log('Theme Debug Info:', {
        currentTheme: getCurrentTheme(),
        storedTheme: safeStorageGet(THEME_KEY),
        dataTheme: root.getAttribute('data-theme'),
        prefersDark: window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : 'unknown',
        localStorageAvailable: (() => {
          try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
          } catch (e) {
            return false;
          }
        })(),
        userAgent: navigator.userAgent
      });
    }

    // About carousel
    const aboutCarousel = document.querySelector('.about-carousel');
    if (aboutCarousel) {
      const track = aboutCarousel.querySelector('.carousel-track');
      const prevBtn = aboutCarousel.querySelector('.prev');
      const nextBtn = aboutCarousel.querySelector('.next');
      const slides = Array.from(track.querySelectorAll('img'));
      const dotsContainer = aboutCarousel.querySelector('.carousel-dots');
      let dots = [];
      let index = 0;
      let slideWidth = () => aboutCarousel.clientWidth; // base width for 1-up
      let autoplayTimer = null;
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function getVisibleCount() {
        const w = window.innerWidth;
        if (w >= 1024) return 3;
        if (w >= 720) return 2;
        return 1;
      }

      function getSizes() {
        const styles = window.getComputedStyle(track);
        const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
        const firstSlide = slides[0];
        const slideWidth = firstSlide ? firstSlide.getBoundingClientRect().width : (aboutCarousel.clientWidth / getVisibleCount());
        const visible = getVisibleCount();
        const viewportWidth = aboutCarousel.clientWidth;
        const totalWidth = slides.length * slideWidth + gap * (slides.length - 1);
        const visibleWidth = visible * slideWidth + gap * (visible - 1);
        const maxOffset = Math.max(0, totalWidth - visibleWidth);
        return { slideWidth, gap, visible, viewportWidth, totalWidth, visibleWidth, maxOffset };
      }

      function update() {
        const { slideWidth, gap, visibleWidth, maxOffset } = getSizes();
        // Center the focused image when possible
        const targetCenter = index * (slideWidth + gap) + slideWidth / 2;
        let offsetLeft = targetCenter - visibleWidth / 2;
        if (offsetLeft < 0) offsetLeft = 0;
        if (offsetLeft > maxOffset) offsetLeft = maxOffset;
        track.style.transform = `translate3d(${-offsetLeft}px, 0, 0)`;
      }

      function clampIndex(i) {
        // Focus index covers every image
        const len = slides.length;
        if (len === 0) return 0;
        const mod = ((i % len) + len) % len;
        return mod;
      }

      function next() {
        index = clampIndex(index + 1);
        update();
        syncDots();
      }
      function prev() {
        index = clampIndex(index - 1);
        update();
        syncDots();
      }

      function startAutoplay() {
        if (prefersReduced) return;
        stopAutoplay();
        autoplayTimer = setInterval(() => {
          index = clampIndex(index + 1);
          update();
          syncDots();
        }, 3500);
      }
      function stopAutoplay() { if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; } }

      nextBtn?.addEventListener('click', () => { next(); startAutoplay(); });
      prevBtn?.addEventListener('click', () => { prev(); startAutoplay(); });

      let isPointerDown = false;
      let startX = 0;
      let currentX = 0;
      track.addEventListener('pointerdown', (e) => { isPointerDown = true; startX = e.clientX; track.setPointerCapture(e.pointerId); stopAutoplay(); });
      track.addEventListener('pointermove', (e) => { if (!isPointerDown) return; currentX = e.clientX; });
      track.addEventListener('pointerup', (e) => {
        if (!isPointerDown) return; isPointerDown = false; track.releasePointerCapture(e.pointerId);
        const dx = currentX - startX;
        if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
        startAutoplay();
      });
      track.addEventListener('pointercancel', () => { isPointerDown = false; startAutoplay(); });
      aboutCarousel.addEventListener('mouseenter', stopAutoplay);
      aboutCarousel.addEventListener('mouseleave', startAutoplay);

      // Pause autoplay when off-screen
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((entry) => { entry.isIntersecting ? startAutoplay() : stopAutoplay(); });
        }, { threshold: 0.2 });
        io.observe(aboutCarousel);
      } else {
        startAutoplay();
      }

      function buildDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        const total = slides.length;
        dots = Array.from({ length: total }, (_, i) => {
          const btn = document.createElement('button');
          btn.className = 'carousel-dot';
          btn.type = 'button';
          btn.setAttribute('role', 'tab');
          btn.setAttribute('aria-label', `Go to image ${i + 1}`);
          btn.addEventListener('click', () => {
            index = clampIndex(i);
            update();
            syncDots();
            startAutoplay();
          });
          dotsContainer.appendChild(btn);
          return btn;
        });
        syncDots();
      }

      function syncDots() {
        if (!dots || dots.length === 0) return;
        const active = index; // focused image index
        dots.forEach((d, i) => {
          const isActive = i === active;
          d.classList.toggle('is-active', isActive);
          d.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
      }

      window.addEventListener('resize', () => {
        index = clampIndex(index);
        update();
        buildDots();
        syncDots();
      }, { passive: true });
      // Recalculate after images load (for correct widths)
      slides.forEach(img => img.addEventListener('load', () => { update(); buildDots(); syncDots(); }, { once: true }));
      buildDots();
      update();
      startAutoplay();
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
      // Brief loading state on click
      downloadLink.addEventListener('click', function () {
        downloadLink.classList.add('is-loading');
        // Remove loading state after a brief delay (covers quick downloads)
        setTimeout(() => downloadLink.classList.remove('is-loading'), 1500);
      }, { passive: true });
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



