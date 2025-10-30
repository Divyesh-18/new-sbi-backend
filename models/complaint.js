const mongoose = require('mongoose');
const Schema = mongoose.Schema

const complaintSchema = new mongoose.Schema({
  userid: { type: Schema.Types.ObjectId, ref: 'users' },
  complait_for:String,
  complaint_time:{
    type: Date,
    default: Date.now
  },
  complait_subject:String,
  complaint_status:String,
  complait_id:String,
  complait_text:String,
  complait_reply:String,
  complait_reply_time:String,
  

})

const complaint = new mongoose.model("complaint",complaintSchema);

module.exports = complaint;