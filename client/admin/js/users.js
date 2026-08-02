/* ==========================================================================
   users.js — powers users.html.
   Uses GET /api/users, PUT /api/users/:id, DELETE /api/users/:id.
   (User creation isn't in the supplied API list, so this page manages
   existing accounts: role/status updates and removal.)
   ========================================================================== */

(function () {
  if (!Auth.guardPage()) return;

  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  const state = { page: 1, limit: 10, q: '', role: '', status: '' };
  const searchInput = document.getElementById('userFilterSearch');
  const roleSelect = document.getElementById('userFilterRole');
  const statusSelect = document.getElementById('userFilterStatus');

  const modalEl = document.getElementById('userModal');
  const modal = modalEl ? new bootstrap.Modal(modalEl) : null;
  const form = document.getElementById('userForm');
  let cache = [];

  function rowHtml(u) {
    const id = u._id || u.id;
    const status = (u.status || (u.isActive === false ? 'blocked' : 'active'));
    return `
      <tr>
        <td data-label="User">
          <div class="d-flex align-items-center gap-2">
            <div class="topbar-profile"><div class="avatar" style="width:38px;height:38px;">${Common.initials(u.name || u.username)}</div></div>
            <div>
              <div class="cell-title">${Common.escapeHtml(u.name || u.username || 'Unnamed')}</div>
              <div class="cell-meta">${Common.escapeHtml(u.email || '')}</div>
            </div>
          </div>
        </td>
        <td data-label="Role"><span class="pill inactive">${Common.escapeHtml(u.role || 'reader')}</span></td>
        <td data-label="Joined">${Common.formatDate(u.createdAt)}</td>
        <td data-label="Status"><span class="pill ${status}">${status}</span></td>
        <td data-label="Actions">
          <div class="d-flex gap-2 justify-content-md-end">
            <button class="btn-icon-sm" data-edit-id="${id}" title="Edit"><i class="bi bi-pencil"></i></button>
            <button class="btn-icon-sm danger" data-delete-id="${id}" data-delete-name="${Common.escapeHtml(u.name || u.email || '')}" title="Delete"><i class="bi bi-trash3"></i></button>
          </div>
        </td>
      </tr>`;
  }

  async function load() {
    Common.showLoader('Loading users…');
    try {
      const res = await Api.users.list({
        page: state.page, limit: state.limit, q: state.q || undefined,
        role: state.role || undefined, status: state.status || undefined,
      });
      cache = res?.users || res?.data || (Array.isArray(res) ? res : []);
      const total = res?.total ?? res?.count ?? cache.length;
      const totalPages = res?.totalPages ?? Math.max(1, Math.ceil(total / state.limit));

      tbody.innerHTML = cache.length
        ? cache.map(rowHtml).join('')
        : `<tr><td colspan="5"><div class="empty-state"><i class="bi bi-people"></i><h3>No users found</h3></div></td></tr>`;

      document.getElementById('resultCount').textContent = `${total} user${total === 1 ? '' : 's'} found`;
      Common.buildPagination(document.getElementById('usersPagination'), {
        page: state.page, totalPages, onChange: (p) => { state.page = p; load(); },
      });

      tbody.querySelectorAll('[data-edit-id]').forEach((btn) => {
        btn.addEventListener('click', () => openModal(cache.find((u) => String(u._id || u.id) === btn.dataset.editId)));
      });
      tbody.querySelectorAll('[data-delete-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
          Common.confirmAction({
            title: 'Delete this user?',
            body: `"${btn.dataset.deleteName}" will lose access permanently.`,
            onConfirm: async () => {
              await Api.users.remove(btn.dataset.deleteId);
              Common.toast('User deleted.', 'success');
              load();
            },
          });
        });
      });
    } catch (err) {
      Common.toast(err.message || 'Could not load users.', 'error');
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><i class="bi bi-exclamation-triangle"></i><h3>Something went wrong</h3></div></td></tr>`;
    } finally {
      Common.hideLoader();
    }
  }

  function openModal(u) {
    if (!u) return;
    form.reset();
    document.getElementById('userId').value = u._id || u.id;
    document.getElementById('userName').value = u.name || u.username || '';
    document.getElementById('userEmail').value = u.email || '';
    document.getElementById('userRole').value = u.role || 'reader';
    document.getElementById('userStatus').value = u.status || (u.isActive === false ? 'blocked' : 'active');
    modal?.show();
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('userId').value;
    const body = {
      name: document.getElementById('userName').value.trim(),
      role: document.getElementById('userRole').value,
      status: document.getElementById('userStatus').value,
    };
    const submitBtn = document.getElementById('userSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="inline-spinner me-2"></span>Saving…`;
    try {
      await Api.users.update(id, body);
      Common.toast('User updated.', 'success');
      modal?.hide();
      load();
    } catch (err) {
      Common.toast(err.message || 'Could not update the user.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Save Changes';
    }
  });

  searchInput?.addEventListener('input', Common.debounce(() => { state.q = searchInput.value.trim(); state.page = 1; load(); }, 400));
  roleSelect?.addEventListener('change', () => { state.role = roleSelect.value; state.page = 1; load(); });
  statusSelect?.addEventListener('change', () => { state.status = statusSelect.value; state.page = 1; load(); });

  load();
})();