const Subscriber = require("../models/Subscriber");

const subscribe = async (req, res) => {

    try {

        const { email } = req.body;

        const exists = await Subscriber.findOne({ email });

        if (exists) {

            return res.status(400).json({

                success: false,

                message: "Already subscribed"

            });

        }

        const subscriber = await Subscriber.create({

            email

        });

        res.status(201).json({

            success: true,

            subscriber

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getSubscribers = async (req, res) => {

    try {

        const subscribers = await Subscriber.find().sort({

            createdAt: -1

        });

        res.status(200).json({

            success: true,

            total: subscribers.length,

            subscribers

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

module.exports = {

    subscribe,

    getSubscribers

};