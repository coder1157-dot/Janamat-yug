const Notification = require("../models/Notification");

// ==============================
// Create Notification (Admin)
// ==============================

exports.createNotification = async (req, res) => {
    try {

        const { title, message, news, user } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: "Title and Message are required"
            });
        }

        const notification = await Notification.create({
            title,
            message,
            news,
            user
        });

        res.status(201).json({
            success: true,
            message: "Notification Created Successfully",
            notification
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// ==============================
// Get Notifications
// ==============================

exports.getNotifications = async (req, res) => {

    try {

        const notifications = await Notification.find()
            .populate("news", "title slug")
            .populate("user", "fullName email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            total: notifications.length,
            notifications
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// ==============================
// Mark Notification as Read
// ==============================

exports.markAsRead = async (req, res) => {

    try {

        const notification = await Notification.findById(req.params.id);

        if (!notification) {

            return res.status(404).json({
                success: false,
                message: "Notification Not Found"
            });

        }

        notification.isRead = true;

        await notification.save();

        res.status(200).json({
            success: true,
            message: "Notification Marked as Read",
            notification
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// ==============================
// Delete Notification
// ==============================

exports.deleteNotification = async (req, res) => {

    try {

        const notification = await Notification.findById(req.params.id);

        if (!notification) {

            return res.status(404).json({
                success: false,
                message: "Notification Not Found"
            });

        }

        await notification.deleteOne();

        res.status(200).json({
            success: true,
            message: "Notification Deleted Successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};