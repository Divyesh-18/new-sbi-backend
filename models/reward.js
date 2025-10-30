const mongoose = require('mongoose');


const RewardSchema = mongoose.Schema({
       userid:String,
       amount:Number,
       createdate:{
        type: Date,
        default: Date.now
       }
})

const Reward = mongoose.model("reward",RewardSchema);

module.exports = Reward;