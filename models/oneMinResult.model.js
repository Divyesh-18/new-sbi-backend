const mongoose = require('mongoose');

const oneMinResultSchema = new mongoose.Schema({
    periodid: {
        type: Number,
    },
    price: {
        type: Number,
    },
    randomprice: {
        type: Number,
    },
    result: {
        type: String,
    },
    randomresult: {
        type: String,
    },
    color: {
        type: String,
    },
    resulttype: {
        type: String,
    },
    tabtype: {
        type: String,
    },
    randomcolor: {
        type: String,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
    }
});
const oneMinResult = new mongoose.model("oneMinResult", oneMinResultSchema);

module.exports = oneMinResult;