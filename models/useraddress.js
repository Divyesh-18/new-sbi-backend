const mongoose = require("mongoose")
const Schema = mongoose.Schema
const user_addressSchema = mongoose.Schema({
	userid: { type: Schema.Types.ObjectId, ref: "users" },
	full_name: String,
	mobile: Number,
	pincode: Number,
	state: String,
	city: String,
	address: String,
	created_at: {
		type: Date,
		default: Date.now,
	},
	updated_at: {
		type: Date,
	},
})

const user_address = mongoose.model("user_address", user_addressSchema)

module.exports = user_address
