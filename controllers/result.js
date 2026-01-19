const moment = require("moment");
const newmoment = require("moment-timezone");
const { sprintf, vsprintf } = require("sprintf-js");
const { StatusCodes } = require("http-status-codes");
const { responseStatus } = require("../config/config");
const { catchBlock } = require("../helpers/utils.helper");
const Users = require("../models/user");
const GameId = require("../models/gameid");
const ManualResultSwitch = require("../models/manualresultswitch");
const ManualResult = require("../models/manualresult");
const GameSettings = require("../models/gamesettings");
const Results = require("../models/result");
const Betting = require("../models/betting");
const Randomdata = require("../models/randomdata");
const TempWinner = require("../models/tempwinner");
const helper = require("../helpers/utils.helper");
const PaymentSetting = require("../models/paymentsetting");
const Wallet = require("../models/wallet");
const Walletsummery = require("../models/walletsummery");

const oneMinPeriodIdModel = require("../models/oneMinPeriodId.model");
const oneMinManuallyResultSwitch = require("../models/oneMinManuallyResultChange.model");
const oneMinManuallyResult = require("../models/oneMinManuallyResult.model");
const oneMinBetting = require("../models/oneMinBetting.model");
const oneMinResult = require("../models/oneMinResult.model");

const fastWinModel = require("../models/fastWinPeriodid");
const fastWinManualResultSwitch = require("../models/fastWinManualResultswitchSchema");
const fastWinManualResult = require("../models/fastWinManualResult");
const fastWinResult = require("../models/fastWinResult");
const fastGameBetting = require("../models/fastGameBetting");
const fastWinGamePeriodId  = require("../models/fastWinPeriodid");

const intrast = async function (req, res) {
  const walletData = await Wallet.find({ amount: { $ne: 0 } });
  const paymentsetting = await PaymentSetting.findOne();

  var mainamount = 0;

  for (const item of walletData) {
    mainamount = (
      (parseFloat(item.amount) * parseFloat(paymentsetting.interest_rate)) /
      100
    ).toFixed(2);
    if (mainamount == 0) {
      continue;
    }
    const result = await Wallet.updateOne(
      { _id: item._id },
      {
        $inc: {
          amount: parseFloat(mainamount),
        },
      }
    );
    const oldWallet = parseFloat(item.amount);
    const newAmount = oldWallet + parseFloat(mainamount);
    await Walletsummery.create({
      userid: item.userid,
      orderid: 0,
      amount: parseFloat(mainamount),
      old_wallet: oldWallet,
      wallet: newAmount,
      type: "credit",
      actiontype: "interest",
      createdate: new Date(),
    });
  }
  console.log("intrast done");
  if (res) {
   return res.status(200).json({
      message: "intrast done",
      status: true
    });
  }else{
    console.log("intrast done");
    return true;
  }
};

const testbateresult = async function (req, res) {
  const result = await helper.resultbyUser(
    req.body.periodid,
    req.body.tempNumber,
    req.body.tempColor,
    req.body.randomPrice,
    req.body.type1
  );
  console.log(result);
};

