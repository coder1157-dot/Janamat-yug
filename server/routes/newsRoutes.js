 const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const upload = require("../middleware/upload");

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
    getNewsByCategory,
    getRelatedNews,
    likeNews,
    rateNews

} = require("../controllers/newsController");

  router.post(
    "/",
    protect,
    upload.fields([
        {
            name: "coverImage",
            maxCount: 1
        },
        {
            name: "gallery",
            maxCount: 10
        },
        {
            name: "video",
            maxCount: 1
        },
        {
            name: "videoThumbnail",
            maxCount: 1
        }
    ]),
    createNews
);

router.get("/", getAllNews);

router.get("/search", searchNews);

router.get("/pagination", getNewsPagination);

router.get("/breaking", getBreakingNews);

router.get("/featured", getFeaturedNews);

router.get("/trending", getTrendingNews);

router.get("/latest", getLatestNews);

router.get("/category/:categoryId", getNewsByCategory);

router.get("/search", searchNews);

router.get("/related/:id", getRelatedNews);

router.put("/like/:id", protect, likeNews);

router.put("/rate/:id", protect, rateNews);

router.get("/:slug", getSingleNews);

router.put("/:id", protect, updateNews);

router.delete("/:id", protect, deleteNews);





module.exports = router;