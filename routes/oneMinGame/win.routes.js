const express = require("express");
const router = express.Router();

const verifyToken = require("../../middleware/auth");
const requestValidator = require("../../middleware/requestValidator.middaleware");
const validator = require("../../validators/oneMinGame/win.validator");
const controller = require("../../controllers/oneMinGame/win.controller");

router.get('/result', controller.getOneMinResultByCategory)
router.post('/user-result', verifyToken, controller.getOneMinUserResult);
router.get('/period-id', controller.getOneMinPeriodId);
router.post('/bate',verifyToken,requestValidator(validator.bate), controller.bate);
router.post('/order-list', verifyToken, controller.oneMinOrderList);
router.post("/trend" , controller.oneMinTrend);

module.exports = router;