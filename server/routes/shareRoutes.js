 const express = require("express");
const router = express.Router();
const News = require("../models/News");

const SERVER_URL =
  process.env.SERVER_BASE_URL ||
  "https://janamat-yug-63q8.onrender.com";

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "https://janamat-yug-sandy.vercel.app";

router.get("/news/:slug", async (req, res) => {
  try {
    const news = await News.findOne({
      slug: req.params.slug,
      status: "published"
    });

    if (!news) {
      return res.status(404).send("News Not Found");
    }

    // Relative image path -> absolute URL
    const imageUrl = news.coverImage
      ? `${SERVER_URL}${news.coverImage}`
      : `${FRONTEND_URL}/images/logo.png`;

    const title = news.metaTitle || news.title || "Janamat Yug";

    const description =
      news.metaDescription ||
      news.shortDescription ||
      "जनमत युग — हर खबर जनता की आवाज";

    const finalUrl =
      `${FRONTEND_URL}/news.html?slug=${encodeURIComponent(news.slug)}`;

    const escapeHtml = (str = "") =>
      String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    res.set("Cache-Control", "no-store");

    res.send(`
<!DOCTYPE html>
<html lang="hi">
<head>

<meta charset="UTF-8">

<title>${escapeHtml(title)} | जनमत युग</title>

<meta name="description"
      content="${escapeHtml(description)}">

<!-- OPEN GRAPH -->
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(imageUrl)}">
<meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${escapeHtml(req.protocol + "://" + req.get("host") + req.originalUrl)}">
<meta property="og:site_name" content="Janamat Yug">

<!-- TWITTER / WHATSAPP COMPATIBILITY -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(imageUrl)}">

<meta http-equiv="refresh"
      content="0;url=${escapeHtml(finalUrl)}">

</head>

<body>

<p>समाचार लोड हो रहा है...</p>

<p>
<a href="${escapeHtml(finalUrl)}">
समाचार पढ़ें
</a>
</p>

</body>
</html>
    `);

  } catch (error) {

    console.error("SHARE NEWS ERROR:", error);

    res.status(500).send("Server Error");
  }
});

module.exports = router;
