const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    createNews,
    getAllNews,
    getSingleNews,
    updateNews,
    deleteNews,

     searchNews,
    getNewsPagination,
    getBreakingNews,
    getFeaturedNews,
    getTrendingNews,
    getLatestNews,
    getNewsByCategory

} = require("../controllers/newsController");

router.post("/", protect, createNews);

router.get("/", getAllNews);

router.get("/search", searchNews);

router.get("/pagination", getNewsPagination);

router.get("/breaking", getBreakingNews);

router.get("/featured", getFeaturedNews);

router.get("/trending", getTrendingNews);

router.get("/latest", getLatestNews);

router.get("/category/:categoryId", getNewsByCategory);

router.get("/:slug", getSingleNews);

router.put("/:id", protect, updateNews);

router.delete("/:id", protect, deleteNews);

module.exports = router;