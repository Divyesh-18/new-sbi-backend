const mongoose = require('mongoose');
const validator = require('validator');
const ManualResultSchema = new mongoose.Schema({
  color: {
    type: String,
  },
  value: {
    type: String,
  },
  number: {
    type: String,
  },
  status: Boolean,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
  }
});


const ManualResult = new mongoose.model("manual_result", ManualResultSchema);



module.exports = ManualResult;