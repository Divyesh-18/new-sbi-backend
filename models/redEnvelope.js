const mongoose = require('mongoose');
const validator = require('validator');
const Schema = mongoose.Schema

const redEnvelopeSchema = new mongoose.Schema({
    name: {
        type: String
    },
    code: {
        type: String
    },
    distributed_amount: {
        type: String
    },
    type: {
        type: String
    },
    status: {
        type: Number   // 0=active 1=inactive = 2=stop
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    expiry_date: {
        type: Date,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
    }
});

const redEnvelope = new mongoose.model("redEnvelope", redEnvelopeSchema);

module.exports = redEnvelope; 