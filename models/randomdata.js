const mongoose = require('mongoose');
const validator = require('validator');
const Schema = mongoose.Schema

const RandomdataSchema = new mongoose.Schema({
  price: {
    type: Number,
  },
  result: {
    type: String,
  },
  color: {
    type: String,
  },
  timer: {
    type: Number,
  },
  dayofweek: {
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


const Randomdata = new mongoose.model("randomdata", RandomdataSchema);



module.exports = Randomdata;