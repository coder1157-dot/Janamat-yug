 const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create upload folders automatically
const folders = [
    "uploads/news/images",
    "uploads/news/gallery",
    "uploads/news/videos",
    "uploads/news/thumbnails"
];

folders.forEach(folder => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
});

// Storage
const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        switch (file.fieldname) {

            case "coverImage":
                cb(null, "uploads/news/images");
                break;

            case "gallery":
                cb(null, "uploads/news/gallery");
                break;

            case "video":
                cb(null, "uploads/news/videos");
                break;

            case "videoThumbnail":
                cb(null, "uploads/news/thumbnails");
                break;

            default:
                cb(null, "uploads/news/images");
        }
    },

    filename: (req, file, cb) => {

        const fileName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1000000) +
            path.extname(file.originalname);

        cb(null, fileName);
    }

});

// File Filter
const fileFilter = (req, file, cb) => {

    const allowedTypes = [

        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",

        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/quicktime"

    ];

    if (allowedTypes.includes(file.mimetype)) {

        cb(null, true);

    } else {

        cb(new Error("Only Images & Videos are allowed"), false);

    }

};

const upload = multer({

    storage,
    fileFilter,

    limits: {
        fileSize: 100 * 1024 * 1024
    }

});

module.exports = upload;