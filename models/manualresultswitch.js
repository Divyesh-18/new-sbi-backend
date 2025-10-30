const mongoose = require('mongoose');
const validator = require('validator');
const ManualresultswitchSchema = new mongoose.Schema({
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


const Manualresultswitch = new mongoose.model("manual_result_switch", ManualresultswitchSchema);



module.exports = Manualresultswitch;