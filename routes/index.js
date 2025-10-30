var express = require("express");
var router = express.Router();
const verifyadminToken = require("../middleware/admin_auth");
const winController = require("../controllers/win");

router.use(require("./result"));
router.use(require("./auth"));
router.get("/gameid", winController.gameid);
router.use("/one", require("./oneMinGame/index"));
router.use("/", require("./home"));

//Admin Routes
router.use(require("./admin/admin"));
router.use("/admin", require("./admin/admin_dec"));

module.exports = router;
