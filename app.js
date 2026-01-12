const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dish = require("./express-backend/models/dish");

const dbUrl = "mongodb://localhost:27017/recipeBook";
mongoose.connect(dbUrl, {});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error : "));
db.once("open", function () {
  console.log("Database connected");
});

app.get("/dishes", async function(req, res) {
  const dishes = await dish.find({});
  res.status(200).json({
    message: "data fetched successfully",
    data: dishes
  });
})

app.listen(port, function (req, res) {
  console.log(`Server established on port ${port}`);
});
