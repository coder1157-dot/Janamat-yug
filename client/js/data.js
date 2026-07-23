/* ==========================================================================
   JANAMAT YUG — DATA LAYER (js/data.js)
   Mock data + a thin "API" wrapper. Every function returns a Promise, mirroring
   what a real fetch() call to a Node/Express + MongoDB backend would return.
   When the real backend is ready, replace the body of each JY_API.* function
   with an actual fetch() call — no page-level JS needs to change.
   ========================================================================== */

(function (global) {
  "use strict";

  const CATEGORIES = [
    { slug: "national", name: "National", desc: "Top stories from across the nation." },
    { slug: "world", name: "World", desc: "Global affairs and international dispatches." },
    { slug: "politics", name: "Politics", desc: "Policy, parliament and the corridors of power." },
    { slug: "business", name: "Business", desc: "Markets, startups and the Indian economy." },
    { slug: "sports", name: "Sports", desc: "Cricket, football and every scoreboard that matters." },
    { slug: "entertainment", name: "Entertainment", desc: "Bollywood, OTT and pop culture." },
    { slug: "technology", name: "Technology", desc: "Gadgets, startups and the digital shift." },
    { slug: "health", name: "Health", desc: "Wellness, medicine and public health." }
  ];

  const AUTHORS = ["Ritu Sharma", "Aman Verma", "Priya Nair", "Karan Mehta", "Sana Qureshi", "Devendra Rao"];

  const IMG = (seed) => `https://picsum.photos/seed/jy${seed}/800/500`;

  function titleFor(cat, i) {
    const bank = {
      national: ["Parliament Passes New Infrastructure Bill", "Monsoon Session Sees Heated Debate", "Supreme Court Verdict on Land Reform Awaited", "New Metro Line Opens in Tier-2 City", "Census Data Reveals Urban Migration Trend"],
      world: ["Global Summit Ends With Climate Pledge", "Trade Talks Resume Between Key Blocs", "Election Results Reshape Regional Alliance", "UN Session Debates Refugee Policy", "Currency Markets React to Rate Decision"],
      politics: ["Opposition Demands Special Session", "State Elections: Key Seats to Watch", "Cabinet Reshuffle Signals Policy Shift", "New Alliance Formed Ahead of Polls", "Budget Session Priorities Unveiled"],
      business: ["Sensex Hits Fresh Record on IT Rally", "Startup Raises Series B Funding Round", "RBI Holds Repo Rate Steady", "Retail Inflation Eases to Six-Month Low", "Manufacturing PMI Signals Steady Growth"],
      sports: ["India Seals Series Win in Final Over", "Young Paddler Stuns Seeded Rival", "League Table Tightens Ahead of Finals", "National Team Announces Squad for Tour", "Marathon Sets New City Participation Record"],
      entertainment: ["Festival Opener Draws Record Crowds", "Streaming Series Tops Weekly Charts", "Veteran Actor Announces Comeback Project", "Music Awards Shortlist Announced", "Biopic Trailer Sparks Online Buzz"],
      technology: ["Local Startup Unveils AI Farming Tool", "Smartphone Maker Launches Budget Series", "Digital Payments Cross New Milestone", "State Rolls Out E-Governance Portal", "Chipmaker Announces India Investment"],
      health: ["Health Ministry Launches Vaccination Drive", "Study Links Air Quality to Respiratory Cases", "New Wellness Policy for Government Staff", "Hospitals Report Rise in Seasonal Flu", "Nutrition Programme Expands to Rural Schools"]
    };
    const arr = bank[cat.slug] || ["Untitled Report"];
    return arr[i % arr.length];
  }

  function paraFor(cat) {
    return [
      `Officials confirmed the development on Wednesday, noting that the ${cat.name.toLowerCase()} sector has seen consistent movement over the past quarter. Stakeholders described the update as significant, with more clarity expected as further details are released in the coming days.`,
      `Analysts tracking the ${cat.name.toLowerCase()} beat say the timing of this development is notable, coming amid broader shifts that have kept observers watching closely. Several regional voices have already weighed in, offering a mix of cautious optimism and calls for careful follow-through.`,
      `Speaking to Janamat Yug, a senior representative said the coming weeks would be crucial in determining how this story unfolds. Ground reports from multiple correspondents suggest the situation is being closely monitored by both authorities and the public.`,
      `The story continues to develop, and Janamat Yug will keep tracking updates as they emerge, with verified sources and on-record statements prioritised over speculation.`
    ].join("\n\n");
  }

  const NEWS = [];
  let id = 1;
  CATEGORIES.forEach((cat, ci) => {
    for (let i = 0; i < 6; i++) {
      const daysAgo = i + ci * 2;
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      NEWS.push({
        id: id,
        title: titleFor(cat, i),
        slug: `${cat.slug}-story-${i + 1}`,
        category: cat.name,
        categorySlug: cat.slug,
        author: AUTHORS[(ci + i) % AUTHORS.length],
        date: d.toISOString().slice(0, 10),
        image: IMG(id),
        excerpt: `A quick look at how ${titleFor(cat, i).toLowerCase()} is shaping the ${cat.name.toLowerCase()} landscape this week.`,
        body: paraFor(cat),
        comments: [
          { name: "Rohit Kumar", text: "Well reported. Would like to see a follow-up on this.", date: "2 days ago" },
          { name: "Anjali Singh", text: "This has been developing for a while, glad it's finally covered.", date: "1 day ago" }
        ]
      });
      id++;
    }
  });

  const USERS = [
    { id: 1, name: "Tarun Sharma", email: "tarun@example.com", mobile: "9876543210", role: "Admin", status: "Active", joined: "2025-11-02" },
    { id: 2, name: "Neha Gupta", email: "neha@example.com", mobile: "9123456780", role: "Editor", status: "Active", joined: "2025-12-14" },
    { id: 3, name: "Sameer Khan", email: "sameer@example.com", mobile: "9988776655", role: "Reader", status: "Blocked", joined: "2026-01-20" },
    { id: 4, name: "Pooja Rani", email: "pooja@example.com", mobile: "9012345678", role: "Reader", status: "Active", joined: "2026-02-03" }
  ];

  const delay = (v, ms = 250) => new Promise((res) => setTimeout(() => res(v), ms));

  const JY_API = {
    getCategories() { return delay(CATEGORIES); },
    getAllNews() { return delay(NEWS); },
    getNewsById(newsId) { return delay(NEWS.find(n => String(n.id) === String(newsId)) || null); },
    getNewsByCategory(slug) { return delay(NEWS.filter(n => n.categorySlug === slug)); },
    getRelated(newsId, categorySlug, limit = 4) {
      return delay(NEWS.filter(n => n.categorySlug === categorySlug && String(n.id) !== String(newsId)).slice(0, limit));
    },
    getUsers() { return delay(USERS); },
    getTrending(limit = 5) { return delay([...NEWS].slice(0, limit)); },
    searchNews(q) {
      const term = (q || "").toLowerCase();
      return delay(NEWS.filter(n => n.title.toLowerCase().includes(term) || n.category.toLowerCase().includes(term)));
    }
  };

  // -------------------- LocalStorage-backed session / bookmarks / comments --------------------
  const LS = {
    SESSION: "jy_session",
    USERS_DB: "jy_users_db",
    BOOKMARKS: "jy_bookmarks",
    COMMENTS: "jy_comments_extra",
    PROFILE: "jy_profile"
  };

  function readJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (e) { return fallback; }
  }
  function writeJSON(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  const JY_STORE = {
    // ---- users (register/login) ----
    getUsersDB() { return readJSON(LS.USERS_DB, []); },
    saveUser(user) {
      const db = JY_STORE.getUsersDB();
      db.push(user);
      writeJSON(LS.USERS_DB, db);
    },
    findUser(email) {
      return JY_STORE.getUsersDB().find(u => u.email.toLowerCase() === String(email).toLowerCase());
    },

    // ---- session ----
    setSession(user, remember) {
      const payload = { name: user.name, email: user.email, mobile: user.mobile || "", loggedInAt: Date.now() };
      writeJSON(LS.SESSION, payload);
      if (remember) localStorage.setItem("jy_remember_email", user.email);
      else localStorage.removeItem("jy_remember_email");
    },
    getSession() { return readJSON(LS.SESSION, null); },
    clearSession() { localStorage.removeItem(LS.SESSION); },
    getRememberedEmail() { return localStorage.getItem("jy_remember_email") || ""; },

    // ---- profile edits (name/photo) layered on top of session ----
    getProfile() {
      const session = JY_STORE.getSession();
      const extra = readJSON(LS.PROFILE, {});
      return Object.assign({ name: "Guest Reader", email: "guest@example.com", mobile: "", photo: "" }, session, extra);
    },
    saveProfile(data) { writeJSON(LS.PROFILE, data); },

    // ---- bookmarks ----
    getBookmarks() { return readJSON(LS.BOOKMARKS, []); },
    isBookmarked(newsId) { return JY_STORE.getBookmarks().includes(Number(newsId)); },
    toggleBookmark(newsId) {
      newsId = Number(newsId);
      let list = JY_STORE.getBookmarks();
      if (list.includes(newsId)) list = list.filter(id => id !== newsId);
      else list.push(newsId);
      writeJSON(LS.BOOKMARKS, list);
      return list.includes(newsId);
    },

    // ---- extra comments added via UI ----
    getExtraComments(newsId) {
      const all = readJSON(LS.COMMENTS, {});
      return all[newsId] || [];
    },
    addComment(newsId, comment) {
      const all = readJSON(LS.COMMENTS, {});
      all[newsId] = all[newsId] || [];
      all[newsId].push(comment);
      writeJSON(LS.COMMENTS, all);
    }
  };

  global.JY_API = JY_API;
  global.JY_STORE = JY_STORE;
})(window);
