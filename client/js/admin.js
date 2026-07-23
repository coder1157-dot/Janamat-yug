/* ==========================================================================
   JANAMAT YUG — ADMIN DASHBOARD (js/admin.js)
   Single-page admin shell: sidebar nav swaps visible "section" panels.
   All data is mock (JY_API/JY_STORE) — replace with real fetch() calls to
   /api/admin/* endpoints when the Node/Express backend is connected.
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initSidebarToggle();
    initSectionRouting();
    loadDashboardHome();
    loadRecentArticlesTable();
    loadNewsManageTable();
    loadCategoriesTable();
    loadUsersTable();
    loadCommentsList();
    initAddNewsForm();
    initEditNewsModal();
    initDeleteModal();
    initProfileDropdownGuard();
    animateBars();
  });

  // -------------------------- Sidebar --------------------------
  function initSidebarToggle() {
    const sidebar = document.getElementById("adminSidebar");
    const backdrop = document.getElementById("adminBackdrop");
    document.querySelectorAll("[data-jy-sidebar-toggle]").forEach(btn => {
      btn.addEventListener("click", function () {
        sidebar.classList.toggle("show");
        backdrop.classList.toggle("show");
      });
    });
    if (backdrop) backdrop.addEventListener("click", function () {
      sidebar.classList.remove("show");
      backdrop.classList.remove("show");
    });
  }

  // -------------------------- Section routing --------------------------
  function initSectionRouting() {
    const links = document.querySelectorAll("[data-jy-section]");
    const sections = document.querySelectorAll(".jy-admin-section");
    const titleEl = document.getElementById("adminPageTitle");
    const crumbEl = document.getElementById("adminBreadcrumb");

    links.forEach(link => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const target = link.getAttribute("data-jy-section");
        sections.forEach(s => s.classList.add("d-none"));
        const targetEl = document.getElementById("section-" + target);
        if (targetEl) { targetEl.classList.remove("d-none"); targetEl.classList.add("jy-fade-in"); }
        links.forEach(l => l.classList.remove("active"));
        link.classList.add("active");
        if (titleEl) titleEl.textContent = link.getAttribute("data-jy-title") || link.textContent.trim();
        if (crumbEl) crumbEl.textContent = "Admin / " + (link.getAttribute("data-jy-title") || link.textContent.trim());

        // close mobile sidebar after navigating
        document.getElementById("adminSidebar")?.classList.remove("show");
        document.getElementById("adminBackdrop")?.classList.remove("show");
      });
    });
  }

  // -------------------------- Dashboard home --------------------------
  function loadDashboardHome() {
    JY_API.getAllNews().then(news => {
      document.getElementById("kpiTotalNews").textContent = news.length;
    });
    JY_API.getUsers().then(users => {
      document.getElementById("kpiTotalUsers").textContent = users.length;
    });
    JY_API.getCategories().then(cats => {
      document.getElementById("kpiTotalCategories").textContent = cats.length;
    });
    document.getElementById("kpiPendingComments").textContent = "6";
  }

  function animateBars() {
    document.querySelectorAll(".jy-chart-placeholder .bar").forEach((bar, i) => {
      const h = 30 + Math.round(Math.random() * 70);
      bar.style.height = h + "%";
      bar.style.animationDelay = (i * 0.05) + "s";
    });
  }

  // -------------------------- Recent Articles table (dashboard home) --------------------------
  function loadRecentArticlesTable() {
    const tbody = document.getElementById("recentArticlesBody");
    if (!tbody) return;
    JY_API.getAllNews().then(news => {
      const recent = news.slice(0, 6);
      tbody.innerHTML = recent.map(articleRow).join("");
    });
  }

  const STATUS_CYCLE = ["Published", "Draft", "Pending"];
  function statusBadge(status) {
    const map = { Published: "jy-status-published", Draft: "jy-status-draft", Pending: "jy-status-pending" };
    return `<span class="jy-status-badge ${map[status]}">${status}</span>`;
  }

  function articleRow(n, idx) {
    const status = STATUS_CYCLE[n.id % 3];
    return `
    <tr data-news-id="${n.id}">
      <td><img src="${n.image}" class="jy-row-thumb" alt=""></td>
      <td>
        <div class="fw-semibold">${escapeHTML(n.title)}</div>
        <div class="jy-card-meta">${n.author}</div>
      </td>
      <td><span class="jy-pill" data-cat="${n.category}">${n.category}</span></td>
      <td class="font-mono small">${n.date}</td>
      <td>${statusBadge(status)}</td>
      <td class="text-end">
        <button class="jy-action-icon-btn" data-jy-edit="${n.id}" title="Edit"><i class="bi bi-pencil"></i></button>
        <button class="jy-action-icon-btn danger" data-jy-delete="${n.id}" data-jy-delete-title="${escapeHTML(n.title)}" title="Delete"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`;
  }

  // -------------------------- Manage News table --------------------------
  function loadNewsManageTable() {
    const tbody = document.getElementById("manageNewsBody");
    if (!tbody) return;
    JY_API.getAllNews().then(news => {
      tbody.innerHTML = news.map(articleRow).join("");
      wireRowActions();
    });
  }

  function wireRowActions() {
    document.querySelectorAll("[data-jy-edit]").forEach(btn => {
      btn.addEventListener("click", function () { openEditModal(btn.getAttribute("data-jy-edit")); });
    });
    document.querySelectorAll("[data-jy-delete]").forEach(btn => {
      btn.addEventListener("click", function () {
        openDeleteModal(btn.getAttribute("data-jy-delete"), btn.getAttribute("data-jy-delete-title"));
      });
    });
  }

  // -------------------------- Add News (validation) --------------------------
  function initAddNewsForm() {
    const form = document.getElementById("addNewsForm");
    if (!form) return;
    const dropZone = document.getElementById("addNewsDropZone");
    const fileInput = document.getElementById("addNewsImage");

    if (dropZone && fileInput) {
      dropZone.addEventListener("click", () => fileInput.click());
      ["dragenter", "dragover"].forEach(evt => dropZone.addEventListener(evt, e => { e.preventDefault(); dropZone.classList.add("dragover"); }));
      ["dragleave", "drop"].forEach(evt => dropZone.addEventListener(evt, e => { e.preventDefault(); dropZone.classList.remove("dragover"); }));
      dropZone.addEventListener("drop", e => {
        const file = e.dataTransfer.files[0];
        if (file) dropZone.querySelector(".jy-drop-label").textContent = file.name;
      });
      fileInput.addEventListener("change", () => {
        if (fileInput.files[0]) dropZone.querySelector(".jy-drop-label").textContent = fileInput.files[0].name;
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      let valid = true;
      const title = document.getElementById("addNewsTitle");
      const category = document.getElementById("addNewsCategory");
      const author = document.getElementById("addNewsAuthor");
      const body = document.getElementById("addNewsBody");

      [title, category, author, body].forEach(input => {
        if (!input.value.trim()) { input.classList.add("is-invalid"); valid = false; }
        else input.classList.remove("is-invalid");
      });
      if (body.value.trim().length > 0 && body.value.trim().length < 40) {
        body.classList.add("is-invalid"); valid = false;
        document.getElementById("addNewsBodyFeedback").textContent = "Article body should be at least 40 characters.";
      }
      if (!valid) return;

      const successAlert = document.getElementById("addNewsSuccess");
      successAlert.classList.remove("d-none");
      window.jyToast("News article published successfully");
      form.reset();
      document.querySelector("#addNewsDropZone .jy-drop-label").textContent = "Drag & drop an image, or click to browse";
      setTimeout(() => successAlert.classList.add("d-none"), 3000);
      loadNewsManageTable();
      loadRecentArticlesTable();
    });
  }

  // -------------------------- Edit News modal --------------------------
  function initEditNewsModal() {
    const form = document.getElementById("editNewsForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const title = document.getElementById("editNewsTitle");
      if (!title.value.trim()) { title.classList.add("is-invalid"); return; }
      title.classList.remove("is-invalid");
      const modalEl = document.getElementById("editNewsModal");
      bootstrap.Modal.getInstance(modalEl)?.hide();
      window.jyToast("Article updated successfully");
    });
  }

  function openEditModal(newsId) {
    JY_API.getNewsById(newsId).then(n => {
      if (!n) return;
      document.getElementById("editNewsId").value = n.id;
      document.getElementById("editNewsTitle").value = n.title;
      document.getElementById("editNewsCategory").value = n.category;
      document.getElementById("editNewsAuthor").value = n.author;
      document.getElementById("editNewsBody").value = n.body;
      const modalEl = document.getElementById("editNewsModal");
      new bootstrap.Modal(modalEl).show();
    });
  }

  // -------------------------- Delete confirmation modal --------------------------
  function initDeleteModal() {
    const confirmBtn = document.getElementById("confirmDeleteBtn");
    if (!confirmBtn) return;
    confirmBtn.addEventListener("click", function () {
      const modalEl = document.getElementById("deleteConfirmModal");
      const newsId = confirmBtn.getAttribute("data-target-id");
      const row = document.querySelector(`tr[data-news-id="${newsId}"]`);
      if (row) { row.style.opacity = "0"; setTimeout(() => row.remove(), 250); }
      bootstrap.Modal.getInstance(modalEl)?.hide();
      window.jyToast("Article deleted", "error");
    });
  }

  function openDeleteModal(newsId, title) {
    document.getElementById("deleteConfirmText").textContent = `Are you sure you want to delete "${title}"? This cannot be undone.`;
    document.getElementById("confirmDeleteBtn").setAttribute("data-target-id", newsId);
    new bootstrap.Modal(document.getElementById("deleteConfirmModal")).show();
  }

  // -------------------------- Manage Categories --------------------------
  function loadCategoriesTable() {
    const tbody = document.getElementById("categoriesBody");
    if (!tbody) return;
    JY_API.getCategories().then(cats => {
      JY_API.getAllNews().then(news => {
        tbody.innerHTML = cats.map(c => {
          const count = news.filter(n => n.categorySlug === c.slug).length;
          return `<tr>
            <td><span class="jy-pill" data-cat="${c.name}">${c.name}</span></td>
            <td class="text-muted small">${c.desc}</td>
            <td class="font-mono">${count}</td>
            <td class="text-end">
              <button class="jy-action-icon-btn" title="Edit"><i class="bi bi-pencil"></i></button>
              <button class="jy-action-icon-btn danger" title="Delete"><i class="bi bi-trash"></i></button>
            </td>
          </tr>`;
        }).join("");
      });
    });
    const addCatForm = document.getElementById("addCategoryForm");
    if (addCatForm) addCatForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const nameInput = document.getElementById("newCategoryName");
      if (!nameInput.value.trim()) { nameInput.classList.add("is-invalid"); return; }
      nameInput.classList.remove("is-invalid");
      window.jyToast("Category added successfully");
      nameInput.value = "";
    });
  }

  // -------------------------- Manage Users --------------------------
  function loadUsersTable() {
    const tbody = document.getElementById("usersBody");
    if (!tbody) return;
    JY_API.getUsers().then(users => {
      tbody.innerHTML = users.map(u => `
        <tr>
          <td>
            <div class="d-flex align-items-center gap-2">
              <span class="jy-admin-avatar" style="width:32px;height:32px;font-size:.7rem;">${u.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</span>
              <div><div class="fw-semibold">${escapeHTML(u.name)}</div><div class="jy-card-meta">${u.email}</div></div>
            </div>
          </td>
          <td class="font-mono small">${u.mobile}</td>
          <td>${u.role}</td>
          <td><span class="jy-status-badge ${u.status === 'Active' ? 'jy-status-active' : 'jy-status-blocked'}">${u.status}</span></td>
          <td class="font-mono small">${u.joined}</td>
          <td class="text-end">
            <button class="jy-action-icon-btn" title="${u.status === 'Active' ? 'Block' : 'Unblock'}"><i class="bi ${u.status === 'Active' ? 'bi-slash-circle' : 'bi-check-circle'}"></i></button>
            <button class="jy-action-icon-btn danger" title="Delete"><i class="bi bi-trash"></i></button>
          </td>
        </tr>`).join("");
      tbody.querySelectorAll(".jy-action-icon-btn:not(.danger)").forEach(btn => {
        btn.addEventListener("click", () => window.jyToast("User status updated"));
      });
      tbody.querySelectorAll(".jy-action-icon-btn.danger").forEach(btn => {
        btn.addEventListener("click", function () {
          const row = btn.closest("tr");
          row.style.opacity = "0";
          setTimeout(() => row.remove(), 250);
          window.jyToast("User removed", "error");
        });
      });
    });
  }

  // -------------------------- Manage Comments --------------------------
  function loadCommentsList() {
    const wrap = document.getElementById("commentsModerationList");
    if (!wrap) return;
    JY_API.getAllNews().then(news => {
      const sample = news.slice(0, 6).flatMap(n => n.comments.map(c => ({ ...c, newsTitle: n.title, newsId: n.id })));
      wrap.innerHTML = sample.map((c, i) => `
        <div class="jy-mini-list-item" data-comment-idx="${i}">
          <div class="jy-comment-avatar" style="width:36px;height:36px;font-size:.75rem;">${c.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between">
              <strong class="small">${escapeHTML(c.name)}</strong>
              <span class="jy-card-meta">${c.date}</span>
            </div>
            <p class="mb-1 small">${escapeHTML(c.text)}</p>
            <a href="news.html?id=${c.newsId}" class="jy-card-meta text-decoration-underline">${escapeHTML(c.newsTitle)}</a>
          </div>
          <div class="d-flex flex-column gap-1">
            <button class="jy-action-icon-btn" title="Approve"><i class="bi bi-check-lg"></i></button>
            <button class="jy-action-icon-btn danger" title="Delete"><i class="bi bi-trash"></i></button>
          </div>
        </div>`).join("");
      wrap.querySelectorAll(".jy-action-icon-btn:not(.danger)").forEach(btn => btn.addEventListener("click", () => window.jyToast("Comment approved")));
      wrap.querySelectorAll(".jy-action-icon-btn.danger").forEach(btn => btn.addEventListener("click", function () {
        const item = btn.closest("[data-comment-idx]");
        item.style.opacity = "0";
        setTimeout(() => item.remove(), 250);
        window.jyToast("Comment removed", "error");
      }));
    });
  }

  // -------------------------- Profile dropdown / logout guard --------------------------
  function initProfileDropdownGuard() {
    const logoutBtn = document.getElementById("adminLogoutBtn");
    if (!logoutBtn) return;
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      JY_STORE.clearSession();
      window.jyToast("Logged out of admin dashboard");
      setTimeout(() => window.location.href = "login.html", 700);
    });
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
})();
