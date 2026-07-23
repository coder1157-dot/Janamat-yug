const News = require("../models/News");
const slugify = require("slugify");

// Create News
const createNews = async (req, res) => {
    try {

        const {
            title,
            shortDescription,
            content,
            category,
            image,
            isBreaking,
            isFeatured,
            status
        } = req.body;

        const news = await News.create({
            title,
            slug: slugify(title, { lower: true }),
            shortDescription,
            content,
            category,
            image,
            author: req.user.id,
            isBreaking,
            isFeatured,
            status
        });

        res.status(201).json({
            success: true,
            message: "News Created Successfully",
            news
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const getAllNews = async (req, res) => {

    try {

        const news = await News.find()
            .populate("category")
            .populate("author", "fullName email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: news.length,
            news
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const getSingleNews = async (req, res) => {

    try {

        const news = await News.findOne({
            slug: req.params.slug
        })
        .populate("category")
        .populate("author","fullName");

        if(!news){
            return res.status(404).json({
                success:false,
                message:"News Not Found"
            });
        }

        news.views += 1;

        await news.save();

        res.status(200).json({
            success:true,
            news
        });

    } catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};

const updateNews = async (req,res)=>{

    try{

        const news = await News.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true}
        );

        res.status(200).json({
            success:true,
            message:"News Updated",
            news
        });

    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};

const deleteNews = async(req,res)=>{

    try{

        await News.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success:true,
            message:"News Deleted Successfully"
        });

    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};

const searchNews = async (req, res) => {
    try {

        const keyword = req.query.keyword || "";

        const news = await News.find({
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { shortDescription: { $regex: keyword, $options: "i" } },
                { content: { $regex: keyword, $options: "i" } }
            ]
        })
        .populate("category")
        .populate("author", "fullName");

        res.status(200).json({
            success: true,
            count: news.length,
            news
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const getNewsPagination = async (req, res) => {

    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const totalNews = await News.countDocuments();

        const news = await News.find()
            .populate("category")
            .populate("author", "fullName")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({

            success: true,

            currentPage: page,

            totalPages: Math.ceil(totalNews / limit),

            totalNews,

            news

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getBreakingNews = async (req, res) => {

    try {

        const news = await News.find({
            isBreaking: true
        })
        .populate("category")
        .sort({ createdAt: -1 });

        res.status(200).json({

            success: true,

            news

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getFeaturedNews = async (req, res) => {

    try {

        const news = await News.find({
            isFeatured: true
        })
        .populate("category")
        .sort({ createdAt: -1 });

        res.status(200).json({

            success: true,

            news

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getTrendingNews = async (req, res) => {

    try {

        const news = await News.find()
            .sort({ views: -1 })
            .limit(10);

        res.status(200).json({

            success: true,

            news

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getLatestNews = async (req, res) => {

    try {

        const news = await News.find()
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({

            success: true,

            news

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getNewsByCategory = async (req, res) => {

    try {

        const news = await News.find({
            category: req.params.categoryId
        })
        .populate("category")
        .populate("author", "fullName");

        res.status(200).json({

            success: true,

            count: news.length,

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
};