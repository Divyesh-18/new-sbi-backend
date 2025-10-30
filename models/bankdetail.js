const mongoose = require('mongoose');
const Schema = mongoose.Schema


const BankDetailSchema = mongoose.Schema({
	userid: { type: Schema.Types.ObjectId, ref: "users" },
	name: String,
	ifsc_code: String,
	bank_code: String,
	bank_account: Number,
	upi: String,
	mobile_number: Number,
	address: String,
	city: String,
	state: String,
	email: String,
	type: String,
	status: Number,
	crypto_address: String,
})

const BankDetail = mongoose.model("bankdetail",BankDetailSchema);

module.exports =BankDetail;