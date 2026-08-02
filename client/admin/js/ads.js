/* ==========================================================================
   ads.js — powers ads.html.
   Uses GET/POST/PUT/DELETE /api/ads. Ad creatives upload as multipart
   (Multer), same pattern as news images.
   ========================================================================== */

(function () {
  if (!Auth.guardPage()) return;

  const grid = document.getElementById('adsGrid');
  if (!grid) return;

  const modalEl = document.getElementById('adModal');
  const modal = modalEl ? new bootstrap.Modal(modalEl) : null;
  const form = document.getElementById('adForm');
  let cache = [];

  const creativeUpload = Upload.initSingle({
    dropzoneId: 'adDropzone', inputId: 'adImageInput', frameId: 'adFrame', accept: 'image',
  });

  function cardHtml(ad) {
    const id = ad._id || ad.id;
    const status = ad.status || (ad.isActive ? 'active' : 'inactive');
    return `
      <div class="col-sm-6 col-lg-4">
        <div class="desk-card h-100 d-flex flex-column">
          <div class="media-preview-frame" style="border-radius: var(--radius) var(--radius) 0 0; border:none; border-bottom:1px solid var(--rule);">
            <img src="${ad.image || 'assets/placeholder-thumb.svg'}" alt="${Common.escapeHtml(ad.title || 'Ad creative')}" style="max-height:150px;">
          </div>
          <div class="p-3 d-flex flex-column gap-2 flex-grow-1">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <div class="cell-title">${Common.escapeHtml(ad.title || 'Untitled ad')}</div>
              <span class="pill ${status}">${status}</span>
            </div>
            <div class="cell-meta"><i class="bi bi-geo-alt me-1"></i>${Common.escapeHtml(ad.placement || ad.position || 'Sidebar')}</div>
            <div class="cell-meta"><i class="bi bi-link-45deg me-1"></i>${Common.escapeHtml(ad.link || ad.url || '—')}</div>
            <div class="mt-auto d-flex gap-2 pt-2">
              <button class="btn btn-outline-desk btn-sm flex-fill" data-edit-id="${id}"><i class="bi bi-pencil me-1"></i>Edit</button>
              <button class="btn-icon-sm danger" data-delete-id="${id}" data-delete-name="${Common.escapeHtml(ad.title || '')}"><i class="bi bi-trash3"></i></button>
            </div>
          </div>
        </div>
      </div>`;
  }

  async function load() {
    Common.showLoader('Loading ad campaigns…');
    try {
      const res = await Api.ads.list();
      cache = res?.ads || res?.data || (Array.isArray(res) ? res : []);
      grid.innerHTML = cache.length
        ? cache.map(cardHtml).join('')
        : `<div class="col-12"><div class="empty-state"><i class="bi bi-megaphone"></i><h3>No ads yet</h3><p>Create your first ad campaign.</p></div></div>`;

      grid.querySelectorAll('[data-edit-id]').forEach((btn) => {
        btn.addEventListener('click', () => openModal(cache.find((a) => String(a._id || a.id) === btn.dataset.editId)));
      });
      grid.querySelectorAll('[data-delete-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
          Common.confirmAction({
            title: 'Delete this ad?',
            body: `"${btn.dataset.deleteName}" will be permanently removed.`,
            onConfirm: async () => {
              await Api.ads.remove(btn.dataset.deleteId);
              Common.toast('Ad deleted.', 'success');
              load();
            },
          });
        });
      });
    } catch (err) {
      Common.toast(err.message || 'Could not load ads.', 'error');
      grid.innerHTML = `<div class="col-12"><div class="empty-state"><i class="bi bi-exclamation-triangle"></i><h3>Something went wrong</h3></div></div>`;
    } finally {
      Common.hideLoader();
    }
  }

  function openModal(ad) {
    form.reset();
    form.classList.remove('was-validated');
    creativeUpload.clear();
    document.getElementById('adId').value = ad?._id || ad?.id || '';
    document.getElementById('adTitle').value = ad?.title || '';
    document.getElementById('adPlacement').value = ad?.placement || ad?.position || 'sidebar';
    document.getElementById('adLink').value = ad?.link || ad?.url || '';
    document.getElementById('adStatus').value = ad?.status || (ad?.isActive === false ? 'inactive' : 'active');
    document.getElementById('adModalLabel').textContent = ad ? 'Edit Ad' : 'Add Ad';
    if (ad?.image) creativeUpload.setExisting(ad.image);
    modal?.show();
  }

  document.getElementById('addAdBtn')?.addEventListener('click', () => openModal(null));

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.classList.add('was-validated'); return; }

    const id = document.getElementById('adId').value;
    const fd = new FormData();
    fd.append('title', document.getElementById('adTitle').value.trim());
    fd.append('placement', document.getElementById('adPlacement').value);
    fd.append('link', document.getElementById('adLink').value.trim());
    fd.append('status', document.getElementById('adStatus').value);
    const file = creativeUpload.getFile();
    if (file) fd.append('image', file);

    const submitBtn = document.getElementById('adSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="inline-spinner me-2"></span>Saving…`;
    try {
      if (id) await Api.ads.update(id, fd);
      else await Api.ads.create(fd);
      Common.toast(`Ad ${id ? 'updated' : 'created'}.`, 'success');
      modal?.hide();
      load();
    } catch (err) {
      Common.toast(err.message || 'Could not save the ad.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Save Ad';
    }
  });

  load();
})();