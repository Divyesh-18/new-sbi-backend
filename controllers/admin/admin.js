const jwt = require("jsonwebtoken")
require("dotenv").config()
const admin_secret_key = process.env.ADMIN_SECRET_KEY || "admin_secret_key"
const admin_login = require("../../models/admin/admin_login")

const login = async function (req, res) {
	try {
		const admindata = await admin_login.findOne({
			name: req.body.name,
			password: req.body.password,
		})
		//console.log(admindata)
		if (admindata) {
			const token = jwt.sign(
				{ id: admindata._id, name: admindata.name },
				admin_secret_key,
				{
					expiresIn: "24h",
				}
			)
			res.status(200).json({
				message: "Admin login successful",
				response: 1,
				success: true,
				token: token,
			})
		} else {
			res.status(401).json({
				message: "Credentials do not match",
				response: 0,
				success: false,
			})
		}
	} catch (error) {
		console.error("Error: " + error)
		res.status(500).json({
			message: error.message || "Internal Server Error",
			response: 0,
			success: false,
		})
	}
}

module.exports = {
	login: login,
}
