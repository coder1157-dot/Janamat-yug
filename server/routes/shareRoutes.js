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
        // FEATURE / COVER IMAGE
        // =========================

        let image = news.image || news.coverImage || "";

        if (image && !image.startsWith("http")) {
            image = `${BACKEND_URL}${image.startsWith("/") ? "" : "/"}${image}`;
        }

        // Fallback image
        if (!image) {
            image = `${FRONTEND_URL}/assets/images/default-news.jpg`;
        }

        // =========================
        // NEWS DATA
        // =========================

        const title = news.title || "जनमत युग";

        const description =
            news.shortDescription ||
            news.description ||
            "जनमत युग हिंदी समाचार पोर्टल";

        const articleUrl =
            `${FRONTEND_URL}/news.html?slug=${encodeURIComponent(slug)}`;

        // =========================
        // SHARE PREVIEW HTML
        // =========================

        res.send(`
<!DOCTYPE html>
<html lang="hi">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>${escapeHtml(title)}</title>

<meta name="description"
      content="${escapeHtml(description)}">

<!-- ========================= -->
<!-- OPEN GRAPH / FACEBOOK -->
<!-- ========================= -->

<meta property="og:type" content="article">

<meta property="og:title"
      content="${escapeHtml(title)}">

<meta property="og:description"
      content="${escapeHtml(description)}">

<meta property="og:image"
      content="${image}">

<meta property="og:image:secure_url"
      content="${image}">

<meta property="og:image:type"
      content="image/jpeg">

<meta property="og:image:width"
      content="1200">

<meta property="og:image:height"
      content="630">

<meta property="og:url"
      content="${articleUrl}">

<meta property="og:site_name"
      content="जनमत युग">


<!-- ========================= -->
<!-- TWITTER / X -->
<!-- ========================= -->

<meta name="twitter:card"
      content="summary_large_image">

<meta name="twitter:title"
      content="${escapeHtml(title)}">

<meta name="twitter:description"
      content="${escapeHtml(description)}">

<meta name="twitter:image"
      content="${image}">

<meta name="twitter:url"
      content="${articleUrl}">


<style>

body {
    margin: 0;
    padding: 30px;
    font-family: Arial, sans-serif;
    background: #f5f5f5;
}

.container {
    max-width: 800px;
    margin: auto;
    background: white;
    padding: 25px;
    border-radius: 12px;
}

img {
    width: 100%;
    max-height: 450px;
    object-fit: cover;
    border-radius: 10px;
}

h1 {
    margin-top: 20px;
}

p {
    color: #555;
    line-height: 1.6;
}

</style>

</head>

<body>

<div class="container">

    <img
        src="${image}"
        alt="${escapeHtml(title)}"
    >

    <h1>${escapeHtml(title)}</h1>

    <p>${escapeHtml(description)}</p>

    <p>
        जनमत युग पर पूरा समाचार पढ़ने के लिए
        <a href="${articleUrl}">
            यहां क्लिक करें
        </a>
    </p>

</div>


<script>

// User ko actual frontend article par bhejo
setTimeout(() => {
    window.location.href = ${JSON.stringify(articleUrl)};
}, 1500);

</script>

</body>

</html>
        `);

    } catch (error) {

        console.error("Share route error:", error);

        res.status(500).send("Unable to generate share page");

    }
});


// =========================
// HTML ESCAPE
// =========================

function escapeHtml(str = "") {

    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

module.exports = router;
