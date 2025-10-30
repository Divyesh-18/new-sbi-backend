const mongoose = require('mongoose');
const validator = require('validator');
const GameidSchema = new mongoose.Schema({
  gameid: {
    type: Number,
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
  }
});


const Gameid = new mongoose.model("game_id", GameidSchema);



module.exports = Gameid;