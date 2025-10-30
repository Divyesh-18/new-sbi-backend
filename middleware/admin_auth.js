const jwt = require("jsonwebtoken")
const admin_login = require("../models/admin/admin_login")
require("dotenv").config()
const admin_secret_key = process.env.ADMIN_SECRET_KEY || "admin_secret_key"
function verifyadminToken(req, res, next) {
	const token = req.body.token || req.query.token || req.headers["x-token"]
	console.log(token)
	if (!token) {
		return res.status(200).send({
			message: "Auth is requrd",
			response: 0,
			success: false,
		})
	}
	try {
		const decoded = jwt.verify(token, admin_secret_key)
		//const admin = decoded.id
		req.admin = decoded.id
		next()
	} catch (err) {
		//console.log(err)
		return res.status(200).send({
			message: "Invalid Token",
			response: 0,
			success: false,
		})
	}
}

module.exports = verifyadminToken
