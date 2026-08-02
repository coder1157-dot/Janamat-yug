/**
 * bookmark.js
 * ------------------------------------------------------------------
 * SINGLE RESPONSIBILITY: bookmark page — list saved news
 * (localStorage, synced with backend when logged in) and remove them.
 * ------------------------------------------------------------------
 */

import { getAllBookmarks, removeBookmarkLocal, syncBookmarksFromServer, showToast } from './interaction.js';
import { isLoggedIn } from './auth.js';

function fallbackImg(seed = 'news') {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/640/400`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (_) {
    return '';
  }
}
 function bookmarkCardHTML(item) {

  const news = item.news || item;

  const img =
      news.coverImage ||
      news.image ||
      fallbackImg(news.slug || news._id);

  return `
    <div class="col-md-4 col-sm-6">
      <div class="jy-card">

        <a href="news.html?slug=${news.slug}">
          <img
             src="${img}"
             class="jy-card-img"
             alt="${news.title}">
        </a>

        <div class="jy-card-body">

          <h3>${news.title}</h3>

          <button
             class="jy-remove-bookmark btn btn-danger"
             data-id="${item._id}">
             हटाएं
          </button>

        </div>
      </div>
    </div>
  `;
}

function render(items) {
  const grid = document.getElementById('bookmarkGrid');
  const emptyState = document.getElementById('bookmarkEmpty');
  const countEl = document.getElementById('bookmarkPageCount');

  countEl.textContent = items.length;

  if (!items.length) {
    grid.innerHTML = '';
    emptyState.classList.remove('d-none');
    return;
  }

  emptyState.classList.add('d-none');
  grid.innerHTML = items.map(bookmarkCardHTML).join('');

  grid.querySelectorAll('.jy-remove-bookmark').forEach((btn) => {
    btn.addEventListener('click', () => {
      removeBookmarkLocal(btn.dataset.id);
      btn.closest(".col-md-4").remove();
      showToast('बुकमार्क हटाया गया', 'success');
      const remaining = getAllBookmarks();
      render(remaining);
    });
  });
}

async function init() {
  const grid = document.getElementById('bookmarkGrid');
  if (!grid) return; /* not the bookmark page */

  render(getAllBookmarks());

  if (isLoggedIn()) {
    const synced = await syncBookmarksFromServer();
    render(synced);
  }
}

document.addEventListener('DOMContentLoaded', init);
