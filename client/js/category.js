/**
 * category.js
 * ------------------------------------------------------------------
 * SINGLE RESPONSIBILITY: category page — filter, search, sort,
 * pagination, infinite scroll.
 * ------------------------------------------------------------------
 */

import { getNewsByCategory, getPaginatedNews, searchNews, CATEGORIES } from './newsApi.js';
import { toggleBookmark, isBookmarked, formatViews } from './interaction.js';

const PAGE_LIMIT = 9;

const state = {
  category: null,
  keyword: '',
  sort: 'newest',
  page: 1,
  totalPages: 1,
  mode: 'click', /* 'click' pagination or 'scroll' infinite scroll */
  loading: false,
  allLoadedItems: []
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
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
    image: item.coverImage || item.thumbnail || fallbackImg(item.title),
    category: item.category?.name || item.category || 'समाचार',
    date: item.createdAt || item.publishedAt || item.date,
    views: item.views || 0
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

function sortItems(items) {
  const copy = [...items];
  switch (state.sort) {
    case 'oldest':
      return copy.sort((a, b) => new Date(a.createdAt || a.date || 0) - new Date(b.createdAt || b.date || 0));
    case 'popular':
      return copy.sort((a, b) => (b.views || 0) - (a.views || 0));
    case 'newest':
    default:
      return copy.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
  }
}

/* ------------------------------------------------------------------ */
/* Data fetch (routes to correct endpoint based on active filters)     */
/* ------------------------------------------------------------------ */

async function fetchItems() {
  if (state.keyword) {
    const res = await searchNews(state.keyword);
    const items = Array.isArray(res)
? res
: (res.news || res.data || []);
    return { items, totalPages: 1 };
  }
  if (state.category) {
     const res = await getNewsByCategory(state.category);

const items = Array.isArray(res)
    ? res
    : (res.news || res.data || []);
    return { items, totalPages: 1 };
  }
  const res = await getPaginatedNews(state.page, PAGE_LIMIT);
  const items = res.data || res.news || res.items || [];
  return { items, totalPages: res.totalPages || res.pages || 1 };
}

/* ------------------------------------------------------------------ */
/* Render                                                              */
/* ------------------------------------------------------------------ */

function skeletonCards(container, count = 6) {
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

async function loadAndRender({ append = false } = {}) {
  const grid = document.getElementById('categoryGrid');
  if (!grid || state.loading) return;
  state.loading = true;

  if (!append) skeletonCards(grid);
  else document.getElementById('scrollLoader')?.classList.remove('d-none');

  try {
    const { items, totalPages } = await fetchItems();
    state.totalPages = totalPages;
    const sorted = sortItems(items);

    if (!sorted.length && !append) {
      grid.innerHTML = `<div class="col-12"><div class="jy-empty-state"><i class="fa-solid fa-magnifying-glass"></i>कोई समाचार नहीं मिला</div></div>`;
    } else {
      const html = sorted.map(cardHTML).join('');
      grid.innerHTML = append ? grid.innerHTML + html : html;
      wireBookmarkButtons(grid);
    }

    updateHeading(sorted.length, items);
    if (state.mode === 'click') {
      renderPagination();
    } else {
      document.getElementById('newsPagination').innerHTML = '';
    }
  } catch (err) {
    grid.innerHTML = `<div class="col-12"><div class="jy-empty-state"><i class="fa-solid fa-triangle-exclamation"></i>${err.message}</div></div>`;
  } finally {
    state.loading = false;
    document.getElementById('scrollLoader')?.classList.add('d-none');
  }
}

function updateHeading(count, rawItems) {
  const heading = document.getElementById('categoryHeading');
  if (!heading) return;
  if (state.keyword) {
    heading.textContent = `"${state.keyword}" के लिए खोज परिणाम`;
  } else if (state.category) {
    const cat = CATEGORIES.find((c) => c.id === state.category);
    heading.textContent = cat ? cat.name : 'श्रेणी';
  } else {
    heading.textContent = 'सभी समाचार';
  }
}

function renderPagination() {
  const nav = document.getElementById('newsPagination');
  if (!nav) return;
  if (state.category || state.keyword || state.totalPages <= 1) {
    nav.innerHTML = '';
    return;
  }
  let html = '';
  html += `<li class="page-item ${state.page === 1 ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${state.page - 1}">‹</a></li>`;
  for (let i = 1; i <= state.totalPages; i++) {
    html += `<li class="page-item ${i === state.page ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
  }
  html += `<li class="page-item ${state.page === state.totalPages ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${state.page + 1}">›</a></li>`;
  nav.innerHTML = html;

  nav.querySelectorAll('.page-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = Number(link.dataset.page);
      if (!target || target < 1 || target > state.totalPages || target === state.page) return;
      state.page = target;
      loadAndRender();
      document.getElementById('categoryGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ------------------------------------------------------------------ */
/* Filters UI                                                          */
/* ------------------------------------------------------------------ */

function renderCategoryChips() {
  const bar = document.getElementById('categoryChips');
  if (!bar) return;
  const chips = [{ id: '', name: 'सभी' }, ...CATEGORIES];
  bar.innerHTML = chips.map((c) => `
    <button type="button" class="jy-filter-chip ${state.category === c.id || (!state.category && c.id === '') ? 'active' : ''}" data-cat="${c.id}">${c.name}</button>
  `).join('');

  bar.querySelectorAll('.jy-filter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.category = chip.dataset.cat || null;
      state.keyword = '';
      state.page = 1;
      const searchInput = document.getElementById('categorySearchInput');
      if (searchInput) searchInput.value = '';
      bar.querySelectorAll('.jy-filter-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      loadAndRender();
    });
  });
}

function initSearchAndSort() {
  const searchForm = document.getElementById('categorySearchForm');
  const searchInput = document.getElementById('categorySearchInput');
  const sortSelect = document.getElementById('sortSelect');

  if (state.keyword && searchInput) searchInput.value = state.keyword;
  if (sortSelect) sortSelect.value = state.sort;

  searchForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    state.keyword = searchInput.value.trim();
    state.category = null;
    state.page = 1;
    document.getElementById('categoryChips')?.querySelectorAll('.jy-filter-chip').forEach((c) => c.classList.toggle('active', c.dataset.cat === ''));
    loadAndRender();
  });

  sortSelect?.addEventListener('change', () => {
    state.sort = sortSelect.value;
    loadAndRender();
  });

  document.getElementById('viewModeToggle')?.addEventListener('change', (e) => {
    state.mode = e.target.checked ? 'scroll' : 'click';
    state.page = 1;
    loadAndRender();
  });
}

/* ------------------------------------------------------------------ */
/* Infinite scroll                                                     */
/* ------------------------------------------------------------------ */

function initInfiniteScroll() {
  window.addEventListener('scroll', () => {
    if (state.mode !== 'scroll' || state.loading) return;
    if (state.category || state.keyword) return; /* only paginated feed supports infinite scroll */
    const scrolledToBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
    if (scrolledToBottom && state.page < state.totalPages) {
      state.page += 1;
      loadAndRender({ append: true });
    }
  });
}

/* ------------------------------------------------------------------ */
/* Init                                                                 */
/* ------------------------------------------------------------------ */

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('categoryGrid');
  if (!grid) return; /* not the category page */

  const params = new URLSearchParams(window.location.search);
  state.category = params.get('cat') || null;
  state.keyword = params.get('search') || '';

  renderCategoryChips();
  initSearchAndSort();
  initInfiniteScroll();
  loadAndRender();
});
