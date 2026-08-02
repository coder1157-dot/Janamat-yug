/* ==========================================================================
   category.js — powers categories.html.
   Uses GET/POST/PUT/DELETE /api/categories.
   ========================================================================== */

(function () {
  if (!Auth.guardPage()) return;

  const grid = document.getElementById('categoryGrid');
  if (!grid) return;

  const state = { q: '' };
  const searchInput = document.getElementById('categorySearch');
  const modalEl = document.getElementById('categoryModal');
  const modal = modalEl ? new bootstrap.Modal(modalEl) : null;
  const form = document.getElementById('categoryForm');

  function cardHtml(cat) {
    const id = cat._id || cat.id;
    const count = cat.newsCount ?? cat.count ?? null;
    return `
      <div class="col-sm-6 col-lg-4 col-xxl-3">
        <div class="desk-card h-100 p-3 d-flex flex-column gap-2">
          <div class="d-flex align-items-start justify-content-between">
            <div class="stat-icon tone-gold"><i class="bi bi-tag"></i></div>
            <div class="d-flex gap-2">
              <button class="btn-icon-sm" data-edit-id="${id}" title="Edit"><i class="bi bi-pencil"></i></button>
              <button class="btn-icon-sm danger" data-delete-id="${id}" data-delete-name="${Common.escapeHtml(cat.name)}" title="Delete"><i class="bi bi-trash3"></i></button>
            </div>
          </div>
          <div>
            <div class="cell-title fs-6">${Common.escapeHtml(cat.name)}</div>
            <div class="cell-meta">${Common.escapeHtml(cat.slug || '')}</div>
          </div>
          <p class="text-soft small mb-0 flex-grow-1">${Common.escapeHtml(cat.description || 'No description provided.')}</p>
          ${count !== null ? `<div class="cell-meta"><i class="bi bi-newspaper me-1"></i>${count} article${count === 1 ? '' : 's'}</div>` : ''}
        </div>
      </div>`;
  }

  let cache = [];

  async function load() {
    Common.showLoader('Loading categories…');
    try {
      const res = await Api.categories.list();
      cache = res?.categories || res?.data || (Array.isArray(res) ? res : []);
      render();
    } catch (err) {
      Common.toast(err.message || 'Could not load categories.', 'error');
      grid.innerHTML = `<div class="col-12"><div class="empty-state"><i class="bi bi-exclamation-triangle"></i><h3>Something went wrong</h3></div></div>`;
    } finally {
      Common.hideLoader();
    }
  }

  function render() {
    const q = state.q.toLowerCase();
    const list = q ? cache.filter((c) => (c.name || '').toLowerCase().includes(q)) : cache;
    grid.innerHTML = list.length
      ? list.map(cardHtml).join('')
      : `<div class="col-12"><div class="empty-state"><i class="bi bi-tags"></i><h3>No categories yet</h3><p>Create your first category to start organizing articles.</p></div></div>`;

    grid.querySelectorAll('[data-edit-id]').forEach((btn) => {
      btn.addEventListener('click', () => openModal(cache.find((c) => String(c._id || c.id) === btn.dataset.editId)));
    });
    grid.querySelectorAll('[data-delete-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        Common.confirmAction({
          title: 'Delete this category?',
          body: `"${btn.dataset.deleteName}" will be permanently removed.`,
          onConfirm: async () => {
            await Api.categories.remove(btn.dataset.deleteId);
            Common.toast('Category deleted.', 'success');
            load();
          },
        });
      });
    });
  }

  function openModal(cat) {
    form.reset();
    form.classList.remove('was-validated');
    document.getElementById('categoryId').value = cat?._id || cat?.id || '';
    document.getElementById('categoryName').value = cat?.name || '';
    document.getElementById('categorySlug').value = cat?.slug || '';
    document.getElementById('categoryDescription').value = cat?.description || '';
    document.getElementById('categoryModalLabel').textContent = cat ? 'Edit Category' : 'Add Category';
    modal?.show();
  }

  document.getElementById('addCategoryBtn')?.addEventListener('click', () => openModal(null));

  document.getElementById('categoryName')?.addEventListener('input', (e) => {
    const slugField = document.getElementById('categorySlug');
    if (!slugField.dataset.touched) {
      slugField.value = e.target.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
  });
  document.getElementById('categorySlug')?.addEventListener('input', (e) => { e.target.dataset.touched = '1'; });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.classList.add('was-validated'); return; }

    const id = document.getElementById('categoryId').value;
    const body = {
      name: document.getElementById('categoryName').value.trim(),
      slug: document.getElementById('categorySlug').value.trim(),
      description: document.getElementById('categoryDescription').value.trim(),
    };
    const submitBtn = document.getElementById('categorySubmitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="inline-spinner me-2"></span>Saving…`;
    try {
      if (id) await Api.categories.update(id, body);
      else await Api.categories.create(body);
      Common.toast(`Category ${id ? 'updated' : 'created'}.`, 'success');
      modal?.hide();
      load();
    } catch (err) {
      Common.toast(err.message || 'Could not save the category.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Save Category';
    }
  });

  searchInput?.addEventListener('input', Common.debounce(() => { state.q = searchInput.value.trim(); render(); }, 250));

  load();
})();