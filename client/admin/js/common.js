/* ==========================================================================
   common.js — shared UI shell (sidebar/topbar), toasts, loader, confirm modal,
   and small utilities used across every admin page.
   ========================================================================== */

const NAV_GROUPS = [
  {
    label: 'Editorial',
    items: [
      { href: 'dashboard.html', icon: 'bi-speedometer2', label: 'Dashboard' },
      { href: 'add-news.html', icon: 'bi-file-earmark-plus', label: 'Add News' },
      { href: 'manage-news.html', icon: 'bi-newspaper', label: 'Manage News' },
      { href: 'categories.html', icon: 'bi-tags', label: 'Categories' },
    ],
  },
  {
    label: 'Audience',
    items: [
      { href: 'users.html', icon: 'bi-people', label: 'Users' },
      { href: 'comments.html', icon: 'bi-chat-square-text', label: 'Comments' },
    ],
  },
  {
    label: 'Monetization',
    items: [
      { href: 'ads.html', icon: 'bi-megaphone', label: 'Ads' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: 'settings.html', icon: 'bi-gear', label: 'Settings' },
      { href: 'profile.html', icon: 'bi-person-circle', label: 'Profile' },
    ],
  },
];

const Common = (() => {
  function currentPage() {
    const p = location.pathname.split('/').pop();
    return p || 'dashboard.html';
  }

  function initials(name) {
    if (!name) return 'A';
    return name.trim().split(/\s+/).slice(0, 2).map((s) => s[0].toUpperCase()).join('');
  }

  function editionLine() {
    const now = new Date();
    const dateStr = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return `Edition · ${dateStr}`;
  }

  function buildSidebar(admin) {
    const groups = NAV_GROUPS.map((group) => {
      const links = group.items.map((item) => {
        const active = currentPage() === item.href ? 'active' : '';
        return `
          <a class="nav-link ${active}" href="${item.href}">
            <i class="bi ${item.icon}"></i><span>${item.label}</span>
          </a>`;
      }).join('');
      return `
        <div class="sidebar-section-label"><span>${group.label}</span></div>
        ${links}`;
    }).join('');

    return `
      <div class="sidebar-brand">
        <div class="mark">TD</div>
        <div class="brand-text">The Desk<small>Newsroom CMS</small></div>
      </div>
      <nav class="sidebar-nav">${groups}</nav>
      <div class="sidebar-foot">v1.0 · Admin Panel</div>
    `;
  }

  function buildTopbar(admin) {
    const name = admin?.name || admin?.fullName || admin?.username || 'Admin';
    return `
      <button class="topbar-toggle" id="sidebarToggle" aria-label="Toggle navigation">
        <i class="bi bi-list"></i>
      </button>
      <div class="topbar-search">
        <i class="bi bi-search"></i>
        <input type="search" id="globalSearch" placeholder="Search articles, users, categories…" autocomplete="off">
      </div>
      <div class="topbar-edition">${editionLine()}</div>
      <div class="topbar-actions">
        <a class="topbar-icon-btn" href="comments.html" title="Comments">
          <i class="bi bi-bell"></i><span class="dot"></span>
        </a>
        <div class="topbar-profile" id="topbarProfile" data-bs-toggle="dropdown" aria-expanded="false" role="button">
          <div class="avatar">${initials(name)}</div>
          <div class="who">${name}<small>Administrator</small></div>
          <i class="bi bi-chevron-down text-soft" style="font-size:.7rem;"></i>
        </div>
        <ul class="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="topbarProfile">
          <li><a class="dropdown-item" href="profile.html"><i class="bi bi-person me-2"></i>My Profile</a></li>
          <li><a class="dropdown-item" href="settings.html"><i class="bi bi-gear me-2"></i>Settings</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" href="#" id="topbarLogout"><i class="bi bi-box-arrow-right me-2"></i>Log Out</a></li>
        </ul>
      </div>
    `;
  }

  function mountShell() {
    const shell = document.querySelector('.app-shell');
    if (!shell) return;
    const admin = Api.getStoredAdmin();

    const sidebarEl = document.getElementById('appSidebar');
    const topbarEl = document.getElementById('appTopbar');
    if (sidebarEl) sidebarEl.innerHTML = buildSidebar(admin);
    if (topbarEl) topbarEl.innerHTML = buildTopbar(admin);

    // Off-canvas backdrop (mobile)
    if (!document.querySelector('.sidebar-backdrop')) {
      const backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      shell.appendChild(backdrop);
      backdrop.addEventListener('click', () => shell.classList.remove('is-sidebar-open'));
    }

    const toggleBtn = document.getElementById('sidebarToggle');
    toggleBtn?.addEventListener('click', () => {
      if (window.innerWidth <= 991.98) {
        shell.classList.toggle('is-sidebar-open');
      } else {
        shell.classList.toggle('is-collapsed');
      }
    });

    document.getElementById('topbarLogout')?.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.logout();
    });

    const search = document.getElementById('globalSearch');
    search?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && search.value.trim()) {
        location.href = `manage-news.html?q=${encodeURIComponent(search.value.trim())}`;
      }
    });
  }

  // ---------------- Toasts ----------------
  function toastStack() {
    let stack = document.querySelector('.toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      document.body.appendChild(stack);
    }
    return stack;
  }

  const TOAST_ICON = {
    success: 'bi-check-circle-fill',
    error: 'bi-x-circle-fill',
    warning: 'bi-exclamation-triangle-fill',
    info: 'bi-info-circle-fill',
  };

  function toast(message, type = 'info', timeout = 4200) {
    const stack = toastStack();
    const el = document.createElement('div');
    el.className = `desk-toast ${type}`;
    el.innerHTML = `
      <i class="bi ${TOAST_ICON[type] || TOAST_ICON.info}"></i>
      <div>${message}</div>
      <button class="close-toast" aria-label="Dismiss"><i class="bi bi-x"></i></button>
    `;
    stack.appendChild(el);
    const remove = () => el.remove();
    el.querySelector('.close-toast').addEventListener('click', remove);
    if (timeout) setTimeout(remove, timeout);
  }

  // ---------------- Page loader ----------------
  function showLoader(label = 'Loading…') {
    let loader = document.querySelector('.page-loader');
    if (!loader) {
      loader = document.createElement('div');
      loader.className = 'page-loader';
      loader.innerHTML = `<div class="press-spinner"></div><div class="loader-label"></div>`;
      document.body.appendChild(loader);
    }
    loader.querySelector('.loader-label').textContent = label;
    loader.style.display = 'flex';
  }
  function hideLoader() {
    const loader = document.querySelector('.page-loader');
    if (loader) loader.style.display = 'none';
  }

  // ---------------- Confirm modal ----------------
  function ensureConfirmModal() {
    if (document.getElementById('confirmModal')) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="modal fade" id="confirmModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content desk-modal">
            <div class="modal-body text-center pt-4">
              <div class="confirm-icon-wrap"><i class="bi bi-trash3"></i></div>
              <h5 id="confirmModalTitle">Delete this item?</h5>
              <p class="text-soft mb-0" id="confirmModalBody">This action cannot be undone.</p>
            </div>
            <div class="modal-footer border-0 justify-content-center pb-4">
              <button type="button" class="btn btn-outline-desk px-4" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-danger px-4" id="confirmModalAction">Delete</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrap.firstElementChild);
  }

  /**
   * confirmAction({ title, body, confirmText, onConfirm })
   */
  function confirmAction({ title = 'Delete this item?', body = 'This action cannot be undone.', confirmText = 'Delete', onConfirm }) {
    ensureConfirmModal();
    const modalEl = document.getElementById('confirmModal');
    modalEl.querySelector('#confirmModalTitle').textContent = title;
    modalEl.querySelector('#confirmModalBody').textContent = body;
    const actionBtn = modalEl.querySelector('#confirmModalAction');
    actionBtn.textContent = confirmText;

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    const handler = async () => {
      actionBtn.disabled = true;
      actionBtn.innerHTML = `<span class="inline-spinner"></span>`;
      try {
        await onConfirm?.();
        modal.hide();
      } catch (err) {
        toast(err.message || 'Something went wrong.', 'error');
      } finally {
        actionBtn.disabled = false;
        actionBtn.textContent = confirmText;
      }
    };
    actionBtn.replaceWith(actionBtn.cloneNode(true)); // clear old listeners
    modalEl.querySelector('#confirmModalAction').addEventListener('click', handler);
    modal.show();
  }

  // ---------------- Small utils ----------------
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function formatDate(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d)) return '—';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function formatDateTime(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d)) return '—';
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function qs(name, fallback = null) {
    return new URLSearchParams(location.search).get(name) || fallback;
  }

  function debounce(fn, wait = 350) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  function buildPagination(container, { page, totalPages, onChange }) {
    if (!container) return;
    if (totalPages <= 1) { container.innerHTML = ''; return; }
    const items = [];
    const push = (label, target, disabled = false, active = false) => {
      items.push(`<li class="page-item ${disabled ? 'disabled' : ''} ${active ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${target}">${label}</a></li>`);
    };
    push('&laquo;', page - 1, page <= 1);
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    for (let p = start; p <= end; p++) push(p, p, false, p === page);
    push('&raquo;', page + 1, page >= totalPages);

    container.innerHTML = `<ul class="pagination">${items.join('')}</ul>`;
    container.querySelectorAll('[data-page]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = Number(a.dataset.page);
        if (target < 1 || target > totalPages || target === page) return;
        onChange(target);
      });
    });
  }

  return {
    mountShell, toast, showLoader, hideLoader, confirmAction,
    escapeHtml, formatDate, formatDateTime, qs, debounce, buildPagination, initials,
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  Common.mountShell();
});