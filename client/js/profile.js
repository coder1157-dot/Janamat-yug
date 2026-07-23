/* ==========================================================================
   JANAMAT YUG — PROFILE PAGE (js/profile.js)
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    if (!JY_STORE.getSession()) {
      // Not logged in: still render with guest defaults, gently prompt.
      window.jyToast("Log in to see your personalised profile");
    }
    renderProfile();
    renderSavedArticlesPreview();
    initEditProfile();
  });

  function renderProfile() {
    const p = JY_STORE.getProfile();
    document.getElementById("profileName").textContent = p.name;
    document.getElementById("profileEmail").textContent = p.email;
    document.getElementById("profileMobile").textContent = p.mobile || "Not provided";
    const photo = document.getElementById("profilePhoto");
    photo.src = p.photo || `https://ui-avatars.com/api/?background=8C2A34&color=fff&size=200&name=${encodeURIComponent(p.name)}`;

    const bookmarks = JY_STORE.getBookmarks();
    document.getElementById("statSaved").textContent = bookmarks.length;
    document.getElementById("statComments").textContent = countMyComments();
    document.getElementById("statJoined").textContent = "2026";
  }

  function countMyComments() {
    try {
      const raw = JSON.parse(localStorage.getItem("jy_comments_extra") || "{}");
      return Object.values(raw).reduce((sum, arr) => sum + arr.length, 0);
    } catch (e) { return 0; }
  }

  function renderSavedArticlesPreview() {
    const wrap = document.getElementById("savedArticlesPreview");
    if (!wrap) return;
    const ids = JY_STORE.getBookmarks().slice(0, 3);
    if (!ids.length) {
      wrap.innerHTML = '<div class="jy-empty-state py-4"><i class="bi bi-bookmark"></i><p class="mb-2">No saved articles yet.</p><a href="news.html" class="btn btn-jy-outline btn-sm">Browse News</a></div>';
      return;
    }
    JY_API.getAllNews().then((all) => {
      const items = all.filter(n => ids.includes(n.id));
      wrap.innerHTML = items.map(n => `
        <a href="news.html?id=${n.id}" class="d-flex align-items-center gap-3 text-decoration-none text-reset py-2 border-bottom">
          <img src="${n.image}" alt="" style="width:64px;height:48px;object-fit:cover;border-radius:6px;">
          <div>
            <div class="fw-semibold">${escapeHTML(n.title)}</div>
            <div class="jy-card-meta">${n.category}</div>
          </div>
        </a>`).join("");
    });
  }

  function initEditProfile() {
    const form = document.getElementById("editProfileForm");
    if (!form) return;
    const modalEl = document.getElementById("editProfileModal");
    const modal = window.bootstrap ? new bootstrap.Modal(modalEl) : null;

    modalEl.addEventListener("show.bs.modal", function () {
      const p = JY_STORE.getProfile();
      document.getElementById("editName").value = p.name;
      document.getElementById("editEmail").value = p.email;
      document.getElementById("editMobile").value = p.mobile || "";
      document.getElementById("editPhoto").value = p.photo || "";
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const nameInput = document.getElementById("editName");
      const emailInput = document.getElementById("editEmail");
      let valid = true;
      if (nameInput.value.trim().length < 3) { nameInput.classList.add("is-invalid"); valid = false; }
      else nameInput.classList.remove("is-invalid");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) { emailInput.classList.add("is-invalid"); valid = false; }
      else emailInput.classList.remove("is-invalid");
      if (!valid) return;

      const updated = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        mobile: document.getElementById("editMobile").value.trim(),
        photo: document.getElementById("editPhoto").value.trim()
      };
      JY_STORE.saveProfile(updated);
      renderProfile();
      window.jyToast("Profile updated successfully");
      if (modal) modal.hide();
    });
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
})();
