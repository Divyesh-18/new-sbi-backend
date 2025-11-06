const cron = require('node-cron');
const resultController = require("../controllers/result");
const redEnvelope = require("../models/redEnvelope");


cron.schedule('*/3 * * * *', () => {
    resultController.bateresult();
    console.log('cron run.....');
});

cron.schedule('*/1 * * * *', () => {
    resultController.OneMinGameBateResult();
    console.log('cron run.....');
});

cron.schedule("*/30 * * * * *", () => {
    resultController.fastGameBateResult();
    console.log('fastGameBateResult cron run.....');
})

cron.schedule('1 0 * * *', async () => {
    await resultController.intrast();
    console.log('Apply intrast Done');
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

cron.schedule("1 0 * * *", async () => {
    await resultController.clearPeriodId();
    await resultController.clearFastWinPeriodId();
    console.log('Clear Period Id successFully');
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});
cron.schedule("5 0 * * *", async () => {
    await resultController.clearOnePeriodId();
    console.log('Clear One Minit Period Id successFully',);
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});
cron.schedule('0 12 * * *', async () => {
    await redEnvelope.updateMany({ status: 1 }, { $set: { status: 0 } })
    console.log("redEnvelope inActive successfully....");
});