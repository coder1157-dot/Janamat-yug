/* ==========================================================================
   JANAMAT YUG — CATEGORY PAGE (js/category.js)
   Reads ?cat= from the URL, renders banner + paginated grid of news.
   ========================================================================== */

(function () {
  "use strict";

  const PAGE_SIZE = 6;
  let currentPage = 1;
  let currentItems = [];

  document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("cat") || "national";

    JY_API.getCategories().then((cats) => {
      const cat = cats.find(c => c.slug === slug) || cats[0];
      renderBanner(cat);
      renderCategoryChips(cats, cat.slug);
      loadNews(cat);
    });
  });

  function renderBanner(cat) {
    document.title = cat.name + " News — Janamat Yug";
    document.getElementById("catBannerTitle").textContent = cat.name + " News";
    document.getElementById("catBannerDesc").textContent = cat.desc;
    const eyebrow = document.getElementById("catBannerEyebrow");
    if (eyebrow) eyebrow.textContent = "Section / " + cat.name;
  }

  function renderCategoryChips(cats, activeSlug) {
    const wrap = document.getElementById("catChips");
    if (!wrap) return;
    wrap.innerHTML = cats.map(c => `
      <a href="category.html?cat=${c.slug}"
         class="btn btn-sm ${c.slug === activeSlug ? 'btn-jy-primary' : 'btn-jy-outline'}">
         ${c.name}
      </a>`).join("");
  }

  function loadNews(cat) {
    const grid = document.getElementById("newsGrid");
    grid.innerHTML = skeletonHTML();
    JY_API.getNewsByCategory(cat.slug).then((items) => {
      currentItems = items;
      currentPage = 1;
      document.getElementById("resultCount").textContent = items.length;
      renderPage();
    });
  }

  function renderPage() {
    const grid = document.getElementById("newsGrid");
    if (!currentItems.length) {
      grid.innerHTML = '<div class="col-12"><div class="jy-empty-state"><i class="bi bi-newspaper"></i><p>No stories in this category yet.</p></div></div>';
      renderPagination(0);
      return;
    }
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = currentItems.slice(start, start + PAGE_SIZE);
    grid.innerHTML = pageItems.map(cardHTML).join("");
    renderPagination(Math.ceil(currentItems.length / PAGE_SIZE));
    wireBookmarkButtons();
  }

  function cardHTML(n) {
    const saved = JY_STORE.isBookmarked(n.id);
    return `
    <div class="col-sm-6 col-lg-4">
      <div class="jy-card jy-reveal in">
        <a href="news.html?id=${n.id}"><img src="${n.image}" alt="${escapeHTML(n.title)}" loading="lazy"></a>
        <div class="jy-card-body">
          <div class="d-flex justify-content-between align-items-start">
            <span class="jy-pill" data-cat="${n.category}">${n.category}</span>
            <button class="jy-bookmark-toggle ${saved ? 'active' : ''}" data-jy-bm="${n.id}" aria-label="Bookmark">
              <i class="bi ${saved ? 'bi-bookmark-fill' : 'bi-bookmark'}"></i>
            </button>
          </div>
          <h3 class="jy-card-title"><a href="news.html?id=${n.id}" class="text-decoration-none text-reset">${escapeHTML(n.title)}</a></h3>
          <p class="jy-card-excerpt">${escapeHTML(n.excerpt)}</p>
          <div class="jy-card-meta mt-2"><i class="bi bi-calendar3"></i> ${formatDate(n.date)} <span>&middot;</span> <i class="bi bi-person"></i> ${n.author}</div>
        </div>
      </div>
    </div>`;
  }

  function wireBookmarkButtons() {
    document.querySelectorAll("[data-jy-bm]").forEach(btn => {
      btn.addEventListener("click", function () {
        const id = btn.getAttribute("data-jy-bm");
        const active = JY_STORE.toggleBookmark(id);
        btn.classList.toggle("active", active);
        btn.innerHTML = `<i class="bi ${active ? 'bi-bookmark-fill' : 'bi-bookmark'}"></i>`;
        window.jyToast(active ? "Saved to bookmarks" : "Removed from bookmarks");
      });
    });
  }

  function renderPagination(totalPages) {
    const nav = document.getElementById("catPagination");
    if (!nav) return;
    if (totalPages <= 1) { nav.innerHTML = ""; return; }
    let html = "";
    html += pageItem("«", currentPage - 1, currentPage === 1);
    for (let p = 1; p <= totalPages; p++) {
      html += `<li class="page-item ${p === currentPage ? 'active' : ''}">
        <a class="page-link jy-page-link" href="#" data-page="${p}">${p}</a></li>`;
    }
    html += pageItem("»", currentPage + 1, currentPage === totalPages);
    nav.innerHTML = html;
    nav.querySelectorAll("[data-page]").forEach(a => {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        const p = Number(a.getAttribute("data-page"));
        if (p < 1 || p > totalPages) return;
        currentPage = p;
        renderPage();
        document.getElementById("newsGrid").scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function pageItem(label, page, disabled) {
    return `<li class="page-item ${disabled ? 'disabled' : ''}">
      <a class="page-link jy-page-link" href="#" data-page="${page}">${label}</a></li>`;
  }

  function skeletonHTML() {
    return Array.from({ length: 3 }).map(() => `
      <div class="col-sm-6 col-lg-4">
        <div class="jy-card"><div class="placeholder-glow"><div class="placeholder w-100" style="aspect-ratio:16/10;display:block;"></div></div>
        <div class="jy-card-body"><span class="placeholder col-4 mb-2 d-block"></span><span class="placeholder col-8 d-block"></span></div></div>
      </div>`).join("");
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }
  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
})();
