/* ==========================================================================
   JANAMAT YUG — AUTH (js/auth.js)
   Powers login.html and register.html. Uses JY_STORE (localStorage) as a
   stand-in for a real /api/auth/login and /api/auth/register endpoint.
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initLoginForm();
    initRegisterForm();
    initPasswordToggles();
    initForgotPassword();
  });

  function setInvalid(input, message) {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    const fb = input.closest(".jy-field")?.querySelector(".invalid-feedback");
    if (fb && message) fb.textContent = message;
  }
  function setValid(input) {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
  }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const MOBILE_RE = /^[6-9]\d{9}$/;

  // -------------------------- LOGIN --------------------------
  function initLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    const emailInput = document.getElementById("loginEmail");
    const rememberedEmail = JY_STORE.getRememberedEmail();
    if (rememberedEmail) {
      emailInput.value = rememberedEmail;
      document.getElementById("rememberMe").checked = true;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      let valid = true;

      const email = emailInput.value.trim();
      const password = document.getElementById("loginPassword").value;

      if (!EMAIL_RE.test(email)) { setInvalid(emailInput, "Enter a valid email address."); valid = false; }
      else setValid(emailInput);

      const pwInput = document.getElementById("loginPassword");
      if (password.length < 6) { setInvalid(pwInput, "Password must be at least 6 characters."); valid = false; }
      else setValid(pwInput);

      if (!valid) return;

      const remember = document.getElementById("rememberMe").checked;
      const existing = JY_STORE.findUser(email);
      const user = existing || { name: email.split("@")[0], email, mobile: "" };
      if (!existing) JY_STORE.saveUser({ name: user.name, email, mobile: "", password });

      JY_STORE.setSession(user, remember);
      window.jyToast("Login successful. Welcome back, " + user.name.split(" ")[0] + "!");
      const btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Signing in…';
      setTimeout(() => { window.location.href = "news.html"; }, 900);
    });
  }

  // -------------------------- REGISTER --------------------------
  function initRegisterForm() {
    const form = document.getElementById("registerForm");
    if (!form) return;

    const nameInput = document.getElementById("regName");
    const emailInput = document.getElementById("regEmail");
    const mobileInput = document.getElementById("regMobile");
    const pwInput = document.getElementById("regPassword");
    const cpwInput = document.getElementById("regConfirmPassword");
    const strengthBar = document.getElementById("pwStrengthBar");

    pwInput.addEventListener("input", function () {
      updateStrength(pwInput.value, strengthBar);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      let valid = true;

      if (nameInput.value.trim().length < 3) { setInvalid(nameInput, "Name must be at least 3 characters."); valid = false; }
      else setValid(nameInput);

      const email = emailInput.value.trim();
      if (!EMAIL_RE.test(email)) { setInvalid(emailInput, "Enter a valid email address."); valid = false; }
      else if (JY_STORE.findUser(email)) { setInvalid(emailInput, "An account with this email already exists."); valid = false; }
      else setValid(emailInput);

      if (!MOBILE_RE.test(mobileInput.value.trim())) { setInvalid(mobileInput, "Enter a valid 10-digit Indian mobile number."); valid = false; }
      else setValid(mobileInput);

      if (pwInput.value.length < 6) { setInvalid(pwInput, "Password must be at least 6 characters."); valid = false; }
      else setValid(pwInput);

      if (cpwInput.value !== pwInput.value || cpwInput.value === "") { setInvalid(cpwInput, "Passwords do not match."); valid = false; }
      else setValid(cpwInput);

      const terms = document.getElementById("agreeTerms");
      if (terms && !terms.checked) { terms.classList.add("is-invalid"); valid = false; }
      else if (terms) terms.classList.remove("is-invalid");

      if (!valid) return;

      const user = { name: nameInput.value.trim(), email, mobile: mobileInput.value.trim(), password: pwInput.value };
      JY_STORE.saveUser(user);
      JY_STORE.setSession(user, false);
      window.jyToast("Account created! Redirecting to your profile…");
      const btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creating account…';
      setTimeout(() => { window.location.href = "profile.html"; }, 900);
    });
  }

  function updateStrength(pw, bar) {
    if (!bar) return;
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const pct = Math.min(100, score * 20);
    const colors = ["#B23A3A", "#B23A3A", "#E2900F", "#E2900F", "#2F7D4F", "#2F7D4F"];
    bar.style.width = pct + "%";
    bar.style.background = colors[score];
  }

  function initPasswordToggles() {
    document.querySelectorAll("[data-jy-toggle-password]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const targetId = btn.getAttribute("data-jy-toggle-password");
        const input = document.getElementById(targetId);
        if (!input) return;
        const isPw = input.type === "password";
        input.type = isPw ? "text" : "password";
        btn.innerHTML = isPw ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
      });
    });
  }

  function initForgotPassword() {
    const link = document.getElementById("forgotPasswordLink");
    const modalEl = document.getElementById("forgotPasswordModal");
    if (!link || !modalEl || !window.bootstrap) return;
    const modal = new bootstrap.Modal(modalEl);
    link.addEventListener("click", function (e) {
      e.preventDefault();
      modal.show();
    });
    const form = document.getElementById("forgotPasswordForm");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const emailInput = document.getElementById("forgotEmail");
      if (!EMAIL_RE.test(emailInput.value.trim())) { setInvalid(emailInput, "Enter a valid email address."); return; }
      setValid(emailInput);
      document.getElementById("forgotSuccessMsg").classList.remove("d-none");
      form.querySelector("button[type=submit]").disabled = true;
      setTimeout(() => modal.hide(), 1800);
    });
    modalEl.addEventListener("hidden.bs.modal", function () {
      form.reset();
      form.querySelector("button[type=submit]").disabled = false;
      document.getElementById("forgotSuccessMsg").classList.add("d-none");
      emailInputReset();
    });
    function emailInputReset() {
      const emailInput = document.getElementById("forgotEmail");
      emailInput.classList.remove("is-invalid", "is-valid");
    }
  }
})();
