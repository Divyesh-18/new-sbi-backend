const mongoose = require("mongoose");


const fastWinSchema = new mongoose.Schema({
    gameid: {
        type: Number,
    },
}, {
    timestamps: true
});
const fastWinModel = new mongoose.model("fastWinPeriodId", fastWinSchema);

module.exports = fastWinModel;

