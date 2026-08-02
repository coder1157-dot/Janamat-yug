/* ==========================================================================
   dashboard.js — GET /api/admin/dashboard and render stat cards, recent
   activity, and quick snapshots. Adapts to whichever fields the backend
   actually returns (falls back gracefully if a field is missing).
   ========================================================================== */

(function () {
  if (!Auth.guardPage()) return;

  const STAT_ICONS = [
    { key: 'totalNews', label: 'Total Articles', icon: 'bi-newspaper', tone: 'tone-gold' },
    { key: 'totalCategories', label: 'Categories', icon: 'bi-tags', tone: 'tone-info' },
    { key: 'totalUsers', label: 'Registered Users', icon: 'bi-people', tone: 'tone-success' },
    { key: 'totalComments', label: 'Comments', icon: 'bi-chat-square-text', tone: 'tone-danger' },
    { key: 'totalAds', label: 'Active Ads', icon: 'bi-megaphone', tone: 'tone-gold' },
    { key: 'totalViews', label: 'Total Views', icon: 'bi-eye', tone: 'tone-info' },
  ];

  function pick(obj, ...keys) {
    for (const k of keys) {
      if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
    }
    return undefined;
  }

  function renderStats(data) {
    console.log(document.getElementById("statGrid"));
    const grid = document.getElementById('statGrid');
    if (!grid) return;
    const values = {
      totalNews: pick(data, 'totalNews', 'newsCount', 'articles'),
      totalCategories: pick(data, 'totalCategories', 'categoriesCount', 'categories'),
      totalUsers: pick(data, 'totalUsers', 'usersCount', 'users'),
      totalComments: pick(data, 'totalComments', 'commentsCount', 'comments'),
      totalAds: pick(data, 'totalAds', 'adsCount', 'ads'),
      totalViews: pick(data, 'totalViews', 'viewsCount', 'views'),
    };

    grid.innerHTML = STAT_ICONS.map((s) => {
        console.log(grid.innerHTML);
      const val = values[s.key];
      if (val === undefined) return '';
      return `
        <div class="col-6 col-lg-4 col-xxl-2">
          <div class="stat-card h-100">
            <div class="stat-icon ${s.tone}"><i class="bi ${s.icon}"></i></div>
            <div>
              <div class="stat-num">${Number(val).toLocaleString()}</div>
              <div class="stat-label">${s.label}</div>
            </div>
          </div>
        </div>`;
    }).join('') || `<div class="col-12"><div class="empty-state"><i class="bi bi-bar-chart"></i><h3>No summary data yet</h3><p>The dashboard endpoint didn't return any recognizable stats.</p></div></div>`;
  }

  function renderRecentNews(list) {
    const tbody = document.getElementById('recentNewsBody');
    if (!tbody) return;
    if (!Array.isArray(list) || !list.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-soft py-4">No recent articles.</td></tr>`;
      return;
    }
    tbody.innerHTML = list.slice(0, 6).map((item) => `
      <tr>
        <td data-label="Article">
          <div class="d-flex align-items-center gap-2">
            <img class="row-thumb" src="${ item.coverImage || item.thumbnail || 'assets/placeholder-thumb.svg'}" alt="">
            <div>
              <div class="cell-title">${Common.escapeHtml(item.title || 'Untitled')}</div>
              <div class="cell-meta">${Common.escapeHtml(item.category?.name || item.category || '')}</div>
            </div>
          </div>
        </td>
        <td data-label="Author">${Common.escapeHtml(item.author?.name || item.author || 'Admin')}</td>
        <td data-label="Date">${Common.formatDate(item.createdAt || item.publishedAt)}</td>
        <td data-label="Status"><span class="pill ${(item.status || 'published').toLowerCase()}">${item.status || 'Published'}</span></td>
      </tr>
    `).join('');
  }

   async function load() {

    Common.showLoader("Loading dashboard...");

    try{

        const dashboard=await Api.dashboard.summary();

        const stats = dashboard.dashboard || dashboard;
console.log(stats);

        console.log("Dashboard Data",dashboard);

         renderStats({

    totalNews: stats.totalNews || 0,

    totalCategories: stats.totalCategories || 0,

    totalUsers: stats.totalUsers || 0,

    totalComments: stats.totalComments || 0,

    totalAds: stats.totalAds || 0,

    totalViews: stats.totalViews || 0

});
 
renderRecentNews(

stats.recentNews ||

stats.latestNews ||

[]

);
    }

    catch(err){

        console.error(err);

        Common.toast(err.message,"error");

    }

    finally{

        Common.hideLoader();

    }

}

  document.addEventListener('DOMContentLoaded', load);
})();