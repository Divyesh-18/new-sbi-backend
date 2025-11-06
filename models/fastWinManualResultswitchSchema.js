const mongoose = require('mongoose');
const validator = require('validator');
const fastWinManualResultSwitchSchema = new mongoose.Schema({
    switch: {
        type: String,
    },
    tab: {
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


const fastWinManualResultSwitch = new mongoose.model("fastWinManualResultSwitch", fastWinManualResultSwitchSchema);



module.exports = fastWinManualResultSwitch;