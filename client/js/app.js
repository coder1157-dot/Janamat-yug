/* ============================================================
   JANAMAT YUG - MAIN JAVASCRIPT (Vanilla JS only)
============================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ============================================================
     LOADING SPINNER - hide once page has fully loaded
  ============================================================= */
  const loader = document.getElementById('loader');
  window.addEventListener('load', function () {
    setTimeout(function () {
      if (loader) loader.classList.add('loaded');
    }, 400);
  });

  /* ============================================================
     CURRENT DATE & TIME - updates every second
  ============================================================= */
  const datetimeEl = document.getElementById('current-datetime');

  function updateDateTime() {
    if (!datetimeEl) return;
    const now = new Date();
    const options = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    const dateStr = now.toLocaleDateString('en-IN', options);
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    datetimeEl.innerHTML = '<i class="bi bi-calendar3 me-1"></i>' + dateStr + ' &nbsp;|&nbsp; <i class="bi bi-clock me-1"></i>' + timeStr;
  }
  updateDateTime();
  setInterval(updateDateTime, 1000 * 30); // refresh every 30 seconds

  /* ============================================================
     LANGUAGE SWITCH (English / Hindi) - simple UI toggle
  ============================================================= */
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      langButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const selectedLang = btn.getAttribute('data-lang');
      document.documentElement.setAttribute('lang', selectedLang);
      // NOTE: Full translation logic can be wired here by swapping
      // text content from a language dictionary (en.json / hi.json).
    });
  });

  /* ============================================================
     DARK / LIGHT MODE TOGGLE (persisted using localStorage)
  ============================================================= */
  const themeToggleBtn = document.getElementById('themeToggle');
  const bodyEl = document.body;

  function applyTheme(theme) {
    if (theme === 'dark') {
      bodyEl.classList.add('dark-mode');
      if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="bi bi-sun-fill"></i>';
    } else {
      bodyEl.classList.remove('dark-mode');
      if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="bi bi-moon-stars-fill"></i>';
    }
  }

  const savedTheme = localStorage.getItem('janamatyug-theme') || 'light';
  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function () {
      const isDark = bodyEl.classList.contains('dark-mode');
      const newTheme = isDark ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('janamatyug-theme', newTheme);
    });
  }

  /* ============================================================
     SMOOTH SCROLL for internal anchor links
  ============================================================= */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length > 1) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });

          // Close mobile nav collapse after clicking a link
          const navMenu = document.getElementById('navMenu');
          if (navMenu && navMenu.classList.contains('show')) {
            const bsCollapse = bootstrap.Collapse.getInstance(navMenu) || new bootstrap.Collapse(navMenu);
            bsCollapse.hide();
          }
        }
      }
    });
  });

  /* ============================================================
     ACTIVE NAV LINK highlight based on scroll position
  ============================================================= */
  const navLinks = document.querySelectorAll('.main-navbar .nav-link');
  const sections = Array.from(navLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  function highlightActiveNav() {
    let currentSectionId = '';
    sections.forEach(function (section) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 130 && rect.bottom >= 130) {
        currentSectionId = '#' + section.id;
      }
    });
    if (currentSectionId) {
      navLinks.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('href') === currentSectionId);
      });
    }
  }
  window.addEventListener('scroll', highlightActiveNav);

  /* ============================================================
     BACK TO TOP BUTTON
  ============================================================= */
  const backToTopBtn = document.getElementById('backToTop');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     SEARCH FORM - basic front-end handling
  ============================================================= */
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const query = document.getElementById('searchInput').value.trim();
      if (query.length > 0) {
        // Placeholder: wire this up to a real search results page / API
        alert('Searching for: "' + query + '"');
      }
    });
  }

  /* ============================================================
     NEWSLETTER SUBSCRIPTION FORM
  ============================================================= */
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterMsg = document.getElementById('newsletterMsg');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const emailInput = document.getElementById('newsletterEmail');
      const email = emailInput.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (emailPattern.test(email)) {
        newsletterMsg.textContent = 'Thank you for subscribing! Please check your inbox to confirm.';
        newsletterMsg.style.color = '#d4edda';
        emailInput.value = '';
      } else {
        newsletterMsg.textContent = 'Please enter a valid email address.';
        newsletterMsg.style.color = '#ffdada';
      }
    });
  }

  /* ============================================================
     FOOTER - dynamic current year
  ============================================================= */
  const footerYear = document.getElementById('footerYear');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  /* ============================================================
     STICKY NAVBAR SHADOW on scroll (visual feedback)
  ============================================================= */
  const mainNavbar = document.getElementById('mainNavbar');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 20) {
      mainNavbar.style.boxShadow = '0 4px 14px rgba(0,0,0,0.25)';
    } else {
      mainNavbar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    }
  });

});
