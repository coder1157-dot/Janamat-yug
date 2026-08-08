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

       document.getElementById("profileName").value =
    admin.fullName || "";

document.getElementById("profileEmail").value =
    admin.email || "";

document.getElementById("profileRole").value =
    admin.role || "Administrator";

document.getElementById("profileJoined").value =
    Common.formatDate(admin.createdAt);

document.getElementById("profileAvatarInitials").textContent =
    admin.fullName
        ? admin.fullName.charAt(0).toUpperCase()
        : "A";

document.getElementById("profileDisplayName").textContent =
    admin.fullName || "Admin";

document.getElementById("profileDisplayRole").textContent =
    admin.role || "Administrator";

document.getElementById("profileJoinedDisplay").textContent =
    Common.formatDate(admin.createdAt);

if (admin.avatar) {
    document.getElementById("profileAvatarWrap").innerHTML =
        `<img src="${admin.avatar}" alt="${Common.escapeHtml(admin.fullName || "Admin")}">`;
}
    } catch (err) {
      Common.toast(err.message || 'Could not load your profile.', 'error');
    } finally {
      Common.hideLoader();
    }
  }

  document.getElementById("profileForm")?.addEventListener("submit", async (e) => {

    e.preventDefault();

    const fullName = document.getElementById("profileName").value.trim();

    if (!fullName) {
        return Common.toast("Name is required", "error");
    }

    try {

        const res = await Api.auth.updateProfile({
            fullName
        });

        const user = res.user || res;

        document.getElementById("profileDisplayName").textContent = user.fullName;
        document.getElementById("profileAvatarInitials").textContent =
            user.fullName.charAt(0).toUpperCase();

        Api.setSession(null, user);

        Common.toast("Profile Updated Successfully", "success");

    } catch (err) {

        Common.toast(err.message, "error");

    }

});

   document.getElementById("passwordForm")?.addEventListener("submit", async (e) => {

    e.preventDefault();

    const currentPassword = document.getElementById("currentPassword").value;

    const newPassword = document.getElementById("newPassword").value;

    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {

        return Common.toast("Passwords do not match", "error");

    }

    try {

        await Api.auth.changePassword({
            currentPassword,
            newPassword
        });

        Common.toast("Password Updated Successfully", "success");

        e.target.reset();

    } catch (err) {

        Common.toast(err.message, "error");

    }

});

  load();
})();