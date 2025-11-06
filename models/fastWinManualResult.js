const mongoose = require('mongoose');
const validator = require('validator');
const fastWinManualResultSchema = new mongoose.Schema({
    color: {
        type: String,
    },
    value: {
        type: String,
    },
    number: {
        type: String,
    },
    status: Boolean,
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
    }
});


const fastWinManualResult = new mongoose.model("fastWinManualResult", fastWinManualResultSchema);



module.exports = fastWinManualResult;