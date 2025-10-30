const mongoose = require('mongoose');
const validator = require('validator');
const Schema = mongoose.Schema
const WalletSchema = new mongoose.Schema({

  userid: { type: Schema.Types.ObjectId, ref: 'users' },  
  hashcode: String,
  password: String,
  amount: Number,
  free_amount: Number,
  win_amount: Number,
  envelopestatus: Boolean,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
  }
});

const Wallet = new mongoose.model("wallet", WalletSchema);

module.exports = Wallet;