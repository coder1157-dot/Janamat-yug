const Advertisement = require("../models/Advertisement");

// Create Ad
exports.createAd = async (req, res) => {

    try {

        const ad = await Advertisement.create(req.body);

        res.status(201).json({
            success: true,
            ad
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Get All Ads
exports.getAds = async (req, res) => {

    const ads = await Advertisement.find();

    res.json({

        success: true,

        ads

    });

};