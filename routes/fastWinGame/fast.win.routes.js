const express = require("express");
const router = express.Router();

const verifyToken = require("../../middleware/auth");
const requestValidator = require("../../middleware/requestValidator.middaleware");
const validator = require("../../validators/fastWinGame/fast.win.game.validator");
const controller = require("../../controllers/fastWinGame/win.controller");

router.get('/result', verifyToken, requestValidator(validator.getFastWinGameResultByCategory), controller.getFastWinGameResultByCategory)
router.post('/user-result', verifyToken, controller.getFastWinUserResults);
router.get('/period-id', verifyToken, controller.fastWinGamePeriodId);
router.post("/bate", verifyToken, controller.bate);
router.post("/order-list", verifyToken, controller.fastWinOrderList);
router.post("/trend", verifyToken, controller.fastWinTrend);

module.exports = router;