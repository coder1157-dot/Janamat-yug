const express = require("express");
const router = express.Router();

const News = require("../models/News");

router.get("/news/:slug", async (req, res) => {
    try {
        const news = await News.findOne({
            slug: req.params.slug
        }).populate("category", "name");

        if (!news) {
            return res.status(404).send("News not found");
        }

        const frontendURL =
            "https://janamat-yug-sandy.vercel.app";

        // IMPORTANT:
        // Change this to your DEPLOYED backend URL
        const backendURL =
            "https://janamat-yug-api.onrender.com";

        const newsURL =
            `${frontendURL}/news.html?slug=${encodeURIComponent(news.slug)}`;

        // Feature image
        let imageURL = news.coverImage || "";

        // If image is stored as /uploads/...
        if (imageURL.startsWith("/")) {
            imageURL = backendURL + imageURL;
        }

        // If DB contains only filename
        if (
            imageURL &&
            !imageURL.startsWith("http://") &&
            !imageURL.startsWith("https://")
        ) {
            imageURL =
                `${backendURL}/uploads/news/images/${imageURL}`;
        }

        const title = news.title || "जनमत युग";

        const description =
            news.shortDescription ||
            news.content?.replace(/<[^>]*>/g, "").substring(0, 160) ||
            "जनमत युग - निष्पक्ष और भरोसेमंद हिंदी समाचार";

        const escapedTitle = title
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        const escapedDescription = description
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        res.send(`
<!DOCTYPE html>
<html lang="hi">

<head>

    <meta charset="UTF-8">

    <title>${escapedTitle} | जनमत युग</title>

    <meta
        name="description"
        content="${escapedDescription}"
    >

    <!-- ================= OPEN GRAPH ================= -->

    <meta property="og:type" content="article">

    <meta
        property="og:title"
        content="${escapedTitle}"
    >

    <meta
        property="og:description"
        content="${escapedDescription}"
    >

    <meta
        property="og:image"
        content="${imageURL}"
    >

    <meta
        property="og:image:secure_url"
        content="${imageURL}"
    >

    <meta
        property="og:image:type"
        content="image/jpeg"
    >

    <meta
        property="og:image:width"
        content="1200"
    >

    <meta
        property="og:image:height"
        content="630"
    >

    <meta
        property="og:url"
        content="${newsURL}"
    >

    <meta
        property="og:site_name"
        content="जनमत युग"
    >

    <!-- ================= TWITTER ================= -->

    <meta
        name="twitter:card"
        content="summary_large_image"
    >

    <meta
        name="twitter:title"
        content="${escapedTitle}"
    >

    <meta
        name="twitter:description"
        content="${escapedDescription}"
    >

    <meta
        name="twitter:image"
        content="${imageURL}"
    >

    <link
        rel="canonical"
        href="${newsURL}"
    >

    <script>
        window.location.replace(
            ${JSON.stringify(newsURL)}
        );
    </script>

</head>

<body>

    <p>खबर लोड हो रही है...</p>

    <p>
        <a href="${newsURL}">
            खबर पढ़ने के लिए यहां क्लिक करें
        </a>
    </p>

</body>

</html>
        `);

    } catch (error) {

        console.error("Share route error:", error);

        res.status(500).send("Server Error");

    }
});

module.exports = router;