/**
 * profile.js
 * ------------------------------------------------------------------
 * SINGLE RESPONSIBILITY: profile page — display and update the
 * logged-in user's account details.
 * ------------------------------------------------------------------
 */

import { getProfileRequest, updateProfileRequest, changePasswordRequest } from './newsApi.js';
import { requireAuth, getCurrentUser, logout } from './auth.js';
import { showToast, getAllBookmarks } from './interaction.js';


function initPasswordForm() {

  const form = document.getElementById("changePasswordForm");

  if (!form) return;

  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const currentPassword =
      document.getElementById("currentPassword").value.trim();

    const newPassword =
      document.getElementById("newPassword").value.trim();

    if (!currentPassword || !newPassword) {

      showToast("सभी फ़ील्ड भरें", "error");

      return;

    }

    try {

      await changePasswordRequest(

        currentPassword,

        newPassword

      );

      showToast(

        "पासवर्ड सफलतापूर्वक बदल दिया गया",

        "success"

      );

      form.reset();

    }

    catch(err){

      showToast(

        err.message,

        "error"

      );

    }

  });

}
function initial(name = 'उ') {
  return name.trim().charAt(0).toUpperCase() || 'उ';
}
 function paintProfile(user) {
  const name = user.fullName || 'उपयोगकर्ता';

  document.getElementById('profileAvatar').textContent = initial(name);
  document.getElementById('profileName').textContent = name;
  document.getElementById('profileEmail').textContent = user.email || '';

  document.getElementById('editName').value = user.fullName || '';
  document.getElementById('editEmail').value = user.email || '';

  document.getElementById('bookmarkCount').textContent =
    getAllBookmarks().length;
}

async function loadProfile() {
  const cached = getCurrentUser();
  if (cached) paintProfile(cached);

  try {
    const data = await getProfileRequest();
    const user = data.user || data;
    paintProfile(user);
  } catch (err) {
    if (!cached) showToast('प्रोफ़ाइल लोड नहीं हो सकी', 'error');
  }
}
 function initEditForm() {
  const form = document.getElementById('profileEditForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('profileSaveBtn');
    const fullName = document.getElementById('editName').value.trim();
     

    if (!fullName) {
      showToast('नाम दर्ज करें', 'error');
      return;
    }

    btn.disabled = true;

    try {
      const payload = {
        fullName
      };

      const data = await updateProfileRequest(payload);
      const user = data.user || data;

      localStorage.setItem('jyug_user', JSON.stringify(user));

      paintProfile(user);

      showToast('प्रोफ़ाइल अपडेट हो गई', 'success');

    } catch (err) {

      console.error('Profile update error:', err);

      showToast(
        err.message || 'अपडेट विफल रहा',
        'error'
      );

    } finally {
      btn.disabled = false;
    }
  });
}
function initLogoutButton() {
  document.getElementById('profileLogoutBtn')?.addEventListener('click', () => logout());
}

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('profileName')) return; /* not the profile page */
  if (!requireAuth()) return;

  loadProfile();
  initEditForm();
  initPasswordForm();
  initLogoutButton();
});
