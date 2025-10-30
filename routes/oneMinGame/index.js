const express = require("express");
const router = express.Router();

router.use('/min' , require("./win.routes"));

module.exports = router;