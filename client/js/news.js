/* ==========================================================================
   JANAMAT YUG — SINGLE NEWS PAGE (js/news.js)
   Reads ?id= from the URL, renders the article, related news and comments.
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const newsId = params.get("id") || "1";

    JY_API.getNewsById(newsId).then((article) => {
      if (!article) {
        document.getElementById("articleRoot").innerHTML =
          '<div class="jy-empty-state"><i class="bi bi-file-earmark-x"></i><p>This article could not be found.</p><a href="news.html" class="btn btn-jy-primary">Back to News</a></div>';
        return;
      }
      renderArticle(article);
      renderComments(article);
      JY_API.getRelated(article.id, article.categorySlug, 3).then(renderRelated);
    });

    initShareButtons();
    initCommentForm(newsId);
  });

  function renderArticle(article) {
    document.title = article.title + " — Janamat Yug";
    document.getElementById("heroImage").src = article.image;
    document.getElementById("heroImage").alt = article.title;
    document.getElementById("articleTitle").textContent = article.title;
    document.getElementById("articleDate").textContent = formatDate(article.date);
    document.getElementById("articleAuthor").textContent = article.author;
    const catEl = document.getElementById("articleCategory");
    catEl.textContent = article.category;
    catEl.setAttribute("data-cat", article.category);
    catEl.href = "category.html?cat=" + article.categorySlug;

    const bodyEl = document.getElementById("articleBody");
    bodyEl.innerHTML = article.body.split("\n\n").map(p => `<p>${p}</p>`).join("");

    const avatar = document.getElementById("authorAvatar");
    if (avatar) avatar.textContent = article.author.split(" ").map(w => w[0]).join("").slice(0, 2);

    // Bookmark toggle
    const bmBtn = document.getElementById("articleBookmarkBtn");
    if (bmBtn) {
      updateBookmarkBtn(bmBtn, JY_STORE.isBookmarked(article.id));
      bmBtn.addEventListener("click", function () {
        const active = JY_STORE.toggleBookmark(article.id);
        updateBookmarkBtn(bmBtn, active);
        window.jyToast(active ? "Saved to bookmarks" : "Removed from bookmarks");
      });
    }

    window._jyCurrentArticle = article;
  }

  function updateBookmarkBtn(btn, active) {
    btn.classList.toggle("active", active);
    btn.innerHTML = active
      ? '<i class="bi bi-bookmark-fill"></i> Saved'
      : '<i class="bi bi-bookmark"></i> Save';
  }

  function renderRelated(items) {
    const wrap = document.getElementById("relatedNewsRow");
    if (!wrap) return;
    if (!items.length) { wrap.innerHTML = '<p class="text-muted">No related stories right now.</p>'; return; }
    wrap.innerHTML = items.map(cardHTML).join("");
  }

  function cardHTML(n) {
    return `
    <div class="col-sm-6 col-lg-4">
      <div class="jy-card jy-reveal in">
        <a href="news.html?id=${n.id}"><img src="${n.image}" alt="${escapeHTML(n.title)}" loading="lazy"></a>
        <div class="jy-card-body">
          <span class="jy-pill" data-cat="${n.category}">${n.category}</span>
          <h3 class="jy-card-title"><a href="news.html?id=${n.id}" class="text-decoration-none text-reset">${escapeHTML(n.title)}</a></h3>
          <div class="jy-card-meta"><i class="bi bi-calendar3"></i> ${formatDate(n.date)} <span>&middot;</span> <i class="bi bi-person"></i> ${n.author}</div>
        </div>
      </div>
    </div>`;
  }

  function renderComments(article) {
    const list = document.getElementById("commentsList");
    const countEl = document.getElementById("commentsCount");
    const extra = JY_STORE.getExtraComments(article.id);
    const all = [...article.comments, ...extra];
    countEl.textContent = all.length;
    list.innerHTML = all.map(c => `
      <div class="jy-comment">
        <div class="jy-comment-avatar">${c.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
        <div>
          <div class="d-flex align-items-center gap-2">
            <strong>${escapeHTML(c.name)}</strong>
            <span class="jy-card-meta">${c.date}</span>
          </div>
          <p class="mb-0 mt-1">${escapeHTML(c.text)}</p>
        </div>
      </div>`).join("");
  }

  function initCommentForm(newsId) {
    const form = document.getElementById("commentForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const nameInput = document.getElementById("commentName");
      const textInput = document.getElementById("commentText");
      if (!nameInput.value.trim() || !textInput.value.trim()) {
        nameInput.classList.toggle("is-invalid", !nameInput.value.trim());
        textInput.classList.toggle("is-invalid", !textInput.value.trim());
        return;
      }
      nameInput.classList.remove("is-invalid");
      textInput.classList.remove("is-invalid");
      const comment = { name: nameInput.value.trim(), text: textInput.value.trim(), date: "Just now" };
      JY_STORE.addComment(newsId, comment);
      renderComments(window._jyCurrentArticle);
      form.reset();
      window.jyToast("Comment posted");
    });
  }

  function initShareButtons() {
    document.querySelectorAll("[data-jy-share]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const type = btn.getAttribute("data-jy-share");
        const url = window.location.href;
        const title = document.title;
        const targets = {
          whatsapp: `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
          twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        };
        if (type === "copy") {
          navigator.clipboard?.writeText(url).then(() => window.jyToast("Link copied to clipboard"));
          return;
        }
        window.open(targets[type], "_blank", "noopener,width=600,height=500");
      });
    });
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }
  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
})();
