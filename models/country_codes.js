const mongoose = require("mongoose");

const CountryCodeSchema = new mongoose.Schema({
  iso: {
    type: String,
  },
  name: {
    type: String,
  },
  nicename: {
    type: String,
  },
  iso3: {
    type: String,
  },
  country_code: {
    type: String,
  },
  phonecode: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
  },
});

const CountryCode = new mongoose.model("countrys_codes", CountryCodeSchema);

module.exports = CountryCode;
