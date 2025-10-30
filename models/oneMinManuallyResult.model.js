const mongoose = require('mongoose');

const oneMinManuallyResultSchema = new mongoose.Schema({
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
},{
    timestamps:true
});


const oneMinManuallyResult = new mongoose.model("oneMinManuallyResult", oneMinManuallyResultSchema);

module.exports = oneMinManuallyResult;