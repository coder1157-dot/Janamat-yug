/**
 * newsApi.js
 * ------------------------------------------------------------------
 * SINGLE RESPONSIBILITY: talk to the backend REST API.
 * No DOM access, no rendering — every other file imports from here.
 * ------------------------------------------------------------------
 */

/** Change this to your deployed Express server URL */
export const API_BASE_URL = "https://janamat-yug.onrender.com/api";

/** Categories shown across the site. Update `id` to match your DB categoryId. */
export const CATEGORIES = [
  { id: 'rajniti', name: 'राजनीति' },
  { id: 'desh', name: 'देश' },
  { id: 'videsh', name: 'विदेश' },
  { id: 'khel', name: 'खेल' },
  { id: 'manoranjan', name: 'मनोरंजन' },
  { id: 'vyapar', name: 'व्यापार' },
  { id: 'technology', name: 'टेक्नोलॉजी' },
  { id: 'health', name: 'स्वास्थ्य' },
  { id: 'education', name: 'शिक्षा' }
];

const TOKEN_KEY = 'jyug_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function buildHeaders(withAuth = false, json = true) {
  const headers = {};
  if (json) headers['Content-Type'] = 'application/json';
  if (withAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Core fetch wrapper — normalises errors and JSON parsing.
 */
async function apiRequest(endpoint, { method = 'GET', body = null, auth = false } = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: buildHeaders(auth, body !== null),
      body: body !== null ? JSON.stringify(body) : null
    });

    let data = null;
    try { data = await res.json(); } catch (_) { /* empty body */ }

    if (!res.ok) {
      const message = (data && (data.message || data.error)) || `अनुरोध विफल रहा (${res.status})`;
      throw new Error(message);
    }
    return data;
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error('सर्वर से कनेक्ट नहीं हो सका। कृपया अपना नेटवर्क जांचें।');
    }
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* News endpoints                                                      */
/* ------------------------------------------------------------------ */

export function getLatestNews() {
  return apiRequest('/news/latest');
}

export function getTrendingNews() {
  return apiRequest('/news/trending');
}

export function getFeaturedNews() {
  return apiRequest('/news/featured');
}

export function getPaginatedNews(page = 1, limit = 9) {
  return apiRequest(`/news/pagination?page=${page}&limit=${limit}`);
}

export function searchNews(keyword) {
  return apiRequest(`/news/search?keyword=${encodeURIComponent(keyword)}`);
}

export function getNewsByCategory(categoryId) {
  return apiRequest(`/news/category/${encodeURIComponent(categoryId)}`);
}

export function getNewsBySlug(slug) {
  return apiRequest(`/news/${encodeURIComponent(slug)}`);
}

export function getRelatedNews(id) {
  return apiRequest(`/news/related/${encodeURIComponent(id)}`);
}

export function likeNews(id) {
  return apiRequest(`/news/like/${encodeURIComponent(id)}`, { method: 'PUT', auth: true, body: {} });
}

export function rateNews(id, rating) {
  return apiRequest(`/news/rate/${encodeURIComponent(id)}`, { method: 'PUT', auth: true, body: { rating } });
}

export function getComments(id) {
  return apiRequest(`/news/${encodeURIComponent(id)}/comments`);
}

export function postComment(id, comment) {
  return apiRequest(`/news/${encodeURIComponent(id)}/comment`, { method: 'POST', auth: true, body: { comment } });
}

/* ------------------------------------------------------------------ */
/* Auth endpoints (assumed REST conventions on the same backend)       */
/* ------------------------------------------------------------------ */

export function loginRequest(credentials) {
  return apiRequest('/auth/login', { method: 'POST', body: credentials });
}

export function registerRequest(payload) {
  return apiRequest('/auth/register', { method: 'POST', body: payload });
}

 
export function getProfileRequest() {
  return apiRequest('/auth/me', {
    auth: true
  });
}

export function updateProfileRequest(payload) {
  return apiRequest('/auth/profile', { method: 'PUT', auth: true, body: payload });
}

/* ------------------------------------------------------------------ */
/* Bookmark sync (backend, in addition to localStorage)                */
/* ------------------------------------------------------------------ */

export function getBookmarksRequest() {
  return apiRequest('/bookmarks', { auth: true });
}

export function addBookmarkRequest(newsId) {
  return apiRequest('/bookmarks', { method: 'POST', auth: true, body: { newsId } });
}

export function removeBookmarkRequest(newsId) {
  return apiRequest(`/bookmarks/${encodeURIComponent(newsId)}`, { method: 'DELETE', auth: true });
}

 export function getNewsletterSubscribeRequest(email) {
  return apiRequest('/subscribers', {
    method: 'POST',
    body: { email }
  });
}


export function changePasswordRequest(currentPassword, newPassword) {

    return apiRequest("/auth/change-password", {

        method: "PUT",

        auth: true,

        body: {

            currentPassword,

            newPassword

        }

    });

}
