const cron = require('node-cron');
const resultController = require("../controllers/result");
const redEnvelope = require("../models/redEnvelope");

// Track running cron jobs to prevent overlapping
const cronJobStatus = {
    threeMinuteGame: false,
    oneMinuteGame: false,
    fastGame: false,
    dailyInterest: false,
    clearPeriodId: false,
    clearOnePeriodId: false,
    redEnvelopeInactive: false
};

// 3 Minute Game Result - Every 3 minutes
cron.schedule('*/3 * * * *', async () => {
    if (cronJobStatus.threeMinuteGame) {
        console.log('3-minute game cron still running, skipping...');
        return;
    }

    cronJobStatus.threeMinuteGame = true;
    const startTime = Date.now();
    
    try {
        console.log('Starting 3-minute game result cron...');
        await resultController.bateresult();
        console.log(`3-minute game result completed in ${Date.now() - startTime}ms`);
    } catch (error) {
        console.error('Error in 3-minute game cron:', error);
    } finally {
        cronJobStatus.threeMinuteGame = false;
    }
});

// 1 Minute Game Result - Every 1 minute
cron.schedule('*/1 * * * *', async () => {
    if (cronJobStatus.oneMinuteGame) {
        console.log('1-minute game cron still running, skipping...');
        return;
    }

    cronJobStatus.oneMinuteGame = true;
    const startTime = Date.now();
    
    try {
        console.log('Starting 1-minute game result cron...');
        await resultController.OneMinGameBateResult();
        console.log(`1-minute game result completed in ${Date.now() - startTime}ms`);
    } catch (error) {
        console.error('Error in 1-minute game cron:', error);
    } finally {
        cronJobStatus.oneMinuteGame = false;
    }
});

// Fast Game Result - Every 30 seconds
cron.schedule("*/30 * * * * *", async () => {
    if (cronJobStatus.fastGame) {
        console.log('Fast game cron still running, skipping...');
        return;
    }

    cronJobStatus.fastGame = true;
    const startTime = Date.now();
    
    try {
        console.log('Starting fast game result cron...');
        await resultController.fastGameBateResult();
        console.log(`Fast game result completed in ${Date.now() - startTime}ms`);
    } catch (error) {
        console.error('Error in fast game cron:', error);
    } finally {
        cronJobStatus.fastGame = false;
    }
});

// Daily Interest - At 12:01 AM IST
cron.schedule('1 0 * * *', async () => {
    if (cronJobStatus.dailyInterest) {
        console.log('Daily interest cron still running, skipping...');
        return;
    }

    cronJobStatus.dailyInterest = true;
    const startTime = Date.now();
    
    try {
        console.log('Starting daily interest cron...');
        await resultController.intrast();
        console.log(`Daily interest completed in ${Date.now() - startTime}ms`);
    } catch (error) {
        console.error('Error in daily interest cron:', error);
    } finally {
        cronJobStatus.dailyInterest = false;
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

// Clear Period IDs - At 12:01 AM IST
cron.schedule("1 0 * * *", async () => {
    if (cronJobStatus.clearPeriodId) {
        console.log('Clear period ID cron still running, skipping...');
        return;
    }

    cronJobStatus.clearPeriodId = true;
    const startTime = Date.now();
    
    try {
        console.log('Starting clear period ID cron...');
        await resultController.clearPeriodId();
        await resultController.clearFastWinPeriodId();
        console.log(`Clear period ID completed in ${Date.now() - startTime}ms`);
    } catch (error) {
        console.error('Error in clear period ID cron:', error);
    } finally {
        cronJobStatus.clearPeriodId = false;
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

// Clear One Minute Period ID - At 12:05 AM IST
cron.schedule("5 0 * * *", async () => {
    if (cronJobStatus.clearOnePeriodId) {
        console.log('Clear one period ID cron still running, skipping...');
        return;
    }

    cronJobStatus.clearOnePeriodId = true;
    const startTime = Date.now();
    
    try {
        console.log('Starting clear one minute period ID cron...');
        await resultController.clearOnePeriodId();
        console.log(`Clear one minute period ID completed in ${Date.now() - startTime}ms`);
    } catch (error) {
        console.error('Error in clear one period ID cron:', error);
    } finally {
        cronJobStatus.clearOnePeriodId = false;
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

// Red Envelope Inactive - At 12:00 PM
cron.schedule('0 12 * * *', async () => {
    if (cronJobStatus.redEnvelopeInactive) {
        console.log('Red envelope inactive cron still running, skipping...');
        return;
    }

    cronJobStatus.redEnvelopeInactive = true;
    const startTime = Date.now();
    
    try {
        console.log('Starting red envelope inactive cron...');
        await redEnvelope.updateMany({ status: 1 }, { $set: { status: 0 } });
        console.log(`Red envelope inactive completed in ${Date.now() - startTime}ms`);
    } catch (error) {
        console.error('Error in red envelope inactive cron:', error);
    } finally {
        cronJobStatus.redEnvelopeInactive = false;
    }
});

// Log cron status every 5 minutes for monitoring
cron.schedule('*/5 * * * *', () => {
    console.log('Cron Job Status:', {
        threeMinuteGame: cronJobStatus.threeMinuteGame,
        oneMinuteGame: cronJobStatus.oneMinuteGame,
        fastGame: cronJobStatus.fastGame,
        timestamp: new Date().toISOString()
    });
});

console.log('All cron jobs initialized successfully');
