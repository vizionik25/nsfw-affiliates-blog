/**
 * Nightfall Theme — Main JavaScript
 * Vanilla ES6+, no dependencies.
 */
(function () {
  'use strict';

  /* -------------------------------------------------- *
   *  1. Age Gate
   * -------------------------------------------------- */
  function initAgeGate() {
    const gate = document.querySelector('.age-gate');
    if (!gate) return;

    // Check if already verified
    try {
      if (localStorage.getItem('age_verified') === 'true') {
        gate.classList.add('verified');
        document.body.classList.remove('no-scroll');
        return;
      }
    } catch (e) {
      /* Private browsing — gate stays visible each visit */
    }

    // "Enter" button — verify & hide gate
    const enterBtn = gate.querySelector('[data-age-enter]') || document.getElementById('age-gate-enter');
    if (enterBtn) {
      enterBtn.addEventListener('click', function () {
        try {
          localStorage.setItem('age_verified', 'true');
        } catch (e) {
          /* Silently continue in private mode */
        }
        gate.classList.add('verified');
        document.body.classList.remove('no-scroll');
      });
    }

    // "Leave" button — redirect away
    const leaveBtn = gate.querySelector('[data-age-leave]') || document.getElementById('age-gate-leave');
    if (leaveBtn) {
      leaveBtn.addEventListener('click', function () {
        window.location.href = 'https://www.google.com';
      });
    }
  }

  /* -------------------------------------------------- *
   *  2. Mobile Navigation Drawer
   * -------------------------------------------------- */
  function initMobileNav() {
    const toggle   = document.querySelector('.navbar__toggle');
    const drawer   = document.querySelector('.mobile-drawer');
    const backdrop = document.querySelector('.drawer-backdrop');
    if (!toggle || !drawer) return;

    function closeDrawer() {
      toggle.classList.remove('active');
      drawer.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
    }

    toggle.addEventListener('click', function () {
      // Don't open nav while age gate is blocking
      const gate = document.querySelector('.age-gate');
      if (gate && !gate.classList.contains('verified')) return;

      const isOpen = drawer.classList.toggle('open');
      toggle.classList.toggle('active', isOpen);
      if (backdrop) backdrop.classList.toggle('open', isOpen);
    });

    // Close on backdrop click
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    // Close on link click inside drawer
    drawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeDrawer);
    });
  }

  /* -------------------------------------------------- *
   *  3. Navbar Scroll State
   * -------------------------------------------------- */
  function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let ticking = false;

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          navbar.classList.toggle('scrolled', window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Apply immediately on load
  }

  /* -------------------------------------------------- *
   *  4. Scroll Reveal (IntersectionObserver)
   * -------------------------------------------------- */
  function initScrollReveal() {
    var elements = document.querySelectorAll('.reveal-on-scroll');
    if (!elements.length) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );

      elements.forEach(function (el) { observer.observe(el); });
    } else {
      // Fallback: reveal everything immediately
      elements.forEach(function (el) { el.classList.add('revealed'); });
    }
  }

  /* -------------------------------------------------- *
   *  5. Smooth Scroll for Anchor Links
   * -------------------------------------------------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;

        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /* -------------------------------------------------- *
   *  6. Lazy Image Fallback
   * -------------------------------------------------- */
  function initLazyImages() {
    if ('loading' in HTMLImageElement.prototype) return; // native support
    var images = document.querySelectorAll('img[loading="lazy"]');
    if (!images.length) return;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          if (img.dataset.src) { img.src = img.dataset.src; }
          observer.unobserve(img);
        }
      });
    });
    images.forEach(function(img) { observer.observe(img); });
  }

  /* -------------------------------------------------- *
   *  Boot
   * -------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initAgeGate();
    initMobileNav();
    initNavbarScroll();
    initScrollReveal();
    initSmoothScroll();
    initLazyImages();
  });
})();
