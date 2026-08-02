/* ==========================================================================
   auth.js — login form handling, session guard, logout.
   ========================================================================== */

const Auth = (() => {
  function isLoggedIn() {
    return Boolean(Api.getToken());
  }

  function logout() {
    Api.clearSession();
    location.href = 'login.html';
  }

  /**
   * Call at the top of every protected page.
   * Redirects to login.html if there is no token, and reveals
   * the page (guarded behind [data-auth-guard]) once confirmed.
   */
  function guardPage() {
    if (!isLoggedIn()) {
      const next = encodeURIComponent(location.pathname + location.search);
      location.href = `login.html?next=${next}`;
      return false;
    }
    document.querySelectorAll("[data-auth-guard]").forEach((el) => {

    el.style.removeProperty("display");

    el.style.display = "block";

});
    return true;
  }

  function redirectIfLoggedIn() {
    if (isLoggedIn()) {
      const next = Common.qs('next', 'dashboard.html');
      location.href = decodeURIComponent(next);
    }
  }

  function initLoginForm() {
    redirectIfLoggedIn();

    if (Common.qs('expired')) {
      Common.toast('Your session has expired. Please log in again.', 'warning');
    }

    const form = document.getElementById('loginForm');
    if (!form) return;

    const submitBtn = document.getElementById('loginSubmitBtn');
    const emailInput = document.getElementById('loginEmail');
    const passInput = document.getElementById('loginPassword');
    const errorBox = document.getElementById('loginError');
    const togglePass = document.getElementById('togglePassword');

    togglePass?.addEventListener('click', () => {
      const isPass = passInput.type === 'password';
      passInput.type = isPass ? 'text' : 'password';
      togglePass.innerHTML = `<i class="bi ${isPass ? 'bi-eye-slash' : 'bi-eye'}"></i>`;
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorBox.classList.add('d-none');

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="inline-spinner me-2"></span>Signing in…`;

      try {
        const res = await Api.auth.login(emailInput.value.trim(), passInput.value);
        const token =
    res?.data?.token ||
    res?.token ||
    res?.accessToken;

const user =
    res?.data?.user ||
    res?.user ||
    res?.admin ||
    null;
        if (!token) throw new Error('Login succeeded but no token was returned by the server.');
        Api.setSession(token, user);

        // Fill in profile details for the session if not returned on login.
        if (!user) {
          try {
            const profile = await Api.auth.profile();
            Api.setSession(
    null,
    profile?.data || profile?.user || profile
);
          } catch (_) { /* non-fatal */ }
        }

        const next = Common.qs('next', 'dashboard.html');
        location.href = decodeURIComponent(next);
      } catch (err) {
        errorBox.textContent = err.message || 'Invalid email or password.';
        errorBox.classList.remove('d-none');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Sign In <i class="bi bi-arrow-right ms-1"></i>';
      }
    });
  }

  return { isLoggedIn, logout, guardPage, redirectIfLoggedIn, initLoginForm };
})();