const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadImage = async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "Please select an image"
            });

        }

        const streamUpload = () => {

            return new Promise((resolve, reject) => {

                const stream = cloudinary.uploader.upload_stream(

                    {
                        folder: "janamat-yug"
                    },

                    (error, result) => {

                        if (result) resolve(result);

                        else reject(error);

                    }

                );

                streamifier.createReadStream(req.file.buffer).pipe(stream);

            });

        };

        const result = await streamUpload();

        res.status(200).json({

            success: true,

            imageUrl: result.secure_url,

            public_id: result.public_id

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

module.exports = {

    uploadImage

};