const bateresult = async function (req, res) {
  try {
    var numbermappings = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
    var type1 = 'parity';

    var GameIdData = await GameId.findOne().sort({ _id: -1 })
      .limit(1);
    if (GameIdData) {
      var periodid = GameIdData.gameid;
      var today = moment().format('Y-m-d H:i:s');

      const switchResult = await ManualResultSwitch.findOne();
      const manualResult = await ManualResult.findOne({ status: true }).limit(1);

      var manualid = (manualResult) ? manualResult._id : '';
      var manualcolor = (manualResult) ? manualResult.value : '';
      var manualnumber = (manualResult) ? manualResult.number : '';


      const settingResult = await GameSettings.findOne();

      var settingstatus = (settingResult) ? settingResult.settingtype : '';

      const Resultsdata = await Results.countDocuments({ periodid });
      if (Resultsdata == 0) {
        const Bettingsdata = await Betting.find({ periodid: periodid, tab: 'parity' });
        if (Bettingsdata) {

          var color = '';
          var greentotal = '';
          var total = '';
          var att = '';
          var redtotal = '';
          var vtotal = '';
          var tempd = '';
          var TempWinnerData = [];
          for (let x = 0; x <= 9; x++) {
            if (x == 1 || x == 3 || x == 7 || x == 9) {
              color = 'green';
              greentotal = await helper.winner(periodid, type1, 'greenwinamount');
              if (settingstatus == 'high') {
                total = greentotal + await helper.winner(periodid, type1, numbermappings[x] + 'winamount');
              } else {
                tradeamount = await helper.winner(periodid, type1, 'tradeamount');
                att = greentotal + await helper.winner(periodid, type1, numbermappings[x] + 'winamount');
                total = tradeamount - att;
              }

            } else if (x == 2 || x == 4 || x == 6 || x == 8) {
              color = 'red';
              redtotal = await helper.winner(periodid, type1, 'redwinamount');
              if (settingstatus == 'high') {
                total = redtotal + await helper.winner(periodid, type1, numbermappings[x] + 'winamount');
              } else if (settingstatus == 'low') {
                tradeamount = await helper.winner(periodid, type1, 'tradeamount');
                att = redtotal + await helper.winner(periodid, type1, numbermappings[x] + 'winamount');
                total = tradeamount - att;
              }
            } else if (x == 0) {
              color = 'red+violet';
              redtotal = await helper.winner(periodid, type1, 'redwinamountwithviolet');
              vtotal = await helper.winner(periodid, type1, 'violetwinamount');
              if (settingstatus == 'high') {
                tempd = await helper.winner(periodid, type1, numbermappings[x] + 'winamount')
                total = redtotal + vtotal + tempd;
              } else if (settingstatus == 'low') {
                tradeamount = await helper.winner(periodid, type1, 'tradeamount');
                att = redtotal + vtotal + await helper.winner(periodid, type1, numbermappings[x] + 'winamount');
                total = tradeamount - att;
              }
            } else if (x == 5) {
              color = 'green+violet';
              redtotal = await helper.winner(periodid, type1, 'greenwinamountwithviolet');
              vtotal = await helper.winner(periodid, type1, 'violetwinamount');
              if (settingstatus == 'high') {
                total = redtotal + vtotal + await helper.winner(periodid, type1, numbermappings[x] + 'winamount');
              } else if (settingstatus == 'low') {
                tradeamount = await helper.winner(periodid, type1, 'tradeamount');
                att = redtotal + vtotal + await helper.winner(periodid, type1, numbermappings[x] + 'winamount');
                total = tradeamount - att;
              }
            }

            TempWinnerData[x] = {
              periodid: periodid,
              number: x,
              color: color,
              total: total,
              type: type1,
            };


          }
          var tempwinQuery = [];
          if (switchResult && switchResult.switch == 'yes' && switchResult.tab == 'parity' && manualResult) {
            tempwinQuery = TempWinnerData.filter(function (value) { return value.number == manualnumber; })[0];
          } else {
            const bettings = await Betting.find({ periodid: periodid, tab: 'parity' });
            const bettingData = bettings.map((item) => ({
              number: item.value,
              type: item.type,
              total: item.amount,
            }));
            const expectedEntries = Array.from({ length: 10 }, (_, i) => ({ number: i.toString(), type: 'number' }));
            const aggregatedMap = new Map();

            bettingData.forEach(({ number, type, total }) => {
              const key = `${number}-${type}`;
              aggregatedMap.set(key, { number, type, total: (aggregatedMap.get(key)?.total || 0) + total });
            });

            const finalData = expectedEntries.map(({ number, type }) => {
              const key = `${number}-${type}`;
              return aggregatedMap.get(key) || { number, type, total: 0 };
            });

            const minTotal = Math.min(...finalData.map(entry => entry.total));
            const selectedEntries = finalData.filter(entry => entry.total === minTotal);

            const randomIndex = Math.floor(Math.random() * selectedEntries.length);
            tempwinQuery = TempWinnerData.find(value => value.number == selectedEntries[randomIndex].number);
          }
          const tempNumber = tempwinQuery.number;
          const tempColor = tempwinQuery.color;
          const tempTotal = tempwinQuery.total;


          const randomdataquery = await Randomdata.find();
          const randpostion = Math.floor(Math.random() * randomdataquery.length);

          const randomwinQuery = randomdataquery[randpostion];
          const randomPrice = String(randomwinQuery.price).slice(0, -1);
          const randomNumber = randomwinQuery.result;
          const randomColor = randomwinQuery.color;

          await Results.create({
            periodid: periodid,
            price: tempTotal,
            randomprice: `${randomPrice}${tempNumber}`,
            result: tempNumber,
            randomresult: randomNumber,
            color: tempColor,
            randomcolor: randomColor,
            resulttype: 'real',
            tabtype: type1,
          });
          await helper.resultbyUser(periodid, tempNumber, tempColor, randomPrice, type1);

        } else {
          const randomdataquery = await Randomdata.find();
          const randpostion = Math.floor(Math.random() * randomdataquery.length);

          const randomwinQuery = randomdataquery[randpostion];
          const randomPrice = String(randomwinQuery.price).slice(0, -1);
          const randomNumber = randomwinQuery.result;
          const randomColor = randomwinQuery.color.toLowerCase();
          const heading_new = randomColor.replace("&", "");
          const newcolor = heading_new.replace(" ", "+");
          await Results.create({
            periodid: periodid,
            price: '0',
            randomprice: `${randomPrice}${tempNumber}`,
            result: '0',
            randomresult: randomNumber,
            color: newcolor,
            randomcolor: randomColor,
            resulttype: 'random',
            tabtype: type1,
          });

        }

      }
    }
    const current = moment().format("YYYY-MM-DD 00:00:00");
    const now = moment().format("YYYY-MM-DD H:i:s");
    const firstperiodid = moment().format("YYYYMMDD") + sprintf("%03d", 1);
    const lastperiodid = moment().subtract(1, "days").format("YYYYMMDD") + sprintf("%03d", 480);
    
    // const currentDate = newmoment().tz("Asia/Kolkata").format("YYYYMMDD");
    // const nowDay = newmoment().tz("Asia/Kolkata");
    // const totalMinutes = nowDay.hours() * 60 + nowDay.minutes();
    // const minutesDivided = Math.floor(totalMinutes / 3);
    // const formattedNumber = sprintf("%03d", minutesDivided);
    // const nextperiodid = currentDate + formattedNumber;

    let currantinitcount = moment().tz("Asia/Kolkata").hours() * 60 + moment().tz("Asia/Kolkata").minutes() + 1;
    const minutesDivided = Math.floor(currantinitcount / 3) + 1;
    currantinitcount = sprintf("%03d", minutesDivided);
    const nextperiodid = moment().format("YYYYMMDD") + currantinitcount;
    let nextid = periodid + 1;
    const GameIdcount = await GameId.countDocuments();
    if (GameIdcount == 0) {
      const GameIdcerate = await GameId.create({
        gameid: firstperiodid,
      });
    } else if (nextperiodid != nextid) {
      const GameIdcerate = await GameId.create({
        gameid: nextperiodid,
      });
    } else if (lastperiodid == periodid) {
      const RemoveGameId = await GameId.deleteMany();
      const RemoveResults = await Results.deleteMany();
      const GameIdcerate = await GameId.create({
        gameid: firstperiodid,
      });
    }  else {
      const GameIdcerate = await GameId.create({
        gameid: nextid,
      });
    }
    const ManualResultSwitchUpdate = await ManualResultSwitch.updateOne(
      {}, { $set: { tab: null, switch: 'no' } },
    );
    const ManualResultUpdate = await ManualResult.updateMany({ $set: { status: 0 } },
    );

    console.log('result declare successFully');
    return true;

  } catch (error) {
    console.log(error);
  }
}

