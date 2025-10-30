const mongoose = require('mongoose');
const oneMinManuallyResultChangeSchema = new mongoose.Schema({
    switch: {
        type: String,
    },
    tab: {
        type: String,
    },
},{
    timestamps:true
});


const oneMinManuallyResult = new mongoose.model("oneMinManuallyResultSwitch", oneMinManuallyResultChangeSchema);

module.exports = oneMinManuallyResult;