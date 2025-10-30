const mongoose = require('mongoose');
const validator = require('validator');
const OtpSchema = new mongoose.Schema({
  mobile_number: {
    type: Number,
    default: null,
    required: false
  },
  email: {
    type: String,
    // unique: true,
    default: null,
    required: false
  },
  otp: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
  }
});


const Otp = new mongoose.model("otp", OtpSchema);



module.exports = Otp;