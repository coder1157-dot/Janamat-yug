 const express = require("express");
const router = express.Router();

const News = require("../models/News");

const FRONTEND_URL = "https://janamat-yug-sandy.vercel.app";
const BACKEND_URL = "https://janamat-yug-63q8.onrender.com";

router.get("/news/:slug", async (req, res) => {
    try {
        const { slug } = req.params;

        const news = await News.findOne({ slug }).lean();

        if (!news) {
            return res.status(404).send("News not found");
        }

        // =========================
        // FEATURE IMAGE
        // =========================

        let image = news.featuredImage || news.image || "";

        if (image && !image.startsWith("http")) {
            image = `${BACKEND_URL}${image.startsWith("/") ? "" : "/"}${image}`;
        }

        // fallback image
        if (!image) {
            image = `${FRONTEND_URL}/assets/images/default-news.jpg`;
        }

        // =========================
        // TITLE
        // =========================

        const title = news.title || "जनमत युग";

        const description =
            news.subtitle ||
            news.description ||
            "जनमत युग हिंदी समाचार पोर्टल";

        // Actual frontend article URL
        const articleUrl =
            `${FRONTEND_URL}/news.html?slug=${encodeURIComponent(slug)}`;

        // =========================
        // OG HTML
        // =========================

        res.send(`
<!DOCTYPE html>
<html lang="hi">
<head>

<meta charset="UTF-8">

<title>${escapeHtml(title)}</title>

<meta name="description" content="${escapeHtml(description)}">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${image}">
<meta property="og:image:secure_url" content="${image}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${articleUrl}">
<meta property="og:site_name" content="जनमत युग">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${image}">

<link rel="canonical" href="${articleUrl}">

</head>

<body>

<h1>${escapeHtml(title)}</h1>

<p>${escapeHtml(description)}</p>

<img
    src="${image}"
    alt="${escapeHtml(title)}"
    style="max-width:100%;"
>

<p>
    <a href="${articleUrl}">
        समाचार पढ़ें
    </a>
</p>

<script>
    window.location.replace(${JSON.stringify(articleUrl)});
</script>

</body>
</html>
        `);

    } catch (error) {

        console.error("Share route error:", error);

        res.status(500).send("Unable to generate share page");

    }
});


// Prevent HTML injection
function escapeHtml(str = "") {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

module.exports = router;
