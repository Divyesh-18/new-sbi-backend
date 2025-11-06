const express = require("express");
const router = express.Router();

router.use('/win', require("./fast.win.routes"));

module.exports = router;