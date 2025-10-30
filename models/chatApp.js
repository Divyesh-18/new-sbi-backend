const mongoose = require("mongoose");

const messageSchama = mongoose.Schema({
  message: {
    text: { type: String },
  },
  users: Array,
  image: {
    type: String,
  },
  fileType: {
    type: String,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: Number,
  },
});

module.exports = mongoose.model("Messages", messageSchama);
