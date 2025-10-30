const mongoose = require('mongoose');
const validator = require('validator');
const TempWinnerSchema = new mongoose.Schema({
  periodid: {
    type: Number,
  },
  number: {
    type: String,
  },
  color: {
    type: String,
  },
  total: {
    type: Number,
  },
  type: {
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


const TempWinner = new mongoose.model("tempwinner", TempWinnerSchema);



module.exports = TempWinner;