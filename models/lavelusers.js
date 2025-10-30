const mongoose = require('mongoose');
const validator = require('validator');
const Schema = mongoose.Schema
const LavelusersSchema = new mongoose.Schema({

  lavel_id: Number,
  percentage: Number,
  amount: Number,
  status: Boolean,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
  }
});

const Lavelusers = new mongoose.model("lavel_user", LavelusersSchema);

module.exports = Lavelusers;