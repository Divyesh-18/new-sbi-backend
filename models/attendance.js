const mongoose = require('mongoose');
const validator = require('validator');
const Schema = mongoose.Schema
const AttendanceSchema = new mongoose.Schema({

  userid: { type: Schema.Types.ObjectId, ref: 'users' },
  today_rebates: Number,
  total_rebates: Number,
  total_days: Number,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

const Attendance = new mongoose.model("attendance", AttendanceSchema);

module.exports = Attendance;