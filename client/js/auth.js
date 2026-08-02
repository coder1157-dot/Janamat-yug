/**
 * auth.js
 * ------------------------------------------------------------------
 * SINGLE RESPONSIBILITY: authentication — login, register, JWT session,
 * and the shared auth-state widget in the top bar (used on every page).
 * ------------------------------------------------------------------
 */

 import {
  loginRequest,
  registerRequest,
  getNewsletterSubscribeRequest
} from "./newsApi.js";

const TOKEN_KEY = 'jyug_token';
const USER_KEY = 'jyug_user';

/* ------------------------------------------------------------------ */
/* Session helpers (exported for use by profile.js / interaction.js)   */
/* ------------------------------------------------------------------ */

export function isLoggedIn() {
  return !!localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch (_) {
    return null;
  }
}

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user || {}));
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = 'index.html';
}

/* ------------------------------------------------------------------ */
/* Shared nav auth-state widget (#authArea on every page's top bar)    */
/* ------------------------------------------------------------------ */

export function renderAuthState() {
  const area = document.getElementById('authArea');
  if (!area) return;

  if (isLoggedIn()) {
    const user = getCurrentUser() || {};
    area.innerHTML = `
      <a href="profile.html" class="me-2"><i class="fa-solid fa-user"></i> ${user.fullName || 'प्रोफ़ाइल'}</a>
      <span>|</span>
      <a href="bookmark.html" class="me-2"><i class="fa-solid fa-bookmark"></i> बुकमार्क</a>
      <span>|</span>
      <a href="#" id="logoutBtn">लॉगआउट</a>
    `;
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  } else {
    area.innerHTML = `
      <a href="login.html"><i class="fa-solid fa-right-to-bracket"></i> लॉगिन</a>
      <span>|</span>
      <a href="register.html">रजिस्टर करें</a>
    `;
  }
}

/* ------------------------------------------------------------------ */
/* Login page                                                          */
/* ------------------------------------------------------------------ */

function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById('authError');
    const submitBtn = document.getElementById('loginSubmitBtn');
    errorBox.classList.add('d-none');

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'लॉगिन हो रहा है...';

    try {
      const data = await loginRequest({ email, password });
      saveSession(data.token, data.user);
      window.location.href = 'profile.html';
    } catch (err) {
      errorBox.textContent = err.message || 'लॉगिन विफल रहा';
      errorBox.classList.remove('d-none');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'लॉगिन करें';
    }
  });
}

/* ------------------------------------------------------------------ */
/* Register page                                                       */
/* ------------------------------------------------------------------ */

function initRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById('authError');
    const submitBtn = document.getElementById('registerSubmitBtn');
    errorBox.classList.add('d-none');

    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (password !== confirmPassword) {
      errorBox.textContent = 'पासवर्ड मेल नहीं खाते';
      errorBox.classList.remove('d-none');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'रजिस्टर हो रहा है...';

    try {
      const data = await registerRequest({ fullName: name, email, password });
      if (data.token) {
        saveSession(data.token, data.user);
        window.location.href = 'profile.html';
      } else {
        window.location.href = 'login.html';
      }
    } catch (err) {
      errorBox.textContent = err.message || 'रजिस्ट्रेशन विफल रहा';
      errorBox.classList.remove('d-none');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'रजिस्टर करें';
    }
  });
}

/* ------------------------------------------------------------------ */
/* Route guard for pages that require login (profile / bookmark)       */
/* ------------------------------------------------------------------ */

export function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

/* ------------------------------------------------------------------ */
/* Site-wide chrome shared by every page (topbar date, footer year,    */
/* nav search redirect, back-to-top) — lives here since auth.js is the */
/* one module every page already loads, avoiding duplicate inline JS.  */
/* ------------------------------------------------------------------ */

function initSiteChrome() {
  const dateEl = document.getElementById('topbarDate');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const searchForm = document.getElementById('navSearchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('navSearchInput');
      const q = input.value.trim();
      if (q) window.location.href = `category.html?search=${encodeURIComponent(q)}`;
    });
  }

  const backTopBtn = document.getElementById('backTopBtn');
  if (backTopBtn) {
    window.addEventListener('scroll', () => {
      backTopBtn.classList.toggle('show', window.scrollY > 400);
    });
    backTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

   const contactForm = document.getElementById("contactForm");

if (contactForm) {

  contactForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const name = document.getElementById("contactName").value;
    const email = document.getElementById("contactEmail").value;
    const message = document.getElementById("contactMessage").value;

    const res = await fetch("http://localhost:5000/api/contact", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        name,
        email,
        message
      })

    });



    const data = await res.json();

    if (data.success) {

      document.getElementById("contactSuccess").classList.remove("d-none");

      contactForm.reset();

    } else {

      alert(data.message);

    }

  });

}

// Newsletter Subscribe

const newsletterForm = document.getElementById("newsletterForm");

if (newsletterForm) {

  newsletterForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("newsletterEmail").value.trim();

    if (!email) {
      alert("Email required");
      return;
    }

    try {

      const data = await getNewsletterSubscribeRequest(email);

      alert("✅ Newsletter Subscribe Successfully");

      newsletterForm.reset();

    } catch (err) {

      alert(err.message);

    }

  });

}
}

document.addEventListener('DOMContentLoaded', () => {
  renderAuthState();
  initLoginForm();
  initRegisterForm();
  initSiteChrome();
});
