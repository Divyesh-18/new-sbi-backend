var express = require("express");
var router = express.Router();
const requestValidator = require("../middleware/requestValidator.middaleware");
const validator = require("../validators/auth.validator");
const authController = require("../controllers/auth");
const productController = require("../controllers/product");
const homeController = require("../controllers/home");
const winController = require("../controllers/win");

router.post(
  "/login",
  requestValidator(validator.loginSchema),
  authController.login
);
router.post(
  "/register",
  requestValidator(validator.registerSchema),
  authController.register
);
router.post(
  "/send-otp",
  requestValidator(validator.sendOtpSchema),
  authController.sendOtp
);
router.post(
  "/send-otp-email",
  requestValidator(validator.sendOtpEmailSchema),
  authController.sendOtpEmail
);
router.post(
  "/forgotpassword",
  requestValidator(validator.forgotpasswordSchema),
  authController.forgotpassword
);

router.post("/get-all-product", productController.getProduct);
router.post("/get-banners", productController.getbanners);
router.get("/get-country-code", winController.getcountrycode);
router.get("/get-color-code", authController.getColorCode);
router.get("/get-apk", authController.getApkLink);

module.exports = router;
