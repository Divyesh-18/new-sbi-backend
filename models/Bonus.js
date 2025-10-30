const mongoose = require('mongoose');
const validator = require('validator');
const Schema = mongoose.Schema
const BonusSchema = new mongoose.Schema({

  userid: { type: Schema.Types.ObjectId, ref: 'users' },
  amount: Number,
  level1: Number,
  level3: Number,
  level4: Number,
  level5: Number,
  level6: Number,
  level7: Number,
  level8: Number,
  level9: Number,
  level10: Number,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
  }
});

const Bonus = new mongoose.model("bonus", BonusSchema);

module.exports = Bonus;