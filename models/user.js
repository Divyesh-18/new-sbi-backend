const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const UsersSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    // unique: true,
    default: null,
    required: false,
  },
  mobile: Number,
  email_verified_at: String,
  password: String,
  country_code: String,
  code: String,
  owncode: {
    type: String,
    // unique: true,
  },
  loginId: {
    type: Number
  },
  status: Boolean,
  active: {
    type: Boolean,
    default: true,
  },
  play: {
    type: Boolean,
    default: true,
  },
  envelop_user: Boolean,
  tokens: [
    {
      token: {
        type: String,
      },
    },
  ],
  last_login: {
    type: Date,
  },
  red_envelope: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
  },
});

UsersSchema.methods.genereteAuthToken = async function () {
  try {
    console.log(5);
    const token = jwt.sign({ user: this }, process.env.SECRET_KEY, {
      expiresIn: 86400,
    });
    // this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (error) {
    console.log(error);
  }
};
const Users = new mongoose.model("users", UsersSchema);

module.exports = Users;
