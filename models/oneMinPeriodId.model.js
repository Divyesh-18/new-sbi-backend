const mongoose = require("mongoose");


const oneMinPeriodSchema = new mongoose.Schema ({
    gameid: {
        type: Number,
    },
},{
    timestamps:true
}); 
const oneMinPeriodIdModel = new mongoose.model("oneMinPeriodId", oneMinPeriodSchema);

module.exports = oneMinPeriodIdModel;

