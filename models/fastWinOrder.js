const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fastWinOrderSchema = mongoose.Schema({
    userid: { type: Schema.Types.ObjectId, ref: "users" },
    transactionid: Number,
    amount: Number,
    status: Boolean,
}, {
    timestamps: true
})

const fastWinOrder = mongoose.model("fastWinOrder", fastWinOrderSchema);
module.exports = fastWinOrder;