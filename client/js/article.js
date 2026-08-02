/**
 * article.js
 * ------------------------------------------------------------------
 * SINGLE RESPONSIBILITY: single news (article) page —
 * article details, related news, comments, reading time, views.
 * Like / rate / bookmark / share are delegated to interaction.js.
 * ------------------------------------------------------------------
 */

import { getNewsBySlug, getRelatedNews, getComments, postComment } from './newsApi.js';
import {
  isBookmarked, toggleBookmark, showToast,
  handleLike, initRatingWidget, initShareMenu,
  calcReadingTime, formatViews
} from './interaction.js';
import { isLoggedIn, getCurrentUser } from './auth.js';

let currentArticle = null;

function fallbackImg(seed = 'news') {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/900/500`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch (_) {
    return '';
  }
}

function normalize(item) {
  return {
    id: item._id || item.id,
    slug: item.slug || item._id || item.id,
    title: item.title || 'शीर्षक उपलब्ध नहीं',
    excerpt: item.summary || item.excerpt || '',
    content: item.content || item.body || '',
  image:
item.coverImage
? (
item.coverImage.startsWith("http")
? item.coverImage
: `http://localhost:5000${item.coverImage}`
)
: fallbackImg(item.title),
    category: item.category?.name || item.category || 'समाचार',
    date: item.createdAt || item.publishedAt || item.date,
    views: item.views || 0,
    likes: item.likes || 0,
    rating:
item.averageRating ||
item.avgRating ||
item.rating ||
0,
     author:
item.author?.fullName ||
item.author?.name ||
item.author ||
"जनमत युग",
  };
}

/* ------------------------------------------------------------------ */
/* Article rendering                                                   */
/* ------------------------------------------------------------------ */

async function loadArticle(slug) {
  const wrap = document.getElementById('articleWrap');
  try {
    const raw = await getNewsBySlug(slug);
    const n = normalize(raw.news || raw.data || raw);
    currentArticle = n;

    document.title = `${n.title} | जनमत युग`;
    document.getElementById('articleCategory').textContent = n.category;
    document.getElementById('articleTitle').textContent = n.title;
    document.getElementById('articleAuthor').textContent = n.author;
    document.getElementById('articleDate').textContent = formatDate(n.date);
    document.getElementById('articleViews').textContent = formatViews(n.views);
    document.getElementById('articleReadingTime').textContent = calcReadingTime(n.content);

    const coverImg = document.getElementById('articleCover');
    coverImg.src = n.image;
    coverImg.alt = n.title;
    coverImg.onerror = () => { coverImg.src = fallbackImg(n.slug); };

    document.getElementById('articleBody').innerHTML = n.content
      .split(/\n{1,2}/)
      .filter((p) => p.trim())
      .map((p) => `<p>${p}</p>`)
      .join('') || `<p>${n.excerpt}</p>`;

    wireActionBar(n);
    initRatingWidget(document.getElementById('ratingWidget'), n.id, Math.round(n.rating));
    initShareMenu(document.getElementById('shareMenu'), { url: window.location.href, title: n.title });

    loadRelated(n.id);
    loadComments(n.id);
  } catch (err) {
    wrap.innerHTML = `<div class="jy-empty-state"><i class="fa-solid fa-triangle-exclamation"></i>${err.message || 'समाचार लोड नहीं हो सका'}</div>`;
  }
}

function wireActionBar(n) {
  const likeBtn = document.getElementById('likeBtn');
  const likeCount = document.getElementById('likeCount');
  likeCount.textContent = n.likes;
  likeBtn.addEventListener('click', async () => {
    const result = await handleLike(n.id);
    if (result) {
      likeBtn.classList.add('active');
      likeCount.textContent = Number(likeCount.textContent) + 1;
    }
  });

  const bookmarkBtn = document.getElementById('bookmarkBtn');
  const paintBookmark = () => {
    const saved = isBookmarked(n.id);
    bookmarkBtn.classList.toggle('active', saved);
    bookmarkBtn.querySelector('i').className = `fa-${saved ? 'solid' : 'regular'} fa-bookmark`;
  };
  paintBookmark();
  bookmarkBtn.addEventListener('click', async () => {
    await toggleBookmark({ id: n.id, title: n.title, slug: n.slug, image: n.image, category: n.category });
    paintBookmark();
  });
}

