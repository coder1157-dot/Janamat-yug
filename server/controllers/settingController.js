const Setting = require("../models/Setting");

// Get Website Settings
exports.getSettings = async (req, res) => {
    try {

        let settings = await Setting.findOne();

        if (!settings) {
            settings = await Setting.create({});
        }

        res.status(200).json({
            success: true,
            settings
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Update Website Settings
exports.updateSettings = async (req, res) => {

    try {

        let settings = await Setting.findOne();

        if (!settings) {
            settings = await Setting.create({});
        }

        settings = await Setting.findByIdAndUpdate(
            settings._id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            message: "Website Settings Updated Successfully",
            settings
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};