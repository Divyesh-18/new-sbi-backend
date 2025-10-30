const mongoose = require("mongoose");

// const { models } = require('../constants');

const modelsToLoad = [
  { name: "lavel_user", forceUpdate: false },
  { name: "manual_result", forceUpdate: false },
  { name: "randomdata", forceUpdate: false },
  { name: "game_settings", forceUpdate: false },
  { name: "manual_result_switch", forceUpdate: false },
  { name: "users", forceUpdate: false },
  { name: "wallet", forceUpdate: false },
  { name: "wallet_summery", forceUpdate: false },
  { name: "attendance", forceUpdate: false },
  { name: "bonus", forceUpdate: false },
  { name: "paymentsetting", forceUpdate: false },
  { name: "admin", forceUpdate: false },
  { name: "notificationdata", forceUpdate: false },
  { name: "banners", forceUpdate: false },
  { name: "Products", forceUpdate: false },
  { name: "countrys_codes", forceUpdate: false },
  { name: "oneMinManuallyResultSwitch" , forceUpdate:false},
  { name: "oneMinManuallyResult", forceUpdate: false }


];

/**
 * Load Seed data to get started with some basic stuff.
 */
async function initSeedData() {
  for (const modelToLoad of modelsToLoad) {
    const model = mongoose.model(modelToLoad.name);

    if (modelToLoad.forceUpdate) {
      await model.deleteMany({});
    }

    const count = await model.countDocuments();

    if (count === 0) {
      console.log(`Processing ${modelToLoad.name}`);

      await model.insertMany(require(`../seedData/${modelToLoad.name}`));
    }
  }

  console.log("Seed data loaded...");
}

module.exports = {
  initSeedData,
};
