const mongoose = require('mongoose');
const validator = require('validator');
const Schema = mongoose.Schema

const BettingSchema = new mongoose.Schema({
  userid: { type: Schema.Types.ObjectId, ref: 'users' },
  periodid: {
    type: Number,
  },
  type: {
    type: String,
  },
  value: {
    type: String,
  },
  amount: {
    type: Number,
  },
  tab: {
    type: String,
  },
  acceptrule: {
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


const Betting = new mongoose.model("betting", BettingSchema);



module.exports = Betting;