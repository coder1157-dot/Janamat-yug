/* ==========================================================================
   news.js — powers add-news.html, manage-news.html and edit-news.html.
   Uses GET/POST/PUT/DELETE /api/news and GET /api/categories (for the
   category picker). Image/video uploads ride along on the same
   multipart request (Multer on the backend).
   ========================================================================== */

(function () {
  if (!Auth.guardPage()) return;

  const page = location.pathname.split('/').pop();

  // ---------------------------------------------------------------------
  // Shared: populate a <select> with categories
  // ---------------------------------------------------------------------
  async function fillCategorySelect(selectEl, selectedId) {
    if (!selectEl) return;
    try {
      const res = await Api.categories.list();
      const list = res?.categories || res?.data || res || [];
      selectEl.innerHTML = '<option value="">Select a category…</option>' +
        list.map((c) => `<option value="${c._id || c.id}" ${String(c._id || c.id) === String(selectedId) ? 'selected' : ''}>${Common.escapeHtml(c.name)}</option>`).join('');
    } catch (err) {
      Common.toast('Could not load categories.', 'error');
    }
  }

  // ---------------------------------------------------------------------
  // ADD NEWS
  // ---------------------------------------------------------------------
  function initAddNews() {
    const form = document.getElementById('newsForm');
    if (!form) return;

    fillCategorySelect(document.getElementById('newsCategory'));

    let editor;
    if (window.ClassicEditor) {
      ClassicEditor.create(document.getElementById('newsContent'))
        .then((ed) => { editor = ed; })
        .catch(() => Common.toast('Editor failed to load; a plain textarea will be used instead.', 'warning'));
    }

    const featuredUpload = Upload.initSingle({
      dropzoneId: 'featuredDropzone', inputId: 'featuredImageInput', frameId: 'featuredFrame', accept: 'image',
    });
    const videoUpload = Upload.initSingle({
      dropzoneId: 'videoDropzone', inputId: 'videoInput', frameId: 'videoFrame', accept: 'video',
    });
    const gallery = Upload.initGallery({ gridId: 'galleryGrid', inputId: 'galleryInput', max: 10 });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.classList.add('was-validated'); return; }

      const submitBtn = document.getElementById('newsSubmitBtn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="inline-spinner me-2"></span>Publishing…`;

      const fd = new FormData();
      fd.append('title', document.getElementById('newsTitle').value.trim());
      fd.append('category', document.getElementById('newsCategory').value);
      fd.append('status', document.getElementById('newsStatus').value);
      fd.append('tags', document.getElementById('newsTags').value.trim());
      
      fd.append('content', editor ? editor.getData() : document.getElementById('newsContent').value);
     fd.append('shortDescription', document.getElementById('newsExcerpt').value.trim());

const featured = featuredUpload.getFile();
if (featured) {
    fd.append('coverImage', featured);
}
      
      const video = videoUpload.getFile();
      if (video) fd.append('video', video);
      gallery.getFiles().forEach((file) => fd.append('gallery', file));

      try {
        await Api.news.create(fd);
        Common.toast('Article published successfully.', 'success');
        form.reset();
        form.classList.remove('was-validated');
        featuredUpload.clear();
        videoUpload.clear();
        gallery.clear();
        editor?.setData('');
        setTimeout(() => { location.href = 'manage-news.html'; }, 900);
      } catch (err) {
        Common.toast(err.message || 'Could not publish the article.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-send-check me-1"></i> Publish Article';
      }
    });

    document.getElementById('newsSaveDraftBtn')?.addEventListener('click', () => {
      document.getElementById('newsStatus').value = 'draft';
      form.requestSubmit();
    });
  }

  // ---------------------------------------------------------------------
  // MANAGE NEWS (list, filter, paginate, delete)
  // ---------------------------------------------------------------------
  function initManageNews() {
    const tbody = document.getElementById('newsTableBody');
    if (!tbody) return;

    const state = { page: 1, limit: 10, q: Common.qs('q', ''), category: '', status: '' };

    const searchInput = document.getElementById('newsFilterSearch');
    const categorySelect = document.getElementById('newsFilterCategory');
    const statusSelect = document.getElementById('newsFilterStatus');
    if (searchInput) searchInput.value = state.q;

    fillCategorySelect(categorySelect);
    if (categorySelect) categorySelect.insertAdjacentHTML('afterbegin', '<option value="">All categories</option>');

    function rowHtml(item) {
      const id = item._id || item.id;
      return `
        <tr>
          <td data-label="Article">
            <div class="d-flex align-items-center gap-2">
              <img class="row-thumb" src="${item.coverImage || item.thumbnail || 'assets/placeholder-thumb.svg'}" alt="">
              <div>
                <div class="cell-title">${Common.escapeHtml(item.title || 'Untitled')}</div>
                <div class="cell-meta">${Common.escapeHtml((item.excerpt || '').slice(0, 60))}${(item.excerpt || '').length > 60 ? '…' : ''}</div>
              </div>
            </div>
          </td>
          <td data-label="Category">${Common.escapeHtml(item.category?.name || item.category || '—')}</td>
          <td data-label="Author">${Common.escapeHtml(item.author?.name || item.author || 'Admin')}</td>
          <td data-label="Published">${Common.formatDate(item.createdAt || item.publishedAt)}</td>
          <td data-label="Status"><span class="pill ${(item.status || 'published').toLowerCase()}">${item.status || 'Published'}</span></td>
          <td data-label="Actions">
            <div class="d-flex gap-2 justify-content-md-end">
              <a class="btn-icon-sm" href="edit-news.html?id=${id}" title="Edit"><i class="bi bi-pencil"></i></a>
              <button class="btn-icon-sm danger" data-delete-id="${id}" data-delete-title="${Common.escapeHtml(item.title || '')}" title="Delete"><i class="bi bi-trash3"></i></button>
            </div>
          </td>
        </tr>`;
    }

    async function load() {
      Common.showLoader('Fetching articles…');
      try {
        const res = await Api.news.list({
          page: state.page, limit: state.limit, q: state.q || undefined,
          category: state.category || undefined, status: state.status || undefined,
        });
        const list = res?.news || res?.data || (Array.isArray(res) ? res : []);
        const total = res?.total ?? res?.count ?? list.length;
        const totalPages = res?.totalPages ?? Math.max(1, Math.ceil(total / state.limit));

        tbody.innerHTML = list.length
          ? list.map(rowHtml).join('')
          : `<tr><td colspan="6"><div class="empty-state"><i class="bi bi-inboxes"></i><h3>No articles found</h3><p>Try adjusting your filters or add a new article.</p></div></td></tr>`;

        document.getElementById('resultCount').textContent = `${total} article${total === 1 ? '' : 's'} found`;
        Common.buildPagination(document.getElementById('newsPagination'), {
          page: state.page, totalPages, onChange: (p) => { state.page = p; load(); },
        });

        tbody.querySelectorAll('[data-delete-id]').forEach((btn) => {
          btn.addEventListener('click', () => {
            Common.confirmAction({
              title: 'Delete this article?',
              body: `"${btn.dataset.deleteTitle}" will be permanently removed.`,
              onConfirm: async () => {
                await Api.news.remove(btn.dataset.deleteId);
                Common.toast('Article deleted.', 'success');
                load();
              },
            });
          });
        });
      } catch (err) {
        Common.toast(err.message || 'Could not load articles.', 'error');
        tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="bi bi-exclamation-triangle"></i><h3>Something went wrong</h3><p>${Common.escapeHtml(err.message || '')}</p></div></td></tr>`;
      } finally {
        Common.hideLoader();
      }
    }

    searchInput?.addEventListener('input', Common.debounce(() => { state.q = searchInput.value.trim(); state.page = 1; load(); }, 400));
    categorySelect?.addEventListener('change', () => { state.category = categorySelect.value; state.page = 1; load(); });
    statusSelect?.addEventListener('change', () => { state.status = statusSelect.value; state.page = 1; load(); });

    load();
  }

  // ---------------------------------------------------------------------
  // EDIT NEWS
  // ---------------------------------------------------------------------
  function initEditNews() {
    const form = document.getElementById('newsForm');
    if (!form) return;
    const id = Common.qs('id');
    if (!id) {
      Common.toast('No article selected to edit.', 'error');
      setTimeout(() => { location.href = 'manage-news.html'; }, 800);
      return;
    }

    let editor;
    const editorReady = window.ClassicEditor
      ? ClassicEditor.create(document.getElementById('newsContent')).then((ed) => { editor = ed; }).catch(() => {})
      : Promise.resolve();

    const featuredUpload = Upload.initSingle({
      dropzoneId: 'featuredDropzone', inputId: 'featuredImageInput', frameId: 'featuredFrame', accept: 'image',
    });
    const videoUpload = Upload.initSingle({
      dropzoneId: 'videoDropzone', inputId: 'videoInput', frameId: 'videoFrame', accept: 'video',
    });
    const gallery = Upload.initGallery({ gridId: 'galleryGrid', inputId: 'galleryInput', max: 10 });

    async function load() {
      Common.showLoader('Loading article…');
      try {
        await editorReady;
        const res = await Api.news.get(id);
        const item = res?.news || res?.data || res;

        document.getElementById('newsTitle').value = item.title || '';
        document.getElementById('newsTags').value = (item.tags || []).join?.(', ') || item.tags || '';
        document.getElementById('newsExcerpt').value = item.excerpt || '';
        document.getElementById('newsStatus').value = item.status || 'published';
        if (editor) editor.setData(item.content || ''); else document.getElementById('newsContent').value = item.content || '';

        await fillCategorySelect(document.getElementById('newsCategory'), item.category?._id || item.category);

        if (item.coverImage) featuredUpload.setExisting(item.coverImage, false);
        if (item.video) videoUpload.setExisting(item.video, true);
        if (item.gallery?.length) gallery.setExisting(item.gallery);
      } catch (err) {
        Common.toast(err.message || 'Could not load the article.', 'error');
      } finally {
        Common.hideLoader();
      }
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.classList.add('was-validated'); return; }

      const submitBtn = document.getElementById('newsSubmitBtn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="inline-spinner me-2"></span>Saving…`;

      const fd = new FormData();
      fd.append('title', document.getElementById('newsTitle').value.trim());
      fd.append('category', document.getElementById('newsCategory').value);
      fd.append('status', document.getElementById('newsStatus').value);
      fd.append('tags', document.getElementById('newsTags').value.trim());
      
      fd.append('content', editor ? editor.getData() : document.getElementById('newsContent').value);
fd.append('shortDescription', document.getElementById('newsExcerpt').value.trim());

const featured = featuredUpload.getFile();
if (featured) {
    fd.append('coverImage', featured);
}
      
      const video = videoUpload.getFile();
      if (video) fd.append('video', video);
      gallery.getFiles().forEach((file) => fd.append('gallery', file));

      try {
        await Api.news.update(id, fd);
        Common.toast('Article updated.', 'success');
        setTimeout(() => { location.href = 'manage-news.html'; }, 800);
      } catch (err) {
        Common.toast(err.message || 'Could not update the article.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-check2-circle me-1"></i> Save Changes';
      }
    });

    load();
  }

  if (page === 'add-news.html') initAddNews();
  else if (page === 'manage-news.html') initManageNews();
  else if (page === 'edit-news.html') initEditNews();
})();