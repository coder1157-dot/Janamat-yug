/* ==========================================================================
   api.js — single point of contact with the backend.
   Every other module calls through Api.* instead of using fetch() directly.
   Only the endpoints listed in the project brief are called here.
   ========================================================================== */

const Api = (() => {
  // Change this if the backend runs on a different host/port in production.
  // If the admin panel is served by the same Express app as the API,
  // set BASE_URL to '/api'.
   const BASE_URL =  "https://janamat-yug.onrender.com/api";
  const TOKEN_KEY = 'admin_token';
  const ADMIN_KEY = 'admin_user';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setSession(token, user) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(ADMIN_KEY, JSON.stringify(user));
  }

  function getStoredAdmin() {
    try {
      return JSON.parse(localStorage.getItem(ADMIN_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  }

  /**
   * Core request helper.
   * @param {string} path        e.g. '/news' or '/news/123'
   * @param {object} options     { method, body, isForm, query }
   */
  async function request(path, options = {}) {
    const { method = 'GET', body = null, isForm = false, query = null } = options;

    let url = BASE_URL + path;
    if (query && Object.keys(query).length) {
      const qs = new URLSearchParams(
        Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== ''))
      ).toString();
      if (qs) url += (url.includes('?') ? '&' : '?') + qs;
    }

    const headers = {};
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (body && !isForm) headers['Content-Type'] = 'application/json';

    let response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
      });
    } catch (networkErr) {
      throw new ApiError('Could not reach the server. Check your connection and try again.', 0, null);
    }

    // No content
    if (response.status === 204) return null;

    let data = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json().catch(() => null);
    } else {
      data = await response.text().catch(() => null);
    }

    if (!response.ok) {
      if (response.status === 401) {
        clearSession();
        if (!location.pathname.endsWith('login.html')) {
          const next = encodeURIComponent(location.pathname + location.search);
          location.href = `login.html?expired=1&next=${next}`;
        }
      }
      const message = (data && (data.message || data.error)) || `Request failed (${response.status})`;
      throw new ApiError(message, response.status, data);
    }

    if (
    data &&
    typeof data === "object" &&
    "success" in data &&
    "data" in data
) {
    return data.data;
}

return data;
  }

  class ApiError extends Error {
    constructor(message, status, data) {
      super(message);
      this.status = status;
      this.data = data;
    }
  }

  return {
    BASE_URL,
    getToken,
    setSession,
    getStoredAdmin,
    clearSession,
    ApiError,

    // ---------------- Auth ----------------
    auth: {
      login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
      profile: () => request('/auth/profile'),
    },

    // ---------------- News ----------------
    news: {
      list: (query) => request('/news', { query }),
      get: (id) => request(`/news/${id}`),
      create: (formData) => request('/news', { method: 'POST', body: formData, isForm: true }),
      update: (id, formData) => request(`/news/${id}`, { method: 'PUT', body: formData, isForm: true }),
      remove: (id) => request(`/news/${id}`, { method: 'DELETE' }),
    },

    // ---------------- Categories ----------------
    categories: {
      list: (query) => request('/categories', { query }),
      create: (body) => request('/categories', { method: 'POST', body }),
      update: (id, body) => request(`/categories/${id}`, { method: 'PUT', body }),
      remove: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
    },

    // ---------------- Users ----------------
   
    users:{
 list:(query)=>request('/admin/users',{query}),

 update:(id,body)=>request(`/admin/users/${id}/role`,{
     method:'PUT',
     body
 }),

 remove:(id)=>request(`/admin/users/${id}`,{
     method:'DELETE'
 })
},

    // ---------------- Dashboard ----------------
    dashboard: {
      summary: () => request('/admin/dashboard'),
    },

    // ---------------- Ads ----------------
    ads: {
      list: (query) => request('/ads', { query }),
      create: (formData) => request('/ads', { method: 'POST', body: formData, isForm: true }),
      update: (id, formData) => request(`/ads/${id}`, { method: 'PUT', body: formData, isForm: true }),
      remove: (id) => request(`/ads/${id}`, { method: 'DELETE' }),
    },

    // ---------------- Settings ----------------
    settings: {
      get: () => request('/settings'),
      update: (body) => request('/settings', { method: 'PUT', body }),
    },

    // ---------------- Comments ----------------
    // NOTE: no comments endpoint was included in the supplied API list.
    // Wired to the conventional /api/comments path so the page is functional
    // the moment that route is added on the backend; update here if the
    // real path differs.
    comments: {
      list: (query) => request('/comments', { query }),
      update: (id, body) => request(`/comments/${id}`, { method: 'PUT', body }),
      remove: (id) => request(`/comments/${id}`, { method: 'DELETE' }),
    },
  };
})();
