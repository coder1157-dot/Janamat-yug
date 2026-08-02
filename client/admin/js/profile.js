 /* ==========================================================================
   profile.js — powers profile.html.
   Uses GET /api/auth/profile. No profile-update or password-change
   endpoint was included in the supplied API list, so those controls
   are shown for completeness but stay disabled with an explanatory
   note until a PUT /api/auth/profile (or similar) route is added.
   ========================================================================== */

(function () {
  if (!Auth.guardPage()) return;

  const nameField = document.getElementById('profileName');
  if (!nameField) return;

  async function load() {
    Common.showLoader('Loading your profile…');
    try {
      const res = await Api.auth.profile();
      const admin = res?.user || res?.admin || res || {};
      Api.setSession(null, admin);

      document.getElementById('profileName').value = admin.name || admin.username || '';
      document.getElementById('profileEmail').value = admin.email || '';
      document.getElementById('profileRole').value = admin.role || 'Administrator';
      document.getElementById('profileJoined').value = Common.formatDate(admin.createdAt);
      document.getElementById('profileAvatarInitials').textContent = Common.initials(admin.name || admin.username);
      document.getElementById('profileDisplayName').textContent = admin.name || admin.username || 'Admin';
      document.getElementById('profileDisplayRole').textContent = admin.role || 'Administrator';
      document.getElementById('profileJoinedDisplay').textContent = Common.formatDate(admin.createdAt);
      if (admin.avatar) {
        document.getElementById('profileAvatarWrap').innerHTML =
          `<img src="${admin.avatar}" alt="${Common.escapeHtml(admin.name || 'Admin')}">`;
      }
    } catch (err) {
      Common.toast(err.message || 'Could not load your profile.', 'error');
    } finally {
      Common.hideLoader();
    }
  }

  document.getElementById('profileForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    Common.toast('Profile editing needs a backend update endpoint (e.g. PUT /api/auth/profile) that is not part of the current API.', 'warning');
  });

  document.getElementById('passwordForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    Common.toast('Password changes need a dedicated backend endpoint that is not part of the current API.', 'warning');
  });

  load();
})();