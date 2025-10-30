var express = require('express');
var router = express.Router();

const resultController = require("../controllers/result");
const requestValidator = require('../middleware/requestValidator.middaleware');
const validator = require('../validators/auth.validator');

router.post('/bate-result', resultController.bateresult);
router.post('/intrast', resultController.intrast);
router.post('/test-user-result', resultController.testbateresult);
router.get('/clear-period-id', resultController.clearPeriodId);
router.get('/intrast', resultController.intrast);
router.get("/clear-one-min-period-id", resultController.clearOnePeriodId);

module.exports = router;
