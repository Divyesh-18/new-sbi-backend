const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fastWinUserResultSchema = new Schema({
    userid: { type: Schema.Types.ObjectId, ref: "users" },
    periodid: { type: Number },
    type: { type: String },
    value: { type: String },
    amount: { type: Number },
    openprice: { type: Number },
    result_number: { type: String },
    result_color: { type: String },
    tab: { type: String },
    paidamount: { type: Number },
    fee: { type: Number },
    status: { type: Boolean },
}, {
    timestamps: true,
});

const fastWinUserResult = mongoose.model("fastWinUserResult", fastWinUserResultSchema);

module.exports = fastWinUserResult;
