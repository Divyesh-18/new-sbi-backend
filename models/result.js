const mongoose = require('mongoose');
const validator = require('validator');
const ResultSchema = new mongoose.Schema({
  periodid: {
    type: Number,
  },
  price: {
    type: Number,
  },
  randomprice: {
    type: Number,
  },
  result: {
    type: String,
  },
  randomresult: {
    type: String,
  },
  color: {
    type: String,
  },
  resulttype: {
    type: String,
  },
  tabtype: {
    type: String,
  },
  randomcolor: {
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


const Result = new mongoose.model("result", ResultSchema);



module.exports = Result;