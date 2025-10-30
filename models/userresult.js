const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userresultSchema = new mongoose.Schema({
	userid: { type: Schema.Types.ObjectId, ref: "users" },
	periodid: Number,
	type: String,
	value: String,
	amount: Number,
	openprice: Number,
	result_number: {
		type: String,
	  },
    result_color: {
		type: String,
	  },
	tab: String,
	paidamount: Number,
	fee: Number,
	status: Boolean,
	created_at: {
		type: Date,
		default: Date.now,
	},
});

const UserResult = mongoose.model("UserResult", userresultSchema);

module.exports = UserResult;
