const mongoose = require('mongoose');
const validator = require('validator');
const Schema = mongoose.Schema
const FreeWalletHistorySchema = new mongoose.Schema({

  userid: { type: Schema.Types.ObjectId, ref: 'users' },
  orderid: Number,
  amount: Number,
  wallet: Number,
  type: String,
  actiontype: String,
  sender_id: { type: Schema.Types.ObjectId, ref: 'users' },
  createdate: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
  }
});

const FreeWalletHistory = new mongoose.model("free_history", FreeWalletHistorySchema);

module.exports = FreeWalletHistory;