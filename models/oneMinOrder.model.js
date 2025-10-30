const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const oneMinOrderSchema = mongoose.Schema({
    userid: { type: Schema.Types.ObjectId, ref: "users" },
    transactionid: Number,
    amount: Number,
    status: Boolean,
},{
    timestamps: true
})

const oneMinOrder = mongoose.model("oneMinOrder", oneMinOrderSchema);
module.exports = oneMinOrder;