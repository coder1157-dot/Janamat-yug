const User = require("../models/User");
const News = require("../models/News");
const Category = require("../models/Category");
const Comment = require("../models/Comment");

const getDashboard = async (req, res) => {

    try {

        const totalUsers = await User.countDocuments();

        const totalNews = await News.countDocuments();

        const totalCategories = await Category.countDocuments();

        const totalComments = await Comment.countDocuments();

        const breakingNews = await News.countDocuments({
            isBreaking: true
        });

        const featuredNews = await News.countDocuments({
            isFeatured: true
        });

        const totalViews = await News.aggregate([
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$views"
                    }
                }
            }
        ]);

        const today = new Date();

        today.setHours(0,0,0,0);

        const todaysNews = await News.countDocuments({

            createdAt: {

                $gte: today

            }

        });

        res.status(200).json({

            success:true,

            dashboard:{

                totalUsers,

                totalNews,

                totalCategories,

                totalComments,

                breakingNews,

                featuredNews,

                totalViews:

                    totalViews.length>0

                    ?

                    totalViews[0].total

                    :

                    0,

                todaysNews

            }

        });

    }

    catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};

const getAllUsers = async (req, res) => {

    try {

        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({

            success: true,

            total: users.length,

            users

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const changeUserRole = async (req, res) => {

    try {

        const { role } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }

        user.role = role;

        await user.save();

        res.status(200).json({

            success: true,

            message: "Role Updated",

            user

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const deleteUser = async (req, res) => {

    try {

        const user = await User.findById(req.params.id);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }

        await user.deleteOne();

        res.status(200).json({

            success: true,

            message: "User Deleted"

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getAllNewsAdmin = async (req, res) => {

    try {

        const news = await News.find()
            .populate("author", "fullName email")
            .populate("category", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            total: news.length,
            news
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const changeNewsStatus = async (req, res) => {

    try {

        const { status } = req.body;

        const news = await News.findById(req.params.id);

        if (!news) {

            return res.status(404).json({
                success: false,
                message: "News not found"
            });

        }

        news.status = status;

        await news.save();

        res.status(200).json({

            success: true,

            message: "News status updated",

            news

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const toggleFeatured = async (req, res) => {

    try {

        const news = await News.findById(req.params.id);

        if (!news) {

            return res.status(404).json({
                success: false,
                message: "News not found"
            });

        }

        news.isFeatured = !news.isFeatured;

        await news.save();

        res.status(200).json({

            success: true,

            message: "Featured Updated",

            news

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const toggleBreaking = async (req, res) => {

    try {

        const news = await News.findById(req.params.id);

        if (!news) {

            return res.status(404).json({
                success: false,
                message: "News not found"
            });

        }

        news.isBreaking = !news.isBreaking;

        await news.save();

        res.status(200).json({

            success: true,

            message: "Breaking Updated",

            news

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

module.exports = {

    getDashboard,

    getAllUsers,

    changeUserRole,

    deleteUser,

    getAllNewsAdmin,

    changeNewsStatus,

    toggleFeatured,

    toggleBreaking

};

module.exports = {

    getDashboard,
    getAllUsers,

    changeUserRole,

    deleteUser,

    getAllNewsAdmin,

    changeNewsStatus,

    toggleFeatured,

    toggleBreaking

};