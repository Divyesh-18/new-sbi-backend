const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = mongoose.Schema({
        userid: { type: Schema.Types.ObjectId, ref: "users" },
        transactionid:Number,
        amount:Number,
        status:Boolean,
        created_at: {
            type: Date,
            default: Date.now
          },
})

const order = mongoose.model("order",orderSchema);
module.exports = order;