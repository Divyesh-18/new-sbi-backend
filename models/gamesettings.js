const mongoose = require('mongoose');
const validator = require('validator');
const GameSettingsSchema = new mongoose.Schema({
  settingtype: {
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


const GameSettings = new mongoose.model("game_settings", GameSettingsSchema);



module.exports = GameSettings;