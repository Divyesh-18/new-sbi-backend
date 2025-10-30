var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
require("dotenv").config();
var connectToDb = require("./config/mongo.connection");
var router = require("./routes");
const cors = require("cors");

var app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  next();
});

// Connect to databse
connectToDb();

app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/api", router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next();
});
require("./scripts/seedData").initSeedData();
require("./cron/index");
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
