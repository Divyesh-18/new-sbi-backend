const mongoose = require("mongoose");
const validator = require("validator");
const Schema = mongoose.Schema;
const WalletsummerySchema = new mongoose.Schema({
  userid: { type: Schema.Types.ObjectId, ref: "users" },
  orderid: String,
  amount: Number,
  old_wallet: Number,
  wallet: Number,
  type: String,
  actiontype: String,
  sender_id: { type: Schema.Types.ObjectId, ref: "users" },
  rechargetype: String,
  usdtAmount: Number,
  createdate: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
  },
});

const Walletsummery = new mongoose.model("wallet_summery", WalletsummerySchema);

module.exports = Walletsummery;
