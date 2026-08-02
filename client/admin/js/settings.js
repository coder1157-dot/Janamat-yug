/* ==========================================================================
   settings.js — powers settings.html.
   Uses GET /api/settings and PUT /api/settings.
   ========================================================================== */

(function () {
  if (!Auth.guardPage()) return;

  const form = document.getElementById('settingsForm');
  if (!form) return;

  const fields = {
    siteName: document.getElementById('setSiteName'),
    tagline: document.getElementById('setTagline'),
    contactEmail: document.getElementById('setContactEmail'),
    contactPhone: document.getElementById('setContactPhone'),
    address: document.getElementById('setAddress'),
    facebook: document.getElementById('setFacebook'),
    twitter: document.getElementById('setTwitter'),
    instagram: document.getElementById('setInstagram'),
    youtube: document.getElementById('setYoutube'),
    metaDescription: document.getElementById('setMetaDescription'),
    metaKeywords: document.getElementById('setMetaKeywords'),
    commentsEnabled: document.getElementById('setCommentsEnabled'),
    adsEnabled: document.getElementById('setAdsEnabled'),
    maintenanceMode: document.getElementById('setMaintenanceMode'),
  };

  async function load() {
    Common.showLoader('Loading settings…');
    try {
      const res = await Api.settings.get();
      const s = res?.settings || res?.data || res || {};
      Object.entries(fields).forEach(([key, el]) => {
        if (!el) return;
        if (el.type === 'checkbox') el.checked = Boolean(s[key]);
        else el.value = s[key] ?? '';
      });
    } catch (err) {
      Common.toast(err.message || 'Could not load settings.', 'error');
    } finally {
      Common.hideLoader();
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {};
    Object.entries(fields).forEach(([key, el]) => {
      if (!el) return;
      body[key] = el.type === 'checkbox' ? el.checked : el.value.trim();
    });

    const submitBtn = document.getElementById('settingsSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="inline-spinner me-2"></span>Saving…`;
    try {
      await Api.settings.update(body);
      Common.toast('Settings saved.', 'success');
    } catch (err) {
      Common.toast(err.message || 'Could not save settings.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="bi bi-check2-circle me-1"></i> Save Settings';
    }
  });

  load();
})();