/* ------------------------------------------------------------------ */
/* Related news                                                        */
/* ------------------------------------------------------------------ */

async function loadRelated(id) {
  const el = document.getElementById('relatedGrid');
  if (!el) return;
  try {
    const res = await getRelatedNews(id);
    const items =
(
Array.isArray(res)
? res
: res.news || res.data || []
)
.map(normalize)
.slice(0,4);
    el.innerHTML = items.length ? items.map((n) => `
      <div class="col-md-3 col-sm-6">
        <div class="jy-card">
          <a href="news.html?slug=${encodeURIComponent(n.slug)}">
            <img src="${n.image}" alt="${n.title}" class="jy-card-img" loading="lazy" onerror="this.src='${fallbackImg(n.slug)}'">
          </a>
          <div class="jy-card-body">
            <h3 style="font-size:0.92rem;"><a href="news.html?slug=${encodeURIComponent(n.slug)}">${n.title}</a></h3>
          </div>
        </div>
      </div>
    `).join('') : '<p class="text-muted">कोई संबंधित समाचार नहीं मिला</p>';
  } catch (_) {
    el.innerHTML = '<p class="text-muted">संबंधित समाचार लोड नहीं हो सका</p>';
  }
}

/* ------------------------------------------------------------------ */
/* Comments                                                             */
/* ------------------------------------------------------------------ */

function commentInitial(name = 'अ') {
  return name.trim().charAt(0).toUpperCase() || 'अ';
}

function commentHTML(c) {
  const name = c.user?.fullName || c.user?.username || c.user?.name || c.name || 'पाठक';
  const date = c.createdAt ? formatDate(c.createdAt) : '';
  return `
    <div class="jy-comment">
      <div class="jy-comment-avatar">${commentInitial(name)}</div>
      <div>
        <span class="jy-comment-name">${name}</span><span class="jy-comment-date">${date}</span>
        <p class="jy-comment-text">${c.comment || c.text || ''}</p>
      </div>
    </div>
  `;
}

async function loadComments(id) {
  const list = document.getElementById('commentsList');
  const countEl = document.getElementById('commentCount');
  if (!list) return;
  try {
    const res = await getComments(id);
    const items = Array.isArray(res) ? res : res.data || res.comments || [];
    countEl.textContent = items.length;
    list.innerHTML = items.length ? items.map(commentHTML).join('') : '<p class="text-muted">अभी तक कोई टिप्पणी नहीं। सबसे पहले टिप्पणी करें।</p>';
  } catch (_) {
    list.innerHTML = '<p class="text-muted">टिप्पणियाँ लोड नहीं हो सकीं</p>';
  }
}

function initCommentForm() {
  const form = document.getElementById('commentForm');
  if (!form) return;

  const loginPrompt = document.getElementById('commentLoginPrompt');
  if (!isLoggedIn()) {
    form.classList.add('d-none');
    loginPrompt?.classList.remove('d-none');
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentArticle) return;
    const textarea = document.getElementById('commentText');
    const text = textarea.value.trim();
    if (!text) return;

    const submitBtn = document.getElementById('commentSubmitBtn');
    submitBtn.disabled = true;
    try {
      await postComment(currentArticle.id, text);
      showToast('आपकी टिप्पणी पोस्ट कर दी गई', 'success');
      textarea.value = '';
      loadComments(currentArticle.id);
    } catch (err) {
      showToast(err.message || 'टिप्पणी पोस्ट नहीं हो सकी', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

/* ------------------------------------------------------------------ */
/* Init                                                                 */
/* ------------------------------------------------------------------ */

document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.getElementById('articleWrap');
  if (!wrap) return; /* not the article page */

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug) {
    wrap.innerHTML = `<div class="jy-empty-state"><i class="fa-solid fa-triangle-exclamation"></i>समाचार नहीं मिला</div>`;
    return;
  }

  initCommentForm();
  loadArticle(slug);
});

if(item.video){

document.getElementById("articleBody").insertAdjacentHTML(

"afterbegin",

`

<div class="ratio ratio-16x9 mb-4">

<iframe
src="${item.video.replace("watch?v=","embed/")}"
allowfullscreen>

</iframe>

</div>

`

);

}