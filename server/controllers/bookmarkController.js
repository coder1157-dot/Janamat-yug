const Bookmark = require("../models/Bookmark");

const addBookmark = async (req, res) => {

    try {

        const { newsId } = req.body;

        const exists = await Bookmark.findOne({

            user: req.user.id,

            news: newsId

        });

        if (exists) {

            return res.status(400).json({

                success: false,

                message: "Already Bookmarked"

            });

        }

        const bookmark = await Bookmark.create({

            user: req.user.id,

            news: newsId

        });

        res.status(201).json({

            success: true,

            bookmark

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getBookmarks = async (req, res) => {

    try {

        const bookmarks = await Bookmark.find({

            user: req.user.id

        }).populate("news");

        res.status(200).json({

            success: true,

            total: bookmarks.length,

            bookmarks

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const removeBookmark = async (req, res) => {

    try {

        await Bookmark.findByIdAndDelete(req.params.id);

        res.status(200).json({

            success: true,

            message: "Bookmark Removed"

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

module.exports = {

    addBookmark,

    getBookmarks,

    removeBookmark

};