const mongoose = require('mongoose');


const paymentsettingSchema = mongoose.Schema({
    UPI_ID: {
        type: String
    },
    CRYPTO_ID: {
        type: String,
    },
    commission_rate: {
        type: Number,
        min: 0
    },
    interest_rate: {
        type: Number,
        min: 0
    },
    rechargeamount: {
        type: Number,
        min: 0
    },
    withdrawalamount: {
        type: Number,
        min: 0
    },
    bonusamount: {
        type: Number,
        min: 0
    },
    batbonus: {
        type: Number,
        min: 0
    },
    rechargebonus1: {
        type: Number,
        min: 0
    },
    rechargebonus2: {
        type: Number,
        min: 0
    },
    rechargebonus3: {
        type: Number,
        min: 0
    },
    level1: {
        type: Number,
        min: 0
    },
    level2: {
        type: Number,
        min: 0
    },
    level3: {
        type: Number,
        min: 0
    },
    sitename: {
        type: String,
    },
    favicon: {
        type: String
    },
    logo: {
        type: String,
    },
    apk: {
        type: String,
    },
    signupbonusamount: {
        type: Number,
        min: 0
    },
    withdrawal_status: {
        type: Boolean, default: true
    },
    telegram_link: {
        type: String
    },
    theme_color: {
        type: String,
    },
    qr_code: {
        type: String,
    },
    minimum_withdrawal_amount: {
        type: Number
    },
    minimum_recharge_amount: {
        type: Number
    },
    autoLoginId: {
        type: String,
        default: "1"
    },
    second_upi_id:{
        type: String
    },
    second_qr_code:{
        type: String,
    },
    third_upi_id:{
        type: String
    },
    thad_qr_code:{
        type: String,
    },
    usdt_rate:{
         type: Number,
         min: 0,
         default: 1
    },
    usdt_code :{
        type: String,
        default: "TRC20"
    },
    usdt_qr:{
        type: String
    },
    usdt_id:{
        type: String
    }

},
    { timestamps: true }
);

const paymentsetting = mongoose.model("paymentsetting", paymentsettingSchema);

module.exports = paymentsetting;