

const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const generateToken = require("../utils/generateToken");


// Register User

const registerUser = async (req, res) => {
    try {
              console.log("========== REGISTER ==========");
        console.log(req.headers);
        console.log(req.body);
        const { fullName, email, password, mobile } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All required fields are mandatory"
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Email"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            mobile,
        });

        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            message: "Registration Successful",
            token,
            user,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// Login User

const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid Password"
            });
        }

        const token = generateToken(user._id, user.role);

        res.status(200).json({
            success: true,
            message: "Login Successful",
            token,
            user
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
exports.forgotPassword = async (req,res)=>{

    try{

        const {email}=req.body;

        const user=await User.findOne({email});

        if(!user){

            return res.status(404).json({

                success:false,

                message:"User not found"

            });

        }

        const resetToken=crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken=resetToken;

        user.resetPasswordExpire=Date.now()+15*60*1000;

        await user.save();

        res.json({

            success:true,

            resetToken

        });

    }

    catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};

exports.resetPassword=async(req,res)=>{

    try{

        const {token}=req.params;

        const {password}=req.body;

        const user=await User.findOne({

            resetPasswordToken:token,

            resetPasswordExpire:{

                $gt:Date.now()

            }

        });

        if(!user){

            return res.status(400).json({

                success:false,

                message:"Token Invalid"

            });

        }

        user.password=password;

        user.resetPasswordToken=null;

        user.resetPasswordExpire=null;

        await user.save();

        res.json({

            success:true,

            message:"Password Updated"

        });

    }

    catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};

exports.getMyProfile = async (req, res) => {

    try {

        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

 exports.updateProfile = async (req, res) => {
  try {

    const { fullName, mobile } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found"
      });
    }

    if (fullName !== undefined) {

      const cleanName = fullName.trim();

      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty"
        });
      }

      user.fullName = cleanName;
    }

    if (mobile !== undefined) {
      user.mobile = mobile.trim();
    }

    await user.save();

    const updatedUser = await User.findById(req.user.id)
      .select("-password -resetPasswordToken -resetPasswordExpire");

    res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      user: updatedUser
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
exports.changePassword = async (req, res) => {
    console.log("===== CHANGE PASSWORD API =====");
  try {

     
    console.log(req.body);

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    console.log("User:", user.email);

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    console.log("Password Match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current Password is Incorrect"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    console.log("Password Updated Successfully");

    res.status(200).json({
      success: true,
      message: "Password Changed Successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
  
module.exports = {
    registerUser,
    loginUser,
    forgotPassword: exports.forgotPassword,
    resetPassword: exports.resetPassword,
     getMyProfile: exports.getMyProfile,
  updateProfile: exports.updateProfile,
  changePassword: exports.changePassword
};

