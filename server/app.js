const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const protect = require("./middleware/authMiddleware");
const categoryRoutes = require("./routes/categoryRoutes");
const newsRoutes = require("./routes/newsRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const adminRoutes = require("./routes/adminRoutes");
const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);


// Test Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to Janamat Yug News API 🚀",
        version: "1.0.0"
    });
});

app.get("/api/profile", protect, (req, res) => {

    res.status(200).json({
        success: true,
        message: "Protected Route Accessed Successfully",
        user: req.user
    });

});

module.exports = app;