const mongoose = require('mongoose');
const Schema = mongoose.Schema
const WinningWalletHistorySchema = mongoose.Schema({
    userid:{ type: Schema.Types.ObjectId, ref: 'users' },
    orderid:String,
    amount:Number,
    wallet:Number,
    type:String,
    actiontype:String,
    sender_id:{ type: Schema.Types.ObjectId, ref: 'users' },
    createdate: {
        type: Date,
        default: Date.now
      },
});

const WinningWalletHistory = mongoose.model("Winning_WalletHistory",WinningWalletHistorySchema);

module.exports = WinningWalletHistory;