const clearPeriodId = async function (req, res) {
  try {
    const currentDate = newmoment().tz("Asia/Kolkata").format("YYYYMMDD");
    const now = newmoment().tz("Asia/Kolkata");
    const totalMinutes = now.hours() * 60 + now.minutes();
    const minutesDivided = Math.floor(totalMinutes / 3);
    const formattedNumber = sprintf("%03d", minutesDivided);

    const firstperiodid = currentDate + formattedNumber;

    await GameId.deleteMany();
    await Results.deleteMany();
    await GameId.create({
      gameid: firstperiodid,
    });
    if(res){
   return   res.status(200).json({
        data: {
          currentDate: currentDate,
          minutesDivided: minutesDivided,
          formattedNumber: formattedNumber,
          firstperiodid: firstperiodid,
        }
      });
    }else{
      console.log("clearPeriodId",{
        data: {
          currentDate: currentDate,
          minutesDivided: minutesDivided,
          formattedNumber: formattedNumber,
          firstperiodid: firstperiodid,
        }
      });
      
      return true;
    }
  } catch (error) {
    console.log(error);
    return true;

  }
}

const OneMinGameBateResult = async function (req, res) {
  try {
    var numbermappings = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
    var type1 = 'parity';

    var GameIdData = await oneMinPeriodIdModel.findOne().sort({ _id: -1 })
      .limit(1);
    if (GameIdData) {
      var periodid = GameIdData.gameid;
      var today = moment().format('Y-m-d H:i:s');

      const switchResult = await oneMinManuallyResultSwitch.findOne();
      const manualResult = await oneMinManuallyResult.findOne({ status: true }).limit(1);

      var manualid = (manualResult) ? manualResult._id : '';
      var manualcolor = (manualResult) ? manualResult.value : '';
      var manualnumber = (manualResult) ? manualResult.number : '';


      const settingResult = await GameSettings.findOne();

      var settingstatus = (settingResult) ? settingResult.settingtype : '';

      const Resultsdata = await oneMinResult.countDocuments({ periodid });
      if (Resultsdata == 0) {
        const Bettingsdata = await oneMinBetting.find({ periodid: periodid, tab: 'parity' });
        if (Bettingsdata) {

          var color = '';
          var greentotal = '';
          var total = '';
          var att = '';
          var redtotal = '';
          var vtotal = '';
          var tempd = '';
          var TempWinnerData = [];
          for (let x = 0; x <= 9; x++) {
            if (x == 1 || x == 3 || x == 7 || x == 9) {
              color = 'green';
              greentotal = await helper.oneMinGameWinner(periodid, type1, 'greenwinamount');
              if (settingstatus == 'high') {
                total = greentotal + await helper.oneMinGameWinner(periodid, type1, numbermappings[x] + 'winamount');
              } else {
                tradeamount = await helper.oneMinGameWinner(periodid, type1, 'tradeamount');
                att = greentotal + await helper.oneMinGameWinner(periodid, type1, numbermappings[x] + 'winamount');
                total = tradeamount - att;
              }

            } else if (x == 2 || x == 4 || x == 6 || x == 8) {
              color = 'red';
              redtotal = await helper.oneMinGameWinner(periodid, type1, 'redwinamount');
              if (settingstatus == 'high') {
                total = redtotal + await helper.oneMinGameWinner(periodid, type1, numbermappings[x] + 'winamount');
              } else if (settingstatus == 'low') {
                tradeamount = await helper.oneMinGameWinner(periodid, type1, 'tradeamount');
                att = redtotal + await helper.oneMinGameWinner(periodid, type1, numbermappings[x] + 'winamount');
                total = tradeamount - att;
              }
            } else if (x == 0) {
              color = 'red+violet';
              redtotal = await helper.oneMinGameWinner(periodid, type1, 'redwinamountwithviolet');
              vtotal = await helper.oneMinGameWinner(periodid, type1, 'violetwinamount');
              if (settingstatus == 'high') {
                tempd = await helper.oneMinGameWinner(periodid, type1, numbermappings[x] + 'winamount')
                total = redtotal + vtotal + tempd;
              } else if (settingstatus == 'low') {
                tradeamount = await helper.oneMinGameWinner(periodid, type1, 'tradeamount');
                att = redtotal + vtotal + await helper.oneMinGameWinner(periodid, type1, numbermappings[x] + 'winamount');
                total = tradeamount - att;
              }
            } else if (x == 5) {
              color = 'green+violet';
              redtotal = await helper.oneMinGameWinner(periodid, type1, 'greenwinamountwithviolet');
              vtotal = await helper.oneMinGameWinner(periodid, type1, 'violetwinamount');
              if (settingstatus == 'high') {
                total = redtotal + vtotal + await helper.oneMinGameWinner(periodid, type1, numbermappings[x] + 'winamount');
              } else if (settingstatus == 'low') {
                tradeamount = await helper.oneMinGameWinner(periodid, type1, 'tradeamount');
                att = redtotal + vtotal + await helper.oneMinGameWinner(periodid, type1, numbermappings[x] + 'winamount');
                total = tradeamount - att;
              }
            }

            TempWinnerData[x] = {
              periodid: periodid,
              number: x,
              color: color,
              total: total,
              type: type1,
            };


          }
          var tempwinQuery = [];
          if (switchResult && switchResult.switch == 'yes' && switchResult.tab == 'parity' && manualResult) {
            tempwinQuery = TempWinnerData.filter(function (value) { return value.number == manualnumber; })[0];
          } else {
            const bettings = await oneMinBetting.find({ periodid: periodid, tab: 'parity' });
            const bettingData = bettings.map((item) => ({
              number: item.value,
              type: item.type,
              total: item.amount,
            }));
            const expectedEntries = Array.from({ length: 10 }, (_, i) => ({ number: i.toString(), type: 'number' }));
            const aggregatedMap = new Map();

            bettingData.forEach(({ number, type, total }) => {
              const key = `${number}-${type}`;
              aggregatedMap.set(key, { number, type, total: (aggregatedMap.get(key)?.total || 0) + total });
            });

            const finalData = expectedEntries.map(({ number, type }) => {
              const key = `${number}-${type}`;
              return aggregatedMap.get(key) || { number, type, total: 0 };
            });

            const minTotal = Math.min(...finalData.map(entry => entry.total));
            const selectedEntries = finalData.filter(entry => entry.total === minTotal);

            const randomIndex = Math.floor(Math.random() * selectedEntries.length);
            tempwinQuery = TempWinnerData.find(value => value.number == selectedEntries[randomIndex].number);
          }
          const tempNumber = tempwinQuery.number;
          const tempColor = tempwinQuery.color;
          const tempTotal = tempwinQuery.total;


          const randomdataquery = await Randomdata.find();
          const randpostion = Math.floor(Math.random() * randomdataquery.length);

          const randomwinQuery = randomdataquery[randpostion];
          const randomPrice = String(randomwinQuery.price).slice(0, -1);
          const randomNumber = randomwinQuery.result;
          const randomColor = randomwinQuery.color;
          await oneMinResult.create({
            periodid: periodid,
            price: tempTotal,
            randomprice: `${randomPrice}${tempNumber}`,
            result: tempNumber,
            randomresult: randomNumber,
            color: tempColor,
            randomcolor: randomColor,
            resulttype: 'real',
            tabtype: type1,
          });
          await helper.oneMinResultByUser(periodid, tempNumber, tempColor, randomPrice, type1);

        } else {
          const randomdataquery = await Randomdata.find();
          const randpostion = Math.floor(Math.random() * randomdataquery.length);

          const randomwinQuery = randomdataquery[randpostion];
          const randomPrice = String(randomwinQuery.price).slice(0, -1);
          const randomNumber = randomwinQuery.result;
          const randomColor = randomwinQuery.color.toLowerCase();
          const heading_new = randomColor.replace("&", "");
          const newcolor = heading_new.replace(" ", "+");
          await oneMinResult.create({
            periodid: periodid,
            price: '0',
            randomprice: `${randomPrice}${tempNumber}`,
            result: '0',
            randomresult: randomNumber,
            color: newcolor,
            randomcolor: randomColor,
            resulttype: 'random',
            tabtype: type1,
          });

        }

      }
    }

    const current = moment().startOf("day").format("YYYY-MM-DD HH:mm:ss");
    const now = moment().format("YYYY-MM-DD HH:mm:ss");
    var firstperiodid = moment().format("YYYYMMDD") + sprintf("%04d", 1);
    var lastperiodid = moment().subtract(1, "days").format("YYYYMMDD") + sprintf("%04d", 1440);
    let currantinitcount = moment().tz("Asia/Kolkata").hours() * 60 + moment().tz("Asia/Kolkata").minutes() + 1;
     currantinitcount =sprintf("%04d", currantinitcount);
    const nextperiodid = moment().format("YYYYMMDD") + sprintf("%04d", currantinitcount);
    const nextid = periodid + 1;

    const GameIdcount = await oneMinPeriodIdModel.countDocuments();
    if (GameIdcount == 0) {
      const GameIdcerate = await oneMinPeriodIdModel.create({
        gameid: firstperiodid,
      });
    } else if (lastperiodid == periodid) {
      const RemoveGameId = await oneMinPeriodIdModel.deleteMany();
      const RemoveResults = await oneMinResult.deleteMany();
      const GameIdcerate = await oneMinPeriodIdModel.create({
        gameid: firstperiodid,
      });
    } else if (nextperiodid != nextid) {
      const GameIdcerate = await oneMinPeriodIdModel.create({
        gameid: nextperiodid,
      });
    } else {
      const GameIdcerate = await oneMinPeriodIdModel.create({
        gameid: nextid,
      });
    }
    const ManualResultSwitchUpdate = await oneMinManuallyResultSwitch.updateOne(
      {}, { $set: { tab: null, switch: 'no' } },
    );
    const ManualResultUpdate = await oneMinManuallyResult.updateMany({ $set: { status: 0 } },
    );

    console.log('result declare successFully');
    return true;
  } catch (error) {
    console.log(error);
  }
}
const clearOnePeriodId = async function (req, res) {
  try {
    const now = newmoment().tz("Asia/Kolkata");
    const currentDate = now.format("YYYYMMDD");

    const totalMinutes = now.hours() * 60 + now.minutes();
    const formattedNumber = sprintf("%04d", totalMinutes);

    const oneMinutePeriodId = currentDate + formattedNumber;

    await oneMinPeriodIdModel.deleteMany();
    await oneMinResult.deleteMany();

    await oneMinPeriodIdModel.create({ gameid: oneMinutePeriodId });

    if(res){
   return   res.status(200).json({
        data: {
          currentDate,
          totalMinutes,
          formattedNumber,
          oneMinutePeriodId
        }
      });
    }else{
      console.log("clearOnePeriodId",{
        data: {
          currentDate,
          totalMinutes,
          formattedNumber,
          oneMinutePeriodId
        }
      });
      return true;

    }


  } catch (error) {
    console.log(error);
  return  res.status(500).json({ message: "Internal server error" });
  }
}

