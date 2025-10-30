var express = require("express")
var router = express.Router()
const adminController = require("../../controllers/admin/admin")

router.post("/adminlogin", adminController.login)
module.exports = router
