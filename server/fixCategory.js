 require("dotenv").config();
const mongoose = require("mongoose");
const News = require("./models/News");

(async () => {
  try {
    console.log("Connecting...");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected!");

    const news = await News.find();

    console.log("Total News:", news.length);

    let updated = 0;

    for (const item of news) {
      if (typeof item.category === "string") {
        item.category = new mongoose.Types.ObjectId(item.category);
        await item.save();
        updated++;
      }
    }

    console.log("Updated:", updated);

    await mongoose.disconnect();

    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();