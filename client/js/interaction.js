/**
 * interaction.js
 * ------------------------------------------------------------------
 * SINGLE RESPONSIBILITY: cross-page interactions —
 * bookmarks (localStorage + backend sync), like, rating, share, toast.
 * Imported by article.js, bookmark.js, news.js, category.js.
 * ------------------------------------------------------------------
 */
 import {
    API_BASE_URL,
    likeNews,
    rateNews,
    addBookmarkRequest,
    removeBookmarkRequest,
    getBookmarksRequest
} from './newsApi.js';
import { isLoggedIn } from './auth.js';

const BOOKMARK_KEY = 'jyug_bookmarks';

/* ------------------------------------------------------------------ */
/* Toast                                                               */
/* ------------------------------------------------------------------ */

function ensureToastContainer() {
  let container = document.querySelector('.jy-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'jy-toast-container';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * showToast('संदेश', 'success' | 'error' | 'info')
 */
export function showToast(message, type = 'info') {
  const container = ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = `jy-toast jy-toast-${type}`;
  const icon = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/* ------------------------------------------------------------------ */
/* Bookmarks (localStorage first, backend sync when logged in)         */
/* ------------------------------------------------------------------ */

function readBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(BOOKMARK_KEY)) || [];
  } catch (_) {
    return [];
  }
}

function writeBookmarks(list) {
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(list));
}

export function isBookmarked(newsId) {
  return readBookmarks().some((item) => item.id === newsId);
}

export function getAllBookmarks() {
  return readBookmarks();
}

/**
 * Toggles a bookmark for a news item and syncs with the backend if logged in.
 * @param {{id:string, title:string, slug:string, image:string, category:string}} newsItem
 */
export async function toggleBookmark(newsItem) {
  const list = readBookmarks();
  const index = list.findIndex((item) => item.id === newsItem.id);
  let added;

  if (index > -1) {
    list.splice(index, 1);
    added = false;
  } else {
    list.unshift({ ...newsItem, savedAt: new Date().toISOString() });
    added = true;
  }
  writeBookmarks(list);

  if (isLoggedIn()) {
    try {
      if (added) {
        await addBookmarkRequest(newsItem.id);
      } else {
        await removeBookmarkRequest(newsItem.id);
      }
    } catch (err) {
      showToast('बुकमार्क सर्वर से समन्वयित नहीं हो सका', 'error');
    }
  }

  showToast(added ? 'समाचार बुकमार्क में जोड़ा गया' : 'बुकमार्क हटाया गया', 'success');
  return added;
}

export function removeBookmarkLocal(newsId) {
  const list = readBookmarks().filter((item) => item.id !== newsId);
  writeBookmarks(list);
  if (isLoggedIn()) {
    removeBookmarkRequest(newsId).catch(() => {});
  }
}

/**
 * Pulls backend bookmarks (if logged in) and merges into localStorage.
 */
export async function syncBookmarksFromServer() {
  if (!isLoggedIn()) return readBookmarks();
  try {
    const serverList = await getBookmarksRequest();
    const items = Array.isArray(serverList) ? serverList : (serverList.bookmarks || []);
    writeBookmarks(items);
    return items;
  } catch (_) {
    return readBookmarks();
  }
}

/* ------------------------------------------------------------------ */
/* Like                                                                 */
/* ------------------------------------------------------------------ */

export async function handleLike(newsId) {
  if (!isLoggedIn()) {
    showToast('पसंद करने के लिए लॉगिन करें', 'error');
    return null;
  }
  try {
    const result = await likeNews(newsId);
    showToast('आपने इस समाचार को पसंद किया', 'success');
    return result;
  } catch (err) {
    showToast(err.message || 'कुछ गलत हो गया', 'error');
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Rating                                                               */
/* ------------------------------------------------------------------ */

export async function handleRating(newsId, rating) {
  if (!isLoggedIn()) {
    showToast('रेटिंग देने के लिए लॉगिन करें', 'error');
    return null;
  }
  try {
    const result = await rateNews(newsId, rating);
    showToast(`आपने ${rating} स्टार रेटिंग दी`, 'success');
    return result;
  } catch (err) {
    showToast(err.message || 'कुछ गलत हो गया', 'error');
    return null;
  }
}

/**
 * Wires up a `.jy-rating` element (five <i> stars) to call handleRating.
 */
export function initRatingWidget(container, newsId, currentRating = 0) {
  if (!container) return;
  const stars = container.querySelectorAll('i');
  const paint = (value) => {
    stars.forEach((star, i) => star.classList.toggle('active', i < value));
  };
  paint(currentRating);

  stars.forEach((star, i) => {
    star.addEventListener('mouseenter', () => paint(i + 1));
    star.addEventListener('mouseleave', () => paint(currentRating));
    star.addEventListener('click', async () => {
      const value = i + 1;
      const result = await handleRating(newsId, value);
      if (result) {
        currentRating = value;
        paint(currentRating);
      }
    });
  });
}

/* ------------------------------------------------------------------ */
/* Share                                                                */
/* ------------------------------------------------------------------ */
 export function shareTo(platform, { url, title }) {

    // Current news slug निकालो
    let slug = '';

    try {
        const currentUrl = new URL(url, window.location.origin);
        slug = currentUrl.searchParams.get('slug') || '';
    } catch (err) {
        console.error('Could not read news slug:', err);
    }

    /*
     * API_BASE_URL:
     * http://localhost:5000/api
     *
     * Backend root:
     * http://localhost:5000
     */
    export const API_BASE_URL =
    "https://janamat-yug-63q8.onrender.com/api";

    /*
     * IMPORTANT:
     * Social media crawlers will visit this URL first.
     * Backend will add og:image, og:title, etc.
     * and then redirect user to the actual news page.
     */
    const shareUrl = slug
        ? `${BACKEND_URL}/share/news/${encodeURIComponent(slug)}`
        : url;

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);

    const links = {

        facebook:
            `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,

        twitter:
            `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,

        whatsapp:
            `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,

        telegram:
            `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
    };

    // Copy link
    if (platform === 'copy') {

        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                showToast('लिंक कॉपी हो गया', 'success');
            })
            .catch(() => {
                showToast('लिंक कॉपी नहीं हो सका', 'error');
            });

        return;
    }

    const target = links[platform];

    if (target) {
        window.open(
            target,
            '_blank',
            'noopener,noreferrer,width=600,height=500'
        );
    }
}
/**
 * Wires up all [data-share] buttons within a container.
 */
export function initShareMenu(container, { url, title }) {
  if (!container) return;
  container.querySelectorAll('[data-share]').forEach((btn) => {
    btn.addEventListener('click', () => shareTo(btn.dataset.share, { url, title }));
  });
}

/* ------------------------------------------------------------------ */
/* Reading time / views helpers (pure functions, used by article.js)   */
/* ------------------------------------------------------------------ */

export function calcReadingTime(text = '') {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} मिनट पढ़ें`;
}

export function formatViews(count = 0) {
  if (count >= 100000) return `${(count / 100000).toFixed(1)} लाख`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)} हज़ार`;
  return `${count}`;
}
