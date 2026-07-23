/* ==========================================================================
   JANAMAT YUG — BOOKMARK PAGE (js/bookmark.js)
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    renderBookmarks();
    const clearBtn = document.getElementById("clearBookmarksBtn");
    if (clearBtn) clearBtn.addEventListener("click", function () {
      if (!JY_STORE.getBookmarks().length) return;
      if (confirm("Remove all bookmarked articles?")) {
        localStorage.setItem("jy_bookmarks", "[]");
        renderBookmarks();
        window.jyToast("All bookmarks cleared");
      }
    });
  });

  function renderBookmarks() {
    const grid = document.getElementById("bookmarkGrid");
    const ids = JY_STORE.getBookmarks();
    document.getElementById("bookmarkCount").textContent = ids.length;

    if (!ids.length) {
      grid.innerHTML = `
        <div class="col-12">
          <div class="jy-empty-state">
            <i class="bi bi-bookmark-heart"></i>
            <p>You haven't saved any articles yet.</p>
            <a href="news.html" class="btn btn-jy-primary">Explore News</a>
          </div>
        </div>`;
      return;
    }

    JY_API.getAllNews().then((all) => {
      const items = all.filter(n => ids.includes(n.id));
      grid.innerHTML = items.map(cardHTML).join("");
      wireRemoveButtons();
    });
  }

  function cardHTML(n) {
    return `
    <div class="col-sm-6 col-lg-4" data-bm-card="${n.id}">
      <div class="jy-card jy-reveal in">
        <a href="news.html?id=${n.id}"><img src="${n.image}" alt="${escapeHTML(n.title)}" loading="lazy"></a>
        <div class="jy-card-body">
          <div class="d-flex justify-content-between align-items-start">
            <span class="jy-pill" data-cat="${n.category}">${n.category}</span>
            <button class="jy-bookmark-toggle active" data-jy-remove="${n.id}" aria-label="Remove bookmark" title="Remove">
              <i class="bi bi-bookmark-x-fill"></i>
            </button>
          </div>
          <h3 class="jy-card-title"><a href="news.html?id=${n.id}" class="text-decoration-none text-reset">${escapeHTML(n.title)}</a></h3>
          <div class="jy-card-meta mt-2"><i class="bi bi-calendar3"></i> ${formatDate(n.date)} <span>&middot;</span> <i class="bi bi-person"></i> ${n.author}</div>
        </div>
      </div>
    </div>`;
  }

  function wireRemoveButtons() {
    document.querySelectorAll("[data-jy-remove]").forEach(btn => {
      btn.addEventListener("click", function () {
        const id = btn.getAttribute("data-jy-remove");
        JY_STORE.toggleBookmark(id);
        const card = document.querySelector(`[data-bm-card="${id}"]`);
        if (card) {
          card.style.transition = "opacity .25s ease, transform .25s ease";
          card.style.opacity = "0";
          card.style.transform = "scale(.94)";
          setTimeout(() => renderBookmarks(), 220);
        }
        window.jyToast("Removed from bookmarks");
      });
    });
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
