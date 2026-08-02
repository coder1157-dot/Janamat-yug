const express = require("express");

const router = express.Router();

const News = require("../models/News");

router.get("/sitemap", async (req, res) => {

    const news = await News.find();

    res.json({

        total: news.length,

        news

    });

});

module.exports = router;