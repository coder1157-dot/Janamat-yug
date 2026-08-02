const express = require("express");

const router = express.Router();

const {

    createAd,

    getAds

} = require("../controllers/advertisementController");

router.post("/", createAd);

router.get("/", getAds);

module.exports = router;