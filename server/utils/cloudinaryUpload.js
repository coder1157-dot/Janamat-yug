const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `janamat-yug/${folder}`,
      resource_type: "auto"
    });

    // Cloudinary par upload hone ke baad local file delete
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return result.secure_url;

  } catch (error) {

    // Agar Cloudinary upload fail ho jaye
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    throw error;
  }
};

module.exports = uploadToCloudinary;