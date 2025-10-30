const mongoose = require('mongoose');
const validator = require('validator');
const Schema = mongoose.Schema
const BonussummerySchema = new mongoose.Schema({

  userid: { type: Schema.Types.ObjectId, ref: 'users' },
  periodid: Number,
  laveluser: { type: Schema.Types.ObjectId, ref: 'users' },
  lavel: Number,
  amount: Number,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
  }
});

const Bonussummery = new mongoose.model("bonussummery", BonussummerySchema);

module.exports = Bonussummery;