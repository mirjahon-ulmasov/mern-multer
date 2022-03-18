const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const multer = require("multer");
const client = require("./config/redis");
require("dotenv").config();
client.connect();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(multer({ storage: fileStorage, fileFilter }).single("image"));
app.use(express.json());
app.use(morgan("dev"));
app.use("/images", express.static("images"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  const { statusCode = 500, message, data } = error;
  res.status(statusCode).json({ message, data });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Server is started at " + process.env.PORT);
    });
  })
  .catch((err) => console.log(err));
