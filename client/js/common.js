/* ==========================================================================
   JANAMAT YUG — COMMON UI WIRING (js/common.js)
   Loaded on every page after data.js. Handles the bits shared site-wide:
   breaking ticker text, navbar login/avatar state, toast, reveal-on-scroll.
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initTicker();
    initNavAuthState();
    initReveal();
    initFooterYear();
  });

  function initTicker() {
    const track = document.querySelector("[data-jy-ticker-track]");
    if (!track) return;
    JY_API.getTrending(8).then((items) => {
      const html = items.map(n => `<span>${n.category.toUpperCase()} — ${n.title}</span>`).join("");
      track.innerHTML = html + html; // duplicate for seamless marquee loop
    });
  }

  function initNavAuthState() {
    const session = JY_STORE.getSession();
    const guestEls = document.querySelectorAll("[data-jy-guest-only]");
    const userEls = document.querySelectorAll("[data-jy-user-only]");
    const nameEls = document.querySelectorAll("[data-jy-user-name]");
    if (session) {
      guestEls.forEach(el => el.classList.add("d-none"));
      userEls.forEach(el => el.classList.remove("d-none"));
      nameEls.forEach(el => el.textContent = session.name.split(" ")[0]);
    } else {
      guestEls.forEach(el => el.classList.remove("d-none"));
      userEls.forEach(el => el.classList.add("d-none"));
    }
    const logoutBtns = document.querySelectorAll("[data-jy-logout]");
    logoutBtns.forEach(btn => btn.addEventListener("click", function (e) {
      e.preventDefault();
      JY_STORE.clearSession();
      window.jyToast("Logged out successfully");
      setTimeout(() => window.location.href = "login.html", 700);
    }));
  }

  function initReveal() {
    const items = document.querySelectorAll(".jy-reveal");
    if (!items.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(el => obs.observe(el));
  }

  function initFooterYear() {
    const el = document.querySelector("[data-jy-year]");
    if (el) el.textContent = new Date().getFullYear();
  }

  // Global toast helper: window.jyToast("message", "success"|"error")
  window.jyToast = function (message, type) {
    let el = document.querySelector(".jy-toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "jy-toast";
      document.body.appendChild(el);
    }
    el.style.borderLeftColor = type === "error" ? "var(--jy-danger)" : "var(--jy-saffron)";
    el.textContent = message;
    requestAnimationFrame(() => el.classList.add("show"));
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 2800);
  };
})();
