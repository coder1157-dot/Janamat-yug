const app = require("./app");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const settingRoutes = require("./routes/settingRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const commentRoutes=require("./routes/commentRoutes");

dotenv.config();


// Additional Routes
app.use("/api/settings", settingRoutes);
app.use("/api/notifications", notificationRoutes);

// Connect Database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`🚀 Janamat Yug Server Running on Port ${PORT}`);

});
