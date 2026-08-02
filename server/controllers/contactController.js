const Contact = require("../models/Contact");

// Send Message

exports.sendMessage = async (req,res)=>{

    try{

        const contact = await Contact.create(req.body);

        res.status(201).json({

            success:true,

            contact

        });

    }

    catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};


// Get All Messages

exports.getMessages = async(req,res)=>{

    const messages = await Contact.find().sort({createdAt:-1});

    res.json({

        success:true,

        total:messages.length,

        messages

    });

};


// Change Status

exports.changeStatus = async(req,res)=>{

    const message = await Contact.findByIdAndUpdate(

        req.params.id,

        {

            status:req.body.status

        },

        {

            new:true

        }

    );

    res.json({

        success:true,

        message

    });

};


// Delete

exports.deleteMessage = async(req,res)=>{

    await Contact.findByIdAndDelete(req.params.id);

    res.json({

        success:true,

        message:"Deleted"

    });

};

const nodemailer = require("nodemailer");

exports.sendContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "tarunsingh925954@gmail.com",
      subject: `New Contact Message from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>

        <p><b>Name:</b> ${name}</p>

        <p><b>Email:</b> ${email}</p>

        <p><b>Message:</b></p>

        <p>${message}</p>
      `
    });

    res.json({
      success: true,
      message: "Message Sent Successfully"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
};