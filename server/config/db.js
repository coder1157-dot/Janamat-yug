const mongoose = require("mongoose");

const connectDB = async () => {
    try {

        const conn = await mongoose.connect(process.env.MONGO_URI);
 console.log("✅ MongoDB Connected");
console.log("Host:", conn.connection.host);
console.log("Database:", conn.connection.name);
console.log("URI:", process.env.MONGO_URI);

    } catch (error) {

        console.error("❌ MongoDB Connection Error");

        console.log(error.message);

        process.exit(1);

    }
};

module.exports = connectDB;