const fastGameBateResult = async function (req, res) {
  try {
    var numbermappings = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
    var type1 = 'parity';

    var GameIdData = await fastWinModel.findOne().sort({ _id: -1 })
      .limit(1);
    if (GameIdData) {
      var periodid = GameIdData.gameid;
      var today = moment().format('Y-m-d H:i:s');

      const switchResult = await fastWinManualResultSwitch.findOne();
      const manualResult = await fastWinManualResult.findOne({ status: true }).limit(1);

      var manualid = (manualResult) ? manualResult._id : '';
      var manualcolor = (manualResult) ? manualResult.value : '';
      var manualnumber = (manualResult) ? manualResult.number : '';


      const settingResult = await GameSettings.findOne();

      var settingstatus = (settingResult) ? settingResult.settingtype : '';

      const Resultsdata = await fastWinResult.countDocuments({ periodid });
      if (Resultsdata == 0) {
        const Bettingsdata = await fastGameBetting.find({ periodid: periodid, tab: 'parity' });
        if (Bettingsdata) {

          var color = '';
          var greentotal = '';
          var total = '';
          var att = '';
          var redtotal = '';
          var vtotal = '';
          var tempd = '';
          var TempWinnerData = [];
          for (let x = 0; x <= 9; x++) {
            if (x == 1 || x == 3 || x == 7 || x == 9) {
              color = 'green';
              greentotal = await helper.fastWinGameWinner(periodid, type1, 'greenwinamount');
              if (settingstatus == 'high') {
                total = greentotal + await helper.fastWinGameWinner(periodid, type1, numbermappings[x] + 'winamount');
              } else {
                tradeamount = await helper.fastWinGameWinner(periodid, type1, 'tradeamount');
                att = greentotal + await helper.fastWinGameWinner(periodid, type1, numbermappings[x] + 'winamount');
                total = tradeamount - att;
              }

            } else if (x == 2 || x == 4 || x == 6 || x == 8) {
              color = 'red';
              redtotal = await helper.fastWinGameWinner(periodid, type1, 'redwinamount');
              if (settingstatus == 'high') {
                total = redtotal + await helper.fastWinGameWinner(periodid, type1, numbermappings[x] + 'winamount');
              } else if (settingstatus == 'low') {
                tradeamount = await helper.fastWinGameWinner(periodid, type1, 'tradeamount');
                att = redtotal + await helper.fastWinGameWinner(periodid, type1, numbermappings[x] + 'winamount');
                total = tradeamount - att;
              }
            } else if (x == 0) {
              color = 'red+violet';
              redtotal = await helper.fastWinGameWinner(periodid, type1, 'redwinamountwithviolet');
              vtotal = await helper.fastWinGameWinner(periodid, type1, 'violetwinamount');
              if (settingstatus == 'high') {
                tempd = await helper.fastWinGameWinner(periodid, type1, numbermappings[x] + 'winamount')
                total = redtotal + vtotal + tempd;
              } else if (settingstatus == 'low') {
                tradeamount = await helper.fastWinGameWinner(periodid, type1, 'tradeamount');
                att = redtotal + vtotal + await helper.fastWinGameWinner(periodid, type1, numbermappings[x] + 'winamount');
                total = tradeamount - att;
              }
            } else if (x == 5) {
              color = 'green+violet';
              redtotal = await helper.fastWinGameWinner(periodid, type1, 'greenwinamountwithviolet');
              vtotal = await helper.fastWinGameWinner(periodid, type1, 'violetwinamount');
              if (settingstatus == 'high') {
                total = redtotal + vtotal + await helper.fastWinGameWinner(periodid, type1, numbermappings[x] + 'winamount');
              } else if (settingstatus == 'low') {
                tradeamount = await helper.fastWinGameWinner(periodid, type1, 'tradeamount');
                att = redtotal + vtotal + await helper.fastWinGameWinner(periodid, type1, numbermappings[x] + 'winamount');
                total = tradeamount - att;
              }
            }

            TempWinnerData[x] = {
              periodid: periodid,
              number: x,
              color: color,
              total: total,
              type: type1,
            };


          }
          var tempwinQuery = [];
          if (switchResult && switchResult.switch == 'yes' && switchResult.tab == 'parity' && manualResult) {
            tempwinQuery = TempWinnerData.filter(function (value) { return value.number == manualnumber; })[0];
          } else {
            const bettings = await fastGameBetting.find({ periodid: periodid, tab: 'parity' });
            const bettingData = bettings.map((item) => ({
              number: item.value,
              type: item.type,
              total: item.amount,
            }));
            const expectedEntries = Array.from({ length: 10 }, (_, i) => ({ number: i.toString(), type: 'number' }));
            const aggregatedMap = new Map();

            bettingData.forEach(({ number, type, total }) => {
              const key = `${number}-${type}`;
              aggregatedMap.set(key, { number, type, total: (aggregatedMap.get(key)?.total || 0) + total });
            });

            const finalData = expectedEntries.map(({ number, type }) => {
              const key = `${number}-${type}`;
              return aggregatedMap.get(key) || { number, type, total: 0 };
            });

            const minTotal = Math.min(...finalData.map(entry => entry.total));
            const selectedEntries = finalData.filter(entry => entry.total === minTotal);

            const randomIndex = Math.floor(Math.random() * selectedEntries.length);
            tempwinQuery = TempWinnerData.find(value => value.number == selectedEntries[randomIndex].number);
          }
          const tempNumber = tempwinQuery.number;
          const tempColor = tempwinQuery.color;
          const tempTotal = tempwinQuery.total;


          const randomdataquery = await Randomdata.find();
          const randpostion = Math.floor(Math.random() * randomdataquery.length);

          const randomwinQuery = randomdataquery[randpostion];
          const randomPrice = String(randomwinQuery.price).slice(0, -1);
          const randomNumber = randomwinQuery.result;
          const randomColor = randomwinQuery.color;

          await fastWinResult.create({
            periodid: periodid,
            price: tempTotal,
            randomprice: `${randomPrice}${tempNumber}`,
            result: tempNumber,
            randomresult: randomNumber,
            color: tempColor,
            randomcolor: randomColor,
            resulttype: 'real',
            tabtype: type1,
          });
          await helper.fastWinResultByUser(periodid, tempNumber, tempColor, randomPrice, type1);

        } else {
          const randomdataquery = await Randomdata.find();
          const randpostion = Math.floor(Math.random() * randomdataquery.length);

          const randomwinQuery = randomdataquery[randpostion];
          const randomPrice = String(randomwinQuery.price).slice(0, -1);
          const randomNumber = randomwinQuery.result;
          const randomColor = randomwinQuery.color.toLowerCase();
          const heading_new = randomColor.replace("&", "");
          const newcolor = heading_new.replace(" ", "+");
          await fastWinResult.create({
            periodid: periodid,
            price: '0',
            randomprice: `${randomPrice}${tempNumber}`,
            result: '0',
            randomresult: randomNumber,
            color: newcolor,
            randomcolor: randomColor,
            resulttype: 'random',
            tabtype: type1,
          });

        }

      }
    }
    const current = moment().format("YYYY-MM-DD 00:00:00");
    const now = moment().format("YYYY-MM-DD H:i:s");
    const firstperiodid = moment().format("YYYYMMDD") + sprintf("%03d", 1);
    const lastperiodid = moment().subtract(1, "days").format("YYYYMMDD") + sprintf("%03d", 480);
    
    // const currentDate = newmoment().tz("Asia/Kolkata").format("YYYYMMDD");
    // const nowDay = newmoment().tz("Asia/Kolkata");
    // const totalMinutes = nowDay.hours() * 60 + nowDay.minutes();
    // const minutesDivided = Math.floor(totalMinutes / 3);
    // const formattedNumber = sprintf("%03d", minutesDivided);
    // const nextperiodid = currentDate + formattedNumber;

    let currantinitcount = moment().tz("Asia/Kolkata").hours() * 60 * 60 + moment().tz("Asia/Kolkata").minutes() * 60 + moment().tz("Asia/Kolkata").seconds() + 1;
    const secondsDivided = Math.floor(currantinitcount / 30) + 1;
    currantinitcount = sprintf("%04d", secondsDivided);
    const nextperiodid = moment().format("YYYYMMDD") + currantinitcount;
    let nextid = periodid + 1;
    const GameIdcount = await fastWinGamePeriodId.countDocuments();
    if (GameIdcount == 0) {
      const GameIdcerate = await fastWinGamePeriodId.create({
        gameid: firstperiodid,
      });
    } else if (nextperiodid != nextid) {
      const GameIdcerate = await fastWinGamePeriodId.create({
        gameid: nextperiodid,
      });
    } else if (lastperiodid == periodid) {
      const RemoveGameId = await fastWinGamePeriodId.deleteMany();
      const RemoveResults = await fastWinResult.deleteMany();
      const GameIdcerate = await fastWinGamePeriodId.create({
        gameid: firstperiodid,
      });
    }  else {
      const GameIdcerate = await fastWinGamePeriodId.create({
        gameid: nextid,
      });
    }
    const ManualResultSwitchUpdate = await fastWinManualResultSwitch.updateOne(
      {}, { $set: { tab: null, switch: 'no' } },
    );
    const ManualResultUpdate = await fastWinManualResult.updateMany({ $set: { status: 0 } },
    );

    console.log('result declare successFully');
    return true;

  } catch (error) {
    console.log(error);
  }
}
const clearFastWinPeriodId = async function (req, res) {
  try {
    const now = newmoment().tz("Asia/Kolkata");
    const currentDate = now.format("YYYYMMDD");

    const totalSeconds = now.hours() * 3600 + now.minutes() * 60 + now.seconds();

    const divided = Math.floor(totalSeconds / 30) + 1;

    const formattedNumber = sprintf("%04d", divided);

    const halfMinutePeriodId = currentDate + formattedNumber;

    await fastWinGamePeriodId.deleteMany();
    await fastWinResult.deleteMany();

    await fastWinGamePeriodId.create({ gameid: halfMinutePeriodId });

    if (res) {
      return res.status(200).json({
        data: {
          currentDate,
          totalSeconds,
          formattedNumber,
          halfMinutePeriodId
        }
      });
    } else {
      console.log("clearFastWinPeriodId", {
        data: {
          currentDate,
          totalSeconds,
          formattedNumber,
          halfMinutePeriodId
        }
      });
      return true;
    }

  } catch (error) {
    console.log(error);
    if (res) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

module.exports = {
  bateresult,
  testbateresult,
  intrast,
  clearPeriodId,
  OneMinGameBateResult,
  clearOnePeriodId,
  fastGameBateResult,
  clearFastWinPeriodId
};
