var jwt = require('jsonwebtoken')
const Users = require("../models/user");

function verifyToken(req, res, next) {
    const token =
        req.body.token || req.query.token || req.headers["x-access-token"];

    if (!token) {
        return res.status(200).send({
            message: 'Auth is requrd',
            response: 0,
            success: false
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded.user;
    } catch (err) {
        return res.status(200).send({
            message: 'Error',
            response: 0,
            success: false
        });
        // console.log("err", err)
    }
    return next();

}

module.exports = verifyToken;