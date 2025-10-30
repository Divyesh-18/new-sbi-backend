const mongoose = require('mongoose');
const Schema = mongoose.Schema


const withdrawalSchema = mongoose.Schema({
	userid: { type: Schema.Types.ObjectId, ref: "users" },
	amount: Number,
	paybleamount: Number,
	payout: String,
	payid: Number,
	account_id: String,
	type: String,
	ifsc: String,
	code: String,
	account: Number,
	status: Number,
	createdate: {
		type: Date,
		default: Date.now,
	},
})

const withdrawal = mongoose.model("withdrawal", withdrawalSchema);

module.exports = withdrawal;