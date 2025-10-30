var express = require("express");
var router = express.Router();
const multer = require("multer");
const admin_dec = require("../../controllers/admin/admin_dec");
const periodHistoryController = require("../../controllers/admin/oneMinGame/period.history.controller");
const setResultGameController = require("../../controllers/admin/oneMinGame/result.controller");

router.get("/desktop", admin_dec.desktop);
router.get("/admin-detail", admin_dec.adminDetail);
router.post("/admin-table", admin_dec.datatable);
router.post("/user-wallets", admin_dec.walletHistory);
router.post("/withdrawalaccept", admin_dec.WithdrawalAccept);
router.post("/withdrawalreject", admin_dec.WithdrawalReject);
router.post("/withdrawalpendding", admin_dec.WithdrawalRequest);
router.post("/rechargeaccept", admin_dec.RechargeAccept);
router.post("/rechargereject", admin_dec.RechargeReject);
router.post("/rechargepending", admin_dec.RechargePending);
router.post("/adminrechargeaccept", admin_dec.AdminAcceptRecharge);
router.post("/adminrechargereject", admin_dec.AdminRejectRecharge);
router.post("/adminwithdrawalaccept", admin_dec.AdminAcceptWithdrawal);
router.post("/adminwithdrawalreject", admin_dec.AdminRejectWithdrawal);
router.post('/adminAgreeWithdrawal', admin_dec.adminAgreeWithdrawal)
router.post("/setresulgame", admin_dec.setresulgame);
router.post("/selectresultnumber", admin_dec.SelectResultNumber);
router.post("/adminalluser", admin_dec.AllUser);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "apk") {
      cb(null, "public/");
    } else {
      cb(null, "public/images/");
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
});
// router.post(
//   "/sitsetting",
//   upload.fields([
//     { name: "favicon", maxCount: 1 },
//     { name: "logo", maxCount: 1 },
//     { name: "apk", maxCount: 1 },
//   ]),
//   admin_dec.siteSetting
// );
router.post("/notification", admin_dec.notification);
router.post(
  "/addbanner",
  upload.fields([{ name: "material", maxCount: 1 }]),
  admin_dec.addbanner
);
router.put(
  "/updatebanner",
  upload.fields([{ name: "material", maxCount: 1 }]),
  admin_dec.updatebanner
);
router.delete("/deletebanner", admin_dec.deleteBanner);
router.post(
  "/addproduct",
  upload.fields([{ name: "image", maxCount: 1 }]),
  admin_dec.addproduct
);
router.put(
  "/updateproduct",
  upload.fields([{ name: "image", maxCount: 1 }]),
  admin_dec.updateproduct
);
router.delete("/deleteproduct", admin_dec.deleteProduct);
router.post("/getleveluser", admin_dec.getleveluser);
router.post("/addleveluser", admin_dec.addleveluser);
router.put("/updateleveluser", admin_dec.updateleveluser);
router.delete("/deleteleveluser", admin_dec.deleteleveluser);
router.put("/adminplay", admin_dec.adminPlay);
router.put("/adminupdatewallet", admin_dec.adminUpdateWallet);
router.put("/adminactiveunactiveuser", admin_dec.AdminActiveUnActiveUser);
router.post("/adminupdatealluser", admin_dec.adminUpdateAllUser);
router.post("/period_bateing_history", admin_dec.period_bateing_history);
router.post(
  "/admin_get_allusers_referid_lavel",
  admin_dec.AdminGetAllUserUserReferidLavel
);
router.post("/getcomplaint", admin_dec.getcomplaint);
router.put("/updatecomplaint", admin_dec.updateComplaint);
router.post("/user_game_history", admin_dec.user_game_history);
router.get(
  "/getSiteSettingInputDefaultData",
  admin_dec.getSiteSettingInputDefaultData
);

router.get("/getnotification", admin_dec.GetNotification);
router.put(
  "/sitsetting",
  upload.fields([
    { name: "favicon", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "apk", maxCount: 1 },
    { name: "qr_code", maxCount: 1 },
    { name: "thad_qr_code", maxCount: 1},
    { name: "usdt_qr", maxCount: 1}
  ]),
  admin_dec.siteSettingUpdate
);
router.post(
  "/admin-sitename-and-logoinformation",
  admin_dec.adminSiteNameAndLogoInformation
);
router.get('/red-envelope-user-list', admin_dec.redEnvelopeUserList);
router.get('/add-red-envelop', admin_dec.addUserRedEnvelope);
router.get('/red-envelope-list', admin_dec.redEnvelopeList);
router.get('/remove-user-in-red-envelope', admin_dec.removeUserInRedEnvelope);
router.get('/red-envelope-data-list', admin_dec.redEnvelopeDataList);
router.put('/red-envelope-status-update', admin_dec.redEnvelopeStatusUpdate);
router.put('/red-envelope-update', admin_dec.editRedEnvelope);
router.get('/get-single-red-envelope', admin_dec.getSingleRedEvelope);
router.delete('/clear-history', admin_dec.clearHistory);
router.get('/get-bank-detail/:id', admin_dec.getUserBankDetail);
router.post('/update-bank-detail', admin_dec.updateBankDetail);
router.post("/period-history", periodHistoryController.oneMinPeriodHistory);
router.post("/period-id-wise-user-history", periodHistoryController.periodIdWiseUserHistory);
router.post("/set-result-game", setResultGameController.setResultGame);
router.post("/select-result-number", setResultGameController.selectResultNumber);
router.get("/period-id", setResultGameController.getOneMinPeriodId);
router.post("/auto-login-id", admin_dec.autoLoginId);
router.get("/get-auto-login-id", admin_dec.getAutoLoginId);
router.get("/changeadminpassword", admin_dec.changeAdminPassword);

module.exports = router;
