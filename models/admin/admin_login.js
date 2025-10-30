const mongoose = require("mongoose")

const admin_loginSchema = new mongoose.Schema({
	name: String,
	admin_name: String,
	password: String,
	role: Number,
	expiry_date: String,
	status: Boolean,
	created_at: {
		type: Date,
		default: Date.now,
	},
})

const admin_login = new mongoose.model("admin", admin_loginSchema)

module.exports = admin_login
