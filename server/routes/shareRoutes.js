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

        // =====================================================
        // FEATURE IMAGE
        // Your MongoDB field is coverImage
        // =====================================================

        let image = news.coverImage || "";

        if (image && !image.startsWith("http")) {

            image =
                `${BACKEND_URL}${image.startsWith("/") ? "" : "/"}${image}`;

        }

        // Fallback image
        if (!image) {
            image =
                `${FRONTEND_URL}/assets/images/default-news.jpg`;
        }

        // =====================================================
        // NEWS DATA
        // =====================================================

        const title =
            news.title || "जनमत युग";

        const description =
            news.shortDescription ||
            news.content?.replace(/<[^>]*>/g, "").slice(0, 200) ||
            "जनमत युग हिंदी समाचार पोर्टल";

        // =====================================================
        // ACTUAL FRONTEND ARTICLE URL
        // =====================================================

        const articleUrl =
            `${FRONTEND_URL}/news.html?slug=${encodeURIComponent(slug)}`;

        // =====================================================
        // HTML FOR SOCIAL CRAWLERS
        // =====================================================

        const html = `
<!DOCTYPE html>
<html lang="hi">

<head>

    <meta charset="UTF-8">

    <title>${escapeHtml(title)}</title>

    <meta
        name="description"
        content="${escapeHtml(description)}"
    >

    <!-- Open Graph -->

    <meta
        property="og:type"
        content="article"
    >

    <meta
        property="og:title"
        content="${escapeHtml(title)}"
    >

    <meta
        property="og:description"
        content="${escapeHtml(description)}"
    >

    <meta
        property="og:image"
        content="${escapeHtml(image)}"
    >

    <meta
        property="og:url"
        content="${escapeHtml(articleUrl)}"
    >

    <meta
        property="og:site_name"
        content="जनमत युग"
    >

    <!-- Twitter -->

    <meta
        name="twitter:card"
        content="summary_large_image"
    >

    <meta
        name="twitter:title"
        content="${escapeHtml(title)}"
    >

    <meta
        name="twitter:description"
        content="${escapeHtml(description)}"
    >

    <meta
        name="twitter:image"
        content="${escapeHtml(image)}"
    >

    <!-- Redirect user to actual article -->

    <meta
        http-equiv="refresh"
        content="0;url=${escapeHtml(articleUrl)}"
    >

</head>

<body>

    <p>
        समाचार खोला जा रहा है...
    </p>

    <p>
        <a href="${escapeHtml(articleUrl)}">
            समाचार पढ़ने के लिए क्लिक करें
        </a>
    </p>

</body>

</html>
`;

        res.status(200).send(html);

    } catch (error) {

        console.error("Share route error:", error);

        res.status(500).send("Unable to generate share page");

    }

});


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHtml(str = "") {

    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

module.exports = router;
