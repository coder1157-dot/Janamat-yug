/* ==========================================================================
   comments.js — powers comments.html.
   NOTE: a comments endpoint was not part of the supplied API list.
   This calls Api.comments.* (wired to the conventional /api/comments
   path in api.js) so the page works as soon as that route exists on
   the backend. If the real path differs, update it in api.js only.
   ========================================================================== */

(function () {
  if (!Auth.guardPage()) return;

  const tbody = document.getElementById('commentsTableBody');
  if (!tbody) return;

  const state = { page: 1, limit: 10, q: '', status: '' };
  const searchInput = document.getElementById('commentFilterSearch');
  const statusSelect = document.getElementById('commentFilterStatus');
  const banner = document.getElementById('commentsApiBanner');

  function rowHtml(c) {
    const id = c._id || c.id;
    const status = c.status || (c.approved ? 'approved' : 'pending');
    return `
      <tr>
        <td data-label="Comment">
          <div class="cell-title">${Common.escapeHtml((c.text || c.content || '').slice(0, 90))}${(c.text || c.content || '').length > 90 ? '…' : ''}</div>
          <div class="cell-meta">on "${Common.escapeHtml(c.news?.title || c.article || 'Unknown article')}"</div>
        </td>
        <td data-label="Author">${Common.escapeHtml(c.author?.name || c.name || 'Guest')}</td>
        <td data-label="Posted">${Common.formatDateTime(c.createdAt)}</td>
        <td data-label="Status"><span class="pill ${status}">${status}</span></td>
        <td data-label="Actions">
          <div class="d-flex gap-2 justify-content-md-end">
            ${status !== 'approved' ? `<button class="btn-icon-sm" data-approve-id="${id}" title="Approve"><i class="bi bi-check-lg"></i></button>` : ''}
            ${status !== 'rejected' ? `<button class="btn-icon-sm" data-reject-id="${id}" title="Reject"><i class="bi bi-x-lg"></i></button>` : ''}
            <button class="btn-icon-sm danger" data-delete-id="${id}" title="Delete"><i class="bi bi-trash3"></i></button>
          </div>
        </td>
      </tr>`;
  }

  async function updateStatus(id, status) {
    try {
      await Api.comments.update(id, { status });
      Common.toast(`Comment ${status}.`, 'success');
      load();
    } catch (err) {
      Common.toast(err.message || 'Could not update the comment.', 'error');
    }
  }

  async function load() {
    Common.showLoader('Loading comments…');
    try {
      const res = await Api.comments.list({
        page: state.page, limit: state.limit, q: state.q || undefined, status: state.status || undefined,
      });
      const list = res?.comments || res?.data || (Array.isArray(res) ? res : []);
      const total = res?.total ?? res?.count ?? list.length;
      const totalPages = res?.totalPages ?? Math.max(1, Math.ceil(total / state.limit));

      banner?.classList.add('d-none');
      tbody.innerHTML = list.length
        ? list.map(rowHtml).join('')
        : `<tr><td colspan="5"><div class="empty-state"><i class="bi bi-chat-square-text"></i><h3>No comments found</h3></div></td></tr>`;

      document.getElementById('resultCount').textContent = `${total} comment${total === 1 ? '' : 's'} found`;
      Common.buildPagination(document.getElementById('commentsPagination'), {
        page: state.page, totalPages, onChange: (p) => { state.page = p; load(); },
      });

      tbody.querySelectorAll('[data-approve-id]').forEach((b) => b.addEventListener('click', () => updateStatus(b.dataset.approveId, 'approved')));
      tbody.querySelectorAll('[data-reject-id]').forEach((b) => b.addEventListener('click', () => updateStatus(b.dataset.rejectId, 'rejected')));
      tbody.querySelectorAll('[data-delete-id]').forEach((b) => {
        b.addEventListener('click', () => {
          Common.confirmAction({
            title: 'Delete this comment?',
            body: 'This action cannot be undone.',
            onConfirm: async () => {
              await Api.comments.remove(b.dataset.deleteId);
              Common.toast('Comment deleted.', 'success');
              load();
            },
          });
        });
      });
    } catch (err) {
      // Surface a clear, non-blocking notice if the backend route doesn't exist yet (404),
      // rather than presenting a broken/empty table with no explanation.
      if (err.status === 404) {
        banner?.classList.remove('d-none');
      } else {
        Common.toast(err.message || 'Could not load comments.', 'error');
      }
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><i class="bi bi-exclamation-triangle"></i><h3>Comments unavailable</h3><p>${Common.escapeHtml(err.message || '')}</p></div></td></tr>`;
    } finally {
      Common.hideLoader();
    }
  }

  searchInput?.addEventListener('input', Common.debounce(() => { state.q = searchInput.value.trim(); state.page = 1; load(); }, 400));
  statusSelect?.addEventListener('change', () => { state.status = statusSelect.value; state.page = 1; load(); });

  load();
})();