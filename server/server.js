const app = require("./app");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

// Connect Database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`🚀 Janamat Yug Server Running on Port ${PORT}`);

});