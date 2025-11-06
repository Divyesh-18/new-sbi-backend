const mongoose = require('mongoose');
const Schema = mongoose.Schema

const fastGameBettingSchema = new mongoose.Schema({
    userid: { type: Schema.Types.ObjectId, ref: 'users' },
    periodid: {
        type: Number,
    },
    type: {
        type: String,
    },
    value: {
        type: String,
    },
    amount: {
        type: Number,
    },
    tab: {
        type: String,
    },
    acceptrule: {
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


const fastGameBetting = new mongoose.model("fastGameBetting", fastGameBettingSchema);

module.exports = fastGameBetting;