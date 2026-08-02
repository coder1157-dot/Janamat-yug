/**
 * news.js
 * ------------------------------------------------------------------
 * SINGLE RESPONSIBILITY: render the homepage —
 * hero, ticker, latest, trending, editor's choice, gallery,
 * video news, pagination, sidebar, newsletter.
 * ------------------------------------------------------------------
 */

import {
  getLatestNews,
  getTrendingNews,
  getFeaturedNews,
  getPaginatedNews,
  CATEGORIES,
  getNewsletterSubscribeRequest
} from './newsApi.js';
import { toggleBookmark, isBookmarked, showToast, formatViews } from './interaction.js';

const PAGE_LIMIT = 9;
let currentPage = 1;

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function fallbackImg(seed = 'news') {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/640/400`;
}

function normalize(item) {
  return {
    id: item._id || item.id,
    slug: item.slug || item._id || item.id,
    title: item.title || 'शीर्षक उपलब्ध नहीं',
    excerpt: item.summary || item.excerpt || (item.content ? item.content.slice(0, 110) + '…' : ''),
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
    author: item.author?.name || item.author || 'डेस्क'
  };
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (_) {
    return '';
  }
}

function skeletonCards(container, count = 6) {
  if (!container) return;
  container.innerHTML = Array.from({ length: count }).map(() => `
    <div class="col-md-4 col-sm-6">
      <div class="jy-card">
        <div class="jy-skel" style="aspect-ratio:16/10;"></div>
        <div class="jy-card-body">
          <div class="jy-skel" style="height:14px;width:70%;"></div>
          <div class="jy-skel" style="height:10px;width:90%;"></div>
        </div>
      </div>
    </div>
  `).join('');
}

/* ------------------------------------------------------------------ */
/* Card template                                                       */
/* ------------------------------------------------------------------ */

function cardHTML(raw) {
  const n = normalize(raw);
  const saved = isBookmarked(n.id);
  return `
    <div class="col-md-4 col-sm-6">
      <div class="jy-card">
        <a href="news.html?slug=${encodeURIComponent(n.slug)}">
          <img src="${n.image}" alt="${n.title}" class="jy-card-img" loading="lazy" onerror="this.src='${fallbackImg(n.slug)}'">
        </a>
        <div class="jy-card-body">
          <span class="badge-cat align-self-start">${n.category}</span>
          <h3><a href="news.html?slug=${encodeURIComponent(n.slug)}">${n.title}</a></h3>
          <p class="jy-card-excerpt">${n.excerpt}</p>
          <div class="jy-card-meta">
            <span><i class="fa-regular fa-calendar"></i> ${formatDate(n.date)}</span>
            <span><i class="fa-regular fa-eye"></i> ${formatViews(n.views)}</span>
            <button type="button" class="btn btn-sm ms-auto jy-card-bookmark" data-id="${n.id}" aria-label="बुकमार्क">
              <i class="fa-${saved ? 'solid' : 'regular'} fa-bookmark"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function wireBookmarkButtons(container) {
  container?.querySelectorAll('.jy-card-bookmark').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const card = btn.closest('.jy-card');
      const title = card.querySelector('h3 a')?.textContent || '';
      const image = card.querySelector('img')?.src || '';
      const link = card.querySelector('h3 a')?.getAttribute('href') || '';
      const slug = new URLSearchParams(link.split('?')[1]).get('slug');
      const added = await toggleBookmark({ id: btn.dataset.id, title, slug, image, category: '' });
      const icon = btn.querySelector('i');
      icon.className = `fa-${added ? 'solid' : 'regular'} fa-bookmark`;
    });
  });
}

/* ------------------------------------------------------------------ */
/* Hero section                                                        */
/* ------------------------------------------------------------------ */

async function renderHero() {
  const mainEl = document.getElementById('heroMain');
  const sideEl = document.getElementById('heroSide');
  if (!mainEl) return;

  try {
    const featured = await getFeaturedNews();
    const list = (Array.isArray(featured) ? featured : (featured.news || featured.data || [])).map(normalize);
    if (!list.length) throw new Error('empty');

    const [main, ...rest] = list;
    mainEl.style.backgroundImage = `url('${main.image}')`;
    mainEl.innerHTML = `
      <div class="jy-hero-body">
        <span class="badge-cat">${main.category}</span>
        <h1><a href="news.html?slug=${encodeURIComponent(main.slug)}">${main.title}</a></h1>
        <div class="jy-hero-meta"><i class="fa-regular fa-calendar"></i> ${formatDate(main.date)} &nbsp; <i class="fa-regular fa-eye"></i> ${formatViews(main.views)}</div>
      </div>
    `;

    if (sideEl) {
      sideEl.innerHTML = rest.slice(0, 4).map((n) => `
        <div class="jy-hero-side-item">
          <img src="${n.image}" alt="${n.title}" loading="lazy">
          <div>
            <span class="badge-cat" style="font-size:0.6rem;">${n.category}</span>
            <h6><a href="news.html?slug=${encodeURIComponent(n.slug)}">${n.title}</a></h6>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    mainEl.innerHTML = `<div class="jy-hero-body"><p class="mb-0">विशेष समाचार लोड नहीं हो सका</p></div>`;
  }
}

/* ------------------------------------------------------------------ */
/* Breaking news ticker                                                */
/* ------------------------------------------------------------------ */

async function renderTicker() {
  const list = document.getElementById('tickerList');
  if (!list) return;
  try {
    const latest = await getLatestNews();
    const items = (Array.isArray(latest)
    ? latest
    : (latest.news || latest.data || []))
    .slice(0, 8)
    .map(normalize);
    if (!items.length) throw new Error('empty');
    const html = items.map((n) => `<li><a href="news.html?slug=${encodeURIComponent(n.slug)}">${n.title}</a></li>`).join('');
    list.innerHTML = html + html; /* duplicate for seamless loop */
  } catch (err) {
    list.innerHTML = '<li>ताज़ा समाचार लोड नहीं हो सका</li>';
  }
}

/* ------------------------------------------------------------------ */
/* Latest news + pagination                                            */
/* ------------------------------------------------------------------ */

async function renderLatestPage(page = 1) {
  const grid = document.getElementById('latestGrid');
  if (!grid) return;
  skeletonCards(grid);
  try {
    const res = await getPaginatedNews(page, PAGE_LIMIT);
    const items = res.data || res.news || res.items || [];
    if (!items.length) {
      grid.innerHTML = `<div class="col-12"><div class="jy-empty-state"><i class="fa-regular fa-newspaper"></i>कोई समाचार उपलब्ध नहीं</div></div>`;
      return;
    }
    grid.innerHTML = items.map(cardHTML).join('');
    wireBookmarkButtons(grid);
    renderPagination(res.totalPages || res.pages || 1, page);
  } catch (err) {
    grid.innerHTML = `<div class="col-12"><div class="jy-empty-state"><i class="fa-solid fa-triangle-exclamation"></i>${err.message}</div></div>`;
  }
}

function renderPagination(totalPages, page) {

    const nav = document.getElementById("newsPagination");

    if (!nav) return;

    let html = "";

    // Previous
    html += `
        <li class="page-item ${page === 1 ? "disabled" : ""}">
            <a href="#" class="page-link" data-page="${page-1}">
                Previous
            </a>
        </li>
    `;

    let start = Math.max(1,page-2);
    let end = Math.min(totalPages,page+2);

    if(page<=3){
        end=Math.min(5,totalPages);
    }

    if(page>=totalPages-2){
        start=Math.max(1,totalPages-4);
    }

    for(let i=start;i<=end;i++){

        html+=`
        <li class="page-item ${page===i?"active":""}">
            <a href="#" class="page-link" data-page="${i}">
                ${i}
            </a>
        </li>
        `;
    }

    // Next
    html+=`
        <li class="page-item ${page===totalPages?"disabled":""}">
            <a href="#" class="page-link" data-page="${page+1}">
                Next
            </a>
        </li>
    `;

    nav.innerHTML=html;

    nav.querySelectorAll(".page-link").forEach(btn=>{

        btn.onclick=(e)=>{

            e.preventDefault();

            const target=Number(btn.dataset.page);

            if(
                target<1 ||
                target>totalPages ||
                target===page
            ) return;

            currentPage=target;

            renderLatestPage(currentPage);

            document.getElementById("latestGrid")
            ?.scrollIntoView({
                behavior:"smooth",
                block:"start"
            });

        };

    });

}
/* ------------------------------------------------------------------ */
/* Trending (sidebar ranked list)                                      */
/* ------------------------------------------------------------------ */

async function renderTrending() {
  const el = document.getElementById('trendingList');
  if (!el) return;
  try {
    const trending = await getTrendingNews();
   const items = (Array.isArray(trending) ? trending : (trending.news || trending.data || [])).slice(0, 5).map(normalize);
    el.innerHTML = items.map((n, i) => `
      <div class="jy-list-item">
        <span class="jy-list-rank">${String(i + 1).padStart(2, '0')}</span>
        <img src="${n.image}" alt="${n.title}" loading="lazy">
        <div>
          <h6><a href="news.html?slug=${encodeURIComponent(n.slug)}">${n.title}</a></h6>
          <span class="jy-card-meta"><i class="fa-regular fa-eye"></i> ${formatViews(n.views)}</span>
        </div>
      </div>
    `).join('') || '<p class="text-muted mb-0">कोई ट्रेंडिंग समाचार नहीं</p>';
  } catch (err) {
    el.innerHTML = '<p class="text-muted mb-0">लोड नहीं हो सका</p>';
  }
}

/* ------------------------------------------------------------------ */
/* Editor's choice                                                     */
/* ------------------------------------------------------------------ */

async function renderEditorsChoice() {
  const grid = document.getElementById('editorsChoiceGrid');
  if (!grid) return;
  skeletonCards(grid, 3);
  try {
    const featured = await getFeaturedNews();
    const items = (Array.isArray(featured)
    ? featured
    : (featured.news || featured.data || []))
    .slice(0,3);
    grid.innerHTML = items.length
      ? items.map(cardHTML).join('')
      : `<div class="col-12"><div class="jy-empty-state"><i class="fa-regular fa-star"></i>कोई चयनित समाचार नहीं</div></div>`;
    wireBookmarkButtons(grid);
  } catch (err) {
    grid.innerHTML = `<div class="col-12"><div class="jy-empty-state"><i class="fa-solid fa-triangle-exclamation"></i>लोड नहीं हो सका</div></div>`;
  }
}

/* ------------------------------------------------------------------ */
/* Photo gallery                                                       */
/* ------------------------------------------------------------------ */

async function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  try {
    const latest = await getLatestNews();
    const items = (Array.isArray(latest) ? latest : (latest.news || latest.data || [])).slice(0, 6).map(normalize);
    grid.innerHTML = items.map((n) => `
      <div class="col-6 col-md-4 col-lg-2">
         <a href="gallery.html?slug=${encodeURIComponent(n.slug)}" class="jy-gallery-item d-block">
          <img src="${n.image}" alt="${n.title}" loading="lazy">
          <span class="jy-gallery-cap">${n.title}</span>
        </a>
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = '<div class="col-12 text-muted">गैलरी लोड नहीं हो सकी</div>';
  }
}

/* ------------------------------------------------------------------ */
/* Video news (uses latest as a stand-in data source with video flag)  */
/* ------------------------------------------------------------------ */

async function renderVideoNews() {
  const grid = document.getElementById('videoGrid');
  if (!grid) return;
  try {
    const latest = await getLatestNews();
    const items = (Array.isArray(latest) ? latest : (latest.news || latest.data || []))
      .filter((n) => n.videoUrl || n.video)
      .slice(0, 3)
      .map(normalize);

    if (!items.length) {
      grid.innerHTML = `<div class="col-12"><div class="jy-empty-state"><i class="fa-solid fa-video"></i>कोई वीडियो समाचार उपलब्ध नहीं</div></div>`;
      return;
    }
    grid.innerHTML = items.map((n) => `
      <div class="col-md-4">
        <a href="video.html?slug=${encodeURIComponent(n.slug)}" class="jy-video-card d-block">
          <img src="${n.image}" alt="${n.title}" loading="lazy">
          <span class="jy-video-play"><i class="fa-solid fa-play"></i></span>
        </a>
         <h6 class="mt-2">
    <a href="video.html?slug=${encodeURIComponent(n.slug)}">
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = `<div class="col-12"><div class="jy-empty-state"><i class="fa-solid fa-triangle-exclamation"></i>लोड नहीं हो सका</div></div>`;
  }
}

/* ------------------------------------------------------------------ */
/* Sidebar: category tags + newsletter                                 */
/* ------------------------------------------------------------------ */

function renderCategoryTags() {
  const el = document.getElementById('categoryTagList');
  if (!el) return;
  el.innerHTML = CATEGORIES.map((c) => `<a href="category.html?cat=${c.id}" class="jy-tag">${c.name}</a>`).join('');
}

function initNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('newsletterEmail');
    const email = input.value.trim();
    if (!email) return;
    try {
      await getNewsletterSubscribeRequest(email);
      showToast('सदस्यता सफल रही! धन्यवाद।', 'success');
      form.reset();
    } catch (err) {
      showToast(err.message || 'सदस्यता विफल रही', 'error');
    }
  });
}

/* ------------------------------------------------------------------ */
/* Init                                                                 */
/* ------------------------------------------------------------------ */

document.addEventListener('DOMContentLoaded', () => {
  /* Each render function guards on its own target element, so it's safe
     to call all of them on any page — only the ones with a matching
     element in the DOM will actually fetch and render. */
  renderHero();
  renderTicker();
  renderLatestPage(currentPage);
  renderTrending();
  renderEditorsChoice();
  renderGallery();
  renderVideoNews();
  renderCategoryTags();
  initNewsletterForm();
});
