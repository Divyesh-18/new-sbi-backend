const moment = require("moment");
const axios = require("axios");
const { responseStatus } = require("../config/config");
const { StatusCodes } = require("http-status-codes");
const Otp = require("../models/otp");
const Lavelusers = require("../models/lavelusers");
const Users = require("../models/user");
const Wallet = require("../models/wallet");
const Bonussummery = require("../models/bonussummery");
const Walletsummery = require("../models/walletsummery");
const Bonus = require("../models/Bonus");
const FreeWalletHistory = require("../models/freewallethistory");
const Betting = require("../models/betting");
const { forEach, map } = require("lodash");
const UserResult = require("../models/userresult");
const Order = require("../models/order");
const WinningHistory = require("../models/WinningWalletHistory");
const oneMinBetting = require("../models/oneMinBetting.model");
const oneMinOrder = require("../models/oneMinOrder.model");
const oneMinUserResult = require("../models/oneMinUserResult.model");

const fastWinResult = require("../models/fastWinResult");
const fastGameBetting = require("../models/fastGameBetting");
const fastWinUserResult = require("../models/fastWinUserResult");
const fastWinOrder = require("../models/fastWinOrder");

const mongoose = require("mongoose");
const { Types } = mongoose;

const getMongoID = (id) => {
  try {
    if (id) {
      return new mongoose.Types.ObjectId(id);
    }

    return null;
  } catch (error) {
    setErrorLog(error);
    return null;
  }
};
module.exports.getMongoID = getMongoID;
//** Error Handling */
const catchBlock = (res, error) => {
  const errorObject = {
    status: responseStatus.zero,
    message: error.message,
  };
  const errorResponse = res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .send(errorObject);
  return errorResponse;
};

module.exports.sendOtp = async (otp, number, res) => {
  return new Promise((resolve, reject) => {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url:
        "http://cloud.smsindiahub.in/api/mt/SendSMS?user=Babu007&password=123456&senderid=AREPLY&channel=Trans&DCS=0&flashsms=0&number=91" +
        number +
        "&text=Your One Time Password is " +
        otp +
        ".Thanks SMSINDIAHUB& DLTTemplateId=1007248488345555325 & route=5 & PEId=1701158019630577568",
      headers: {},
    };

    axios
      .request(config)
      .then((response) => {
        if (response.data != 3) {
          resolve(true);
        } else {
          reject(response);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  });
};
module.exports.otpDelete = async (number, email) => {
  return new Promise((resolve, reject) => {
    Otp.deleteOne({ mobile_number: number, email: email })
      .then(function (response) {
        //handle success
        resolve(true);
      })
      .catch(function (response) {
        //handle error
        reject(response);
      });
  });
};
// module.exports.refcode = async () => {
//   return new Promise((resolve, reject) => {
//     const length = 8;
//     let result = '';
//     const characters = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
//     const charactersLength = characters.length;
//     let counter = 0;
//     while (counter < length) {
//       result += characters.charAt(Math.floor(Math.random() * charactersLength));
//       counter += 1;
//     }
//     resolve(result);

//   });
// }
const generatedCodes = new Set();
module.exports.refcode = async () => {
  return new Promise((resolve, reject) => {
    const firstLetters = ["A", "B", "C", "D", "E", "F"];
    const otherLetters = "ABCDEF";
    const digits = "0123456789";
    const otherLettersLength = otherLetters.length;
    const digitsLength = digits.length;

    let result = "";
    do {
      result = firstLetters[Math.floor(Math.random() * firstLetters.length)];
      result += otherLetters.charAt(
        Math.floor(Math.random() * otherLettersLength)
      );
      for (let i = 0; i < 6; i++) {
        result += digits.charAt(Math.floor(Math.random() * digitsLength));
      }
    } while (generatedCodes.has(result));
    generatedCodes.add(result);

    resolve(result);
  });
};

module.exports.generate = async (n) => {
  var add = 1,
    max = 12 - add;

  if (n > max) {
    return this.generate(max) + this.generate(n - max);
  }

  max = Math.pow(10, n + add);
  var min = max / 10; // Math.pow(10, n) basically
  var number = Math.floor(Math.random() * (max - min + 1)) + min;

  return ("" + number).substring(add);
};

module.exports.reward = async (mycode, _id, maincomison) => {
  return new Promise(async (resolve, reject) => {
    let owncode = mycode;
    var laveldata = await Lavelusers.find();
    let userdata = null;
    let FreeWalletHistorydata = null;
    let WalletHistorydata = null;
    let Bonussummerydata = null;
    let WalletData = null;
    let BonusData = null;

    // if (userdata) {
    // console.log('owncode', owncode);
    // console.log(laveldata);
    for (const element of laveldata) {
      //   // }
      // laveldata.forEach(async (element, index) => {
      userdata = await Users.findOne({ owncode: owncode });
      if (userdata) {
        console.log("", owncode);
        try {
          const rannum = await Math.floor(
            10000000000 + Math.random() * 90000000000
          );
          // console.log(typeof rannum, rannum);
          Bonussummerydata = await Bonussummery.create({
            userid: _id,
            periodid: rannum,
            laveluser: userdata._id,
            lavel: element.lavel_id,
            amount: element.amount,
          });

          WalletData = await Wallet.findOneAndUpdate(
            { userid: userdata._id },
            {
              $inc: { amount: element.amount },
            },
            { new: true }
          );
          // console.log("WalletData", WalletData);

          // FreeWalletHistorydata = await FreeWalletHistory.create({
          //   userid: userdata._id,
          //   orderid: rannum,
          //   amount: element.amount,
          //   sender_id: _id,
          //   type: "credit",
          //   wallet: WalletData.free_amount,
          //   actiontype: "reward"
          // });
          WalletHistorydata = await Walletsummery.create({
            userid: userdata._id,
            orderid: rannum,
            amount: element.amount,
            sender_id: _id,
            type: "credit",
            wallet: WalletData.amount,
            actiontype: "reward",
          });

          BonusData = await Bonus.findOneAndUpdate(
            { _id: userdata._id },
            {
              $inc: { amount: element.amount },
            },
            { new: true }
          );
          owncode = userdata.code;
        } catch (error) {
          console.log(error);
          reject(error);
        }
      } else {
        break;
        resolve(true);
      }
      // });
      // break;
    }
    // } else {
    resolve(true);

    // }
  });
};

module.exports.winner = async (periodid, tab, column) => {
  try {
    const betdata = await Betting.aggregate([
      {
        $match: {
          periodid: periodid,
        },
      },
      {
        $group: {
          _id: "$value",
          sum_amount: {
            $sum: "$amount",
          },
        },
      },
    ]);
    var resultamount = 0;
    for (const element of betdata) {
      switch (column) {
        case "tradeamount":
          resultamount = element.sum_amount;
          break;

        case "button":
          resultamount = await Betting.find({ type: "button" });
          break;

        case "number":
          resultamount = await Betting.find({ type: "number" });
          break;

        case "green":
          if (element._id == "Green") {
            resultamount = element.sum_amount;
          }
          break;

        case "greenwinamount":
          if (element._id == "Green") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 2;
          }
          break;

        case "greenwinamountwithviolet":
          if (element._id == "Green") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 1.5;
          }
          break;

        case "violet":
          if (element._id == "Violet") {
            resultamount = element.sum_amount;
          }
          break;

        case "violetwinamount":
          if (element._id == "Violet") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 4.5;
          }
          break;

        case "red":
          if (element._id == "Red") {
            resultamount = element.sum_amount;
          }
          break;

        case "redwinamount":
          if (element._id == "Red") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 2;
          }
          break;

        case "redwinamountwithviolet":
          if (element._id == "Red") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 1.5;
          }
          break;

        case "zero":
          if (element._id == "0") {
            resultamount = element.sum_amount;
          }
          break;
        case "zerowinamount":
          if (element._id == "0") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "one":
          if (element._id == "1") {
            resultamount = element.sum_amount;
          }
          break;
        case "onewinamount":
          if (element._id == "1") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "two":
          if (element._id == "2") {
            resultamount = element.sum_amount;
          }
          break;
        case "twowinamount":
          if (element._id == "2") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "three":
          if (element._id == "3") {
            resultamount = element.sum_amount;
          }
          break;
        case "threewinamount":
          if (element._id == "3") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "four":
          if (element._id == "4") {
            resultamount = element.sum_amount;
          }
          break;
        case "fourwinamount":
          if (element._id == "4") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "five":
          if (element._id == "5") {
            resultamount = element.sum_amount;
          }
          break;
        case "fivewinamount":
          if (element._id == "5") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "six":
          if (element._id == "6") {
            resultamount = element.sum_amount;
          }
          break;
        case "sixwinamount":
          if (element._id == "6") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "seven":
          if (element._id == "7") {
            resultamount = element.sum_amount;
          }
          break;
        case "sevenwinamount":
          if (element._id == "7") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "eight":
          if (element._id == "8") {
            resultamount = element.sum_amount;
          }
          break;
        case "eightwinamount":
          if (element._id == "8") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "nine":
          if (element._id == "9") {
            resultamount = element.sum_amount;
          }
          break;
        case "ninewinamount":
          if (element._id == "9") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        default:
          break;
      }
    }

    return resultamount;
  } catch (error) {
    console.log(error);
  }
};

module.exports.oneMinGameWinner = async (periodid, tab, column) => {
  try {
    const betdata = await oneMinBetting.aggregate([
      {
        $match: {
          periodid: periodid,
        },
      },
      {
        $group: {
          _id: "$value",
          sum_amount: {
            $sum: "$amount",
          },
        },
      },
    ]);
    var resultamount = 0;
    for (const element of betdata) {
      switch (column) {
        case "tradeamount":
          resultamount = element.sum_amount;
          break;

        case "button":
          resultamount = await oneMinBetting.find({ type: "button" });
          break;

        case "number":
          resultamount = await oneMinBetting.find({ type: "number" });
          break;

        case "green":
          if (element._id == "Green") {
            resultamount = element.sum_amount;
          }
          break;

        case "greenwinamount":
          if (element._id == "Green") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 2;
          }
          break;

        case "greenwinamountwithviolet":
          if (element._id == "Green") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 1.5;
          }
          break;

        case "violet":
          if (element._id == "Violet") {
            resultamount = element.sum_amount;
          }
          break;

        case "violetwinamount":
          if (element._id == "Violet") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 4.5;
          }
          break;

        case "red":
          if (element._id == "Red") {
            resultamount = element.sum_amount;
          }
          break;

        case "redwinamount":
          if (element._id == "Red") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 2;
          }
          break;

        case "redwinamountwithviolet":
          if (element._id == "Red") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 1.5;
          }
          break;

        case "zero":
          if (element._id == "0") {
            resultamount = element.sum_amount;
          }
          break;
        case "zerowinamount":
          if (element._id == "0") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "one":
          if (element._id == "1") {
            resultamount = element.sum_amount;
          }
          break;
        case "onewinamount":
          if (element._id == "1") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "two":
          if (element._id == "2") {
            resultamount = element.sum_amount;
          }
          break;
        case "twowinamount":
          if (element._id == "2") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "three":
          if (element._id == "3") {
            resultamount = element.sum_amount;
          }
          break;
        case "threewinamount":
          if (element._id == "3") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "four":
          if (element._id == "4") {
            resultamount = element.sum_amount;
          }
          break;
        case "fourwinamount":
          if (element._id == "4") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "five":
          if (element._id == "5") {
            resultamount = element.sum_amount;
          }
          break;
        case "fivewinamount":
          if (element._id == "5") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "six":
          if (element._id == "6") {
            resultamount = element.sum_amount;
          }
          break;
        case "sixwinamount":
          if (element._id == "6") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "seven":
          if (element._id == "7") {
            resultamount = element.sum_amount;
          }
          break;
        case "sevenwinamount":
          if (element._id == "7") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "eight":
          if (element._id == "8") {
            resultamount = element.sum_amount;
          }
          break;
        case "eightwinamount":
          if (element._id == "8") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "nine":
          if (element._id == "9") {
            resultamount = element.sum_amount;
          }
          break;
        case "ninewinamount":
          if (element._id == "9") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        default:
          break;
      }
    }

    return resultamount;
  } catch (error) {
    console.log(error);
  }
};


module.exports.fastWinGameWinner = async (periodid, tab, column) => {
  try {
    const betdata = await fastGameBetting.aggregate([
      {
        $match: {
          periodid: periodid,
        },
      },
      {
        $group: {
          _id: "$value",
          sum_amount: {
            $sum: "$amount",
          },
        },
      },
    ]);
    var resultamount = 0;
    for (const element of betdata) {
      switch (column) {
        case "tradeamount":
          resultamount = element.sum_amount;
          break;

        case "button":
          resultamount = await fastGameBetting.find({ type: "button" });
          break;

        case "number":
          resultamount = await fastGameBetting.find({ type: "number" });
          break;

        case "green":
          if (element._id == "Green") {
            resultamount = element.sum_amount;
          }
          break;

        case "greenwinamount":
          if (element._id == "Green") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 2;
          }
          break;

        case "greenwinamountwithviolet":
          if (element._id == "Green") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 1.5;
          }
          break;

        case "violet":
          if (element._id == "Violet") {
            resultamount = element.sum_amount;
          }
          break;

        case "violetwinamount":
          if (element._id == "Violet") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 4.5;
          }
          break;

        case "red":
          if (element._id == "Red") {
            resultamount = element.sum_amount;
          }
          break;

        case "redwinamount":
          if (element._id == "Red") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 2;
          }
          break;

        case "redwinamountwithviolet":
          if (element._id == "Red") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 1.5;
          }
          break;

        case "zero":
          if (element._id == "0") {
            resultamount = element.sum_amount;
          }
          break;
        case "zerowinamount":
          if (element._id == "0") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "one":
          if (element._id == "1") {
            resultamount = element.sum_amount;
          }
          break;
        case "onewinamount":
          if (element._id == "1") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "two":
          if (element._id == "2") {
            resultamount = element.sum_amount;
          }
          break;
        case "twowinamount":
          if (element._id == "2") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "three":
          if (element._id == "3") {
            resultamount = element.sum_amount;
          }
          break;
        case "threewinamount":
          if (element._id == "3") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "four":
          if (element._id == "4") {
            resultamount = element.sum_amount;
          }
          break;
        case "fourwinamount":
          if (element._id == "4") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "five":
          if (element._id == "5") {
            resultamount = element.sum_amount;
          }
          break;
        case "fivewinamount":
          if (element._id == "5") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "six":
          if (element._id == "6") {
            resultamount = element.sum_amount;
          }
          break;
        case "sixwinamount":
          if (element._id == "6") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "seven":
          if (element._id == "7") {
            resultamount = element.sum_amount;
          }
          break;
        case "sevenwinamount":
          if (element._id == "7") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "eight":
          if (element._id == "8") {
            resultamount = element.sum_amount;
          }
          break;
        case "eightwinamount":
          if (element._id == "8") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        case "nine":
          if (element._id == "9") {
            resultamount = element.sum_amount;
          }
          break;
        case "ninewinamount":
          if (element._id == "9") {
            resultamount =
              (element.sum_amount - (element.sum_amount / 100) * 5) * 9;
          }
          break;

        default:
          break;
      }
    }

    return resultamount;
  } catch (error) {
    console.log(error);
  }
};
// module.exports.resultbyUser = async (periodid, number, result, openprice, tabtype) => {
//   console.log(periodid);

// }
// module.exports.resultbyUser = async (periodId, number, result, openPrice, tabType) => {
//   const colors = result.split('+');
//   const colorArray = colors.map(color => color.trim());

//   const filter = {
//     periodid: periodId,
//     tab: tabType,
//     // value: { $in: [number, ...colorArray] }
//   };

//   var bets = await Betting.find(filter);

//   if (bets.length === 0) {
//     console.log('No bets found for the given criteria.');
//     return;
//   }

//   const walletData = await Wallet.find({ userid: { $in: bets.map(bet => bet.userid) } });
//   const walletIdArray = walletData.reduce((acc, wallet) => {
//     acc[wallet.userid] = wallet.win_amount;
//     return acc;
//   }, {});

//   const userResultInserts = [];
//   const orderInserts = [];
//   const walletSummaryInserts = [];
//   const walletUpdateValues = {};

//   bets.forEach(bet => {
//     const status = parseInt(bet.value) === number || colorArray.includes(bet.value.toLowerCase()) ? 'success' : 'fail';
//     // bet.status = status;
//     const valueAmount = calculateValueAmount(bet, result, status);
//     const tax = calculateTax(bet);
//     // console.log(valueAmount);
//     // return true;
//     userResultInserts.push({
//       userid: bet.userid,
//       periodid: bet.periodid,
//       type: bet.type,
//       value: bet.value,
//       amount: bet.amount,
//       openprice: openPrice,
//       tab: bet.tab,
//       paidamount: valueAmount,
//       fee: tax,
//       status: (status === 'success') ? 1 : 0,
//       createdate: new Date()
//     });

//     if (status === 'success') {
//       const walletAmount = calculateWalletAmount(bet, valueAmount, walletIdArray[bet.userid], status);
//       orderInserts.push({
//         userid: bet.userid,
//         periodid: bet.periodid,
//         amount: valueAmount,
//         status: 1,
//         createdate: new Date()
//       });

//       const orderId = orderInserts.length; // Replace this with the actual order ID logic

//       walletSummaryInserts.push({
//         userid: bet.userid,
//         orderid: orderId,
//         amount: valueAmount,
//         wallet: walletAmount,
//         type: 'credit',
//         actiontype: 'win',
//         createdate: new Date()
//       });

//       if (!walletUpdateValues[bet.userid]) {
//         walletUpdateValues[bet.userid] = { winAmount: 0, amount: 0 };
//       }

//       // walletUpdateValues[bet.userid].winAmount += valueAmount - bet.amount;
//       walletUpdateValues[bet.userid].amount += valueAmount;
//     }
//   });

//   // Insert data into collections
//   await UserResult.insertMany(userResultInserts);
//   await Order.insertMany(orderInserts);
//   // await WinningHistory.insertMany(walletSummaryInserts);
//   await Walletsummery.insertMany(walletSummaryInserts);

//   // Update wallet collection
//   for (const userid in walletUpdateValues) {
//     await Wallet.updateOne(
//       { userid: userid },
//       {
//         $inc: {
//           // win_amount: walletUpdateValues[userid].winAmount,
//           amount: walletUpdateValues[userid].amount
//         }
//       }
//     );
//   }
//   return "users results Done ";
// };



module.exports.resultbyUser = async (periodId, number, result, openPrice, tabType) => {
  try {
    const colorArray = result.split("+").map(c => c.trim().toLowerCase());

    const filter = {
      periodid: periodId,
      tab: tabType,
    };

    const bets = await Betting.find(filter);
    if (bets.length === 0) {
      console.log("No bets found for the given criteria.");
      return "No bets found.";
    }

    console.log(`Found ${bets.length} bets for periodId ${periodId}`);

    const userIds = bets.map(b => b.userid);
    const walletData = await Wallet.find({ userid: { $in: userIds } });

    const walletMap = walletData.reduce((acc, w) => {
      acc[w.userid.toString()] = w.amount || 0;
      return acc;
    }, {});

    const walletUpdateValues = {};

    for (const bet of bets) {
      const betValue = bet.value.toLowerCase();
      const status =
        parseInt(bet.value) === number || colorArray.includes(betValue)
          ? "success"
          : "fail";

      const valueAmount = calculateValueAmount(bet, result, status);
      const tax = calculateTax(bet);
      let createdate = new Date();

      await UserResult.create({
        userid: bet.userid,
        periodid: bet.periodid,
        type: bet.type,
        value: bet.value,
        amount: bet.amount,
        openprice: openPrice,
        tab: bet.tab,
        paidamount: valueAmount,
        fee: tax,
        status: status === "success" ? 1 : 0,
        createdate
      })
        .then(() => console.log(`UserResult created for user ${bet.userid}`))
        .catch(err => console.error(`UserResult create error for user ${bet.userid}:`, err));

      if (status === "success") {
        const currentWallet = walletMap[bet.userid.toString()] || 0;
        const walletAmount = calculateWalletAmount(bet, valueAmount, currentWallet, status);

        await Order.create({
          userid: bet.userid,
          periodid: bet.periodid,
          amount: valueAmount,
          status: 1,
          createdate
        })
          .then(() => console.log(`Order created for user ${bet.userid}`))
          .catch(err => console.error(`Order create error for user ${bet.userid}:`, err));

        await Walletsummery.create({
          userid: bet.userid,
          amount: valueAmount,
          wallet: walletAmount,
          type: "credit",
          actiontype: "win",
          createdate
        })
          .then(() => console.log(`Walletsummery created for user ${bet.userid}`))
          .catch(err => console.error(`Walletsummery create error for user ${bet.userid}:`, err));

        if (!walletUpdateValues[bet.userid.toString()]) {
          walletUpdateValues[bet.userid.toString()] = { amount: 0 };
        }
        walletUpdateValues[bet.userid.toString()].amount += valueAmount;

        console.log(`User ${bet.userid} won ${valueAmount}, wallet updated to ${walletAmount}`);
      } else {
        console.log(`User ${bet.userid} lost, no wallet change`);
      }
    }

    for (const userid in walletUpdateValues) {
      await Wallet.updateOne(
        { userid: new Types.ObjectId(userid) },
        { $inc: { amount: walletUpdateValues[userid].amount } }
      )
        .then(() => console.log(`Wallet updated for user ${userid}`))
        .catch(err => console.error(`Wallet update error for user ${userid}:`, err));
    }

    console.log("All user results processed successfully.");
    return "User results processed successfully.";

  } catch (error) {
    console.error("Error in resultbyUser:", error);
    throw error;
  }
};
module.exports.fastWinResultByUser = async (periodId, number, result, openPrice, tabType) => {
  try {
    const colorArray = result.split("+").map(c => c.trim().toLowerCase());

    const filter = {
      periodid: periodId,
      tab: tabType,
    };

    const bets = await fastGameBetting.find(filter);
    if (bets.length === 0) {
      console.log("No bets found for the given criteria.");
      return "No bets found.";
    }

    console.log(`Found ${bets.length} bets for periodId ${periodId}`);

    const userIds = bets.map(b => b.userid);
    const walletData = await Wallet.find({ userid: { $in: userIds } });

    const walletMap = walletData.reduce((acc, w) => {
      acc[w.userid.toString()] = w.amount || 0;
      return acc;
    }, {});

    const walletUpdateValues = {};

    for (const bet of bets) {
      const betValue = bet.value.toLowerCase();
      const status =
        parseInt(bet.value) === number || colorArray.includes(betValue)
          ? "success"
          : "fail";

      const valueAmount = calculateValueAmount(bet, result, status);
      const tax = calculateTax(bet);
      let createdate = new Date();

      await fastWinUserResult.create({
        userid: bet.userid,
        periodid: bet.periodid,
        type: bet.type,
        value: bet.value,
        amount: bet.amount,
        openprice: openPrice,
        tab: bet.tab,
        paidamount: valueAmount,
        fee: tax,
        status: status === "success" ? 1 : 0,
        createdate
      })
        .then(() => console.log(`UserResult created for user ${bet.userid}`))
        .catch(err => console.error(`UserResult create error for user ${bet.userid}:`, err));

      if (status === "success") {
        const currentWallet = walletMap[bet.userid.toString()] || 0;
        const walletAmount = calculateWalletAmount(bet, valueAmount, currentWallet, status);

        await fastWinOrder.create({
          userid: bet.userid,
          periodid: bet.periodid,
          amount: valueAmount,
          status: 1,
          createdate
        })
          .then(() => console.log(`Order created for user ${bet.userid}`))
          .catch(err => console.error(`Order create error for user ${bet.userid}:`, err));

        await Walletsummery.create({
          userid: bet.userid,
          amount: valueAmount,
          wallet: walletAmount,
          type: "credit",
          actiontype: "win",
          createdate
        })
          .then(() => console.log(`Walletsummery created for user ${bet.userid}`))
          .catch(err => console.error(`Walletsummery create error for user ${bet.userid}:`, err));

        if (!walletUpdateValues[bet.userid.toString()]) {
          walletUpdateValues[bet.userid.toString()] = { amount: 0 };
        }
        walletUpdateValues[bet.userid.toString()].amount += valueAmount;

        console.log(`User ${bet.userid} won ${valueAmount}, wallet updated to ${walletAmount}`);
      } else {
        console.log(`User ${bet.userid} lost, no wallet change`);
      }
    }

    for (const userid in walletUpdateValues) {
      await Wallet.updateOne(
        { userid: new Types.ObjectId(userid) },
        { $inc: { amount: walletUpdateValues[userid].amount } }
      )
        .then(() => console.log(`Wallet updated for user ${userid}`))
        .catch(err => console.error(`Wallet update error for user ${userid}:`, err));
    }

    console.log("All user results processed successfully.");
    return "User results processed successfully.";

  } catch (error) {
    console.error("Error in resultbyUser:", error);
    throw error;
  }
};


module.exports.oneMinResultByUser = async (
  periodId,
  number,
  result,
  openPrice,
  tabType
) => {
  const colors = result.split("+");
  const colorArray = colors.map((color) => color.trim());

  const filter = {
    periodid: periodId,
    tab: tabType,
    // value: { $in: [number, ...colorArray] }
  };

  var bets = await oneMinBetting.find(filter);

  if (bets.length === 0) {
    console.log("No bets found for the given criteria.");
    return;
  }

  const walletData = await Wallet.find({
    userid: { $in: bets.map((bet) => bet.userid) },
  });
  const walletIdArray = walletData.reduce((acc, wallet) => {
    acc[wallet.userid] = wallet.win_amount;
    return acc;
  }, {});

  const userResultInserts = [];
  const orderInserts = [];
  const walletSummaryInserts = [];
  const walletUpdateValues = {};

  bets.forEach((bet) => {
    const status =
      parseInt(bet.value) === number ||
      colorArray.includes(bet.value.toLowerCase())
        ? "success"
        : "fail";
    // bet.status = status;
    const valueAmount = calculateValueAmount(bet, result, status);
    const tax = calculateTax(bet);
    // console.log(valueAmount);
    // return true;
    userResultInserts.push({
      userid: bet.userid,
      periodid: bet.periodid,
      type: bet.type,
      value: bet.value,
      amount: bet.amount,
      openprice: openPrice,
      tab: bet.tab,
      paidamount: valueAmount,
      fee: tax,
      status: status === "success" ? 1 : 0,
      createdate: new Date(),
    });

    if (status === "success") {
      const walletAmount = calculateWalletAmount(
        bet,
        valueAmount,
        walletIdArray[bet.userid],
        status
      );
      orderInserts.push({
        userid: bet.userid,
        periodid: bet.periodid,
        amount: valueAmount,
        status: 1,
        createdate: new Date(),
      });

      const orderId = orderInserts.length; // Replace this with the actual order ID logic

      walletSummaryInserts.push({
        userid: bet.userid,
        orderid: orderId,
        amount: valueAmount,
        wallet: walletAmount,
        type: "credit",
        actiontype: "win",
        createdate: new Date(),
      });

      if (!walletUpdateValues[bet.userid]) {
        walletUpdateValues[bet.userid] = { winAmount: 0, amount: 0 };
      }

      // walletUpdateValues[bet.userid].winAmount += valueAmount - bet.amount;
      walletUpdateValues[bet.userid].amount += valueAmount;
    }
  });

  // Insert data into collections
  await oneMinUserResult.insertMany(userResultInserts);
  await oneMinOrder.insertMany(orderInserts);
  // await WinningHistory.insertMany(walletSummaryInserts);
  await Walletsummery.insertMany(walletSummaryInserts);

  // Update wallet collection
  for (const userid in walletUpdateValues) {
    await Wallet.updateOne(
      { userid: userid },
      {
        $inc: {
          // win_amount: walletUpdateValues[userid].winAmount,
          amount: walletUpdateValues[userid].amount,
        },
      }
    );
  }
  return "users results Done ";
};

module.exports.oneMinUserCount = async (periodid, tab, values) => {
  var data = await oneMinBetting.aggregate([
    {
      $match: {
        periodid: periodid,
        tab: tab,
        value: { $in: values },
      },
    },
    {
      $group: {
        _id: "$userid",
      },
    },
  ]);
  // console.log(data.length);
  return data.length;
};
module.exports.fastWinUserCount = async (periodid, tab, values) => {
  var data = await fastGameBetting.aggregate([
    {
      $match: {
        periodid: periodid,
        tab: tab,
        value: { $in: values },
      },
    },
    {
      $group: {
        _id: "$userid",
      },
    },
  ]);
  return data.length;
};
module.exports.oneMinUserArray = async (periodid, tab, values) => {
  var data = await oneMinBetting.aggregate([
    {
      $match: {
        periodid: periodid,
        tab: tab,
        value: { $in: values },
      },
    },
    {
      $group: {
        _id: "$userid",
        // data: {
        //   $push: '$userid'
        // }
      },
    },
  ]);
  var userIdsSet = [];

  data.forEach((item) => userIdsSet.push(item._id));
  // console.log(data.length);
  return userIdsSet;
};
module.exports.fastWinUserArray = async (periodid, tab, values) => {
  var data = await fastGameBetting.aggregate([
    {
      $match: {
        periodid: periodid,
        tab: tab,
        value: { $in: values },
      },
    },
    {
      $group: {
        _id: "$userid",
        // data: {
        //   $push: '$userid'
        // }
      },
    },
  ]);
  var userIdsSet = [];

  data.forEach((item) => userIdsSet.push(item._id));
  // console.log(data.length);
  return userIdsSet;
};
module.exports.getusercount = async (periodid, tab, values) => {
  var data = await Betting.aggregate([
    {
      $match: {
        periodid: periodid,
        tab: tab,
        value: { $in: values },
      },
    },
    {
      $group: {
        _id: "$userid",
      },
    },
  ]);
  // console.log(data.length);
  return data.length;
};
module.exports.getuserArray = async (periodid, tab, values) => {
  var data = await Betting.aggregate([
    {
      $match: {
        periodid: periodid,
        tab: tab,
        value: { $in: values },
      },
    },
    {
      $group: {
        _id: "$userid",
        // data: {
        //   $push: '$userid'
        // }
      },
    },
  ]);
  var userIdsSet = [];

  data.forEach((item) => userIdsSet.push(item._id));
  // console.log(data.length);
  return userIdsSet;
};
function calculateValueAmount(bet, result, status) {
  console.log(status, result);
  if (status === "success") {
    if (result === "red+violet") {
      if (bet.value.toLowerCase() === "violet") {
        return truncate((bet.amount - (bet.amount / 100) * 5) * 4.5, 2);
      } else if (bet.value.toLowerCase() === "red") {
        return truncate((bet.amount - (bet.amount / 100) * 5) * 1.5, 2);
      } else if (bet.value.toLowerCase() === "green") {
        return truncate(bet.amount - (bet.amount / 100) * 5, 2);
      } else if (
        ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(bet.value)
      ) {
        return (bet.amount - (bet.amount / 100) * 5) * 9;
      }
    } else if (result === "green+violet") {
      if (bet.value.toLowerCase() === "violet") {
        return truncate((bet.amount - (bet.amount / 100) * 5) * 4.5, 2);
      } else if (bet.value.toLowerCase() === "red") {
        return truncate(bet.amount - (bet.amount / 100) * 5, 2);
      } else if (bet.value.toLowerCase() === "green") {
        return truncate((bet.amount - (bet.amount / 100) * 5) * 1.5, 2);
      } else if (
        ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(bet.value)
      ) {
        return (bet.amount - (bet.amount / 100) * 5) * 9;
      }
    } else {
      if (bet.value.toLowerCase() === "violet") {
        return truncate((bet.amount - (bet.amount / 100) * 5) * 4.5, 2);
      } else if (bet.value.toLowerCase() === "red") {
        return truncate((bet.amount - (bet.amount / 100) * 5) * 2, 2);
      } else if (bet.value.toLowerCase() === "green") {
        // console.log((bet.amount - (bet.amount / 100 * 5)) * 2);
        return truncate((bet.amount - (bet.amount / 100) * 5) * 2, 2);
      } else if (
        ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(bet.value)
      ) {
        return (bet.amount - (bet.amount / 100) * 5) * 9;
      }
    }
  } else {
    if (bet.value.toLowerCase() === "violet") {
      return truncate(bet.amount - (bet.amount / 100) * 5, 2);
    } else if (bet.value.toLowerCase() === "red") {
      return truncate(bet.amount - (bet.amount / 100) * 5, 2);
    } else if (bet.value.toLowerCase() === "green") {
      return truncate(bet.amount - (bet.amount / 100) * 5, 2);
    } else if (
      ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(bet.value)
    ) {
      return bet.amount - (bet.amount / 100) * 5;
    }
  }

  // console.log(bet);

  // return true;
  return 0; // Default value if no condition is met
}

function calculateTax(bet) {
  if (["green", "violet", "red"].includes(bet.value.toLowerCase())) {
    return truncate((bet.amount / 100) * 5, 2);
  } else if (
    ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(bet.value)
  ) {
    return (bet.amount / 100) * 5;
  }
  return 0; // Default value if no condition is met
}

function calculateWalletAmount(bet, valueAmount, currentWalletAmount, status) {
  // Assuming you want to update the wallet amount only if the bet status is 'success'
  if (status === "success") {
    return currentWalletAmount + (valueAmount - bet.amount);
  }
  return currentWalletAmount; // Return the same amount if the status is not 'success'
}

function truncate(value, decimals) {
  // Helper function to truncate decimal places
  const multiplier = Math.pow(10, decimals);
  return Math.trunc(value * multiplier) / multiplier;
}

module.exports.bate_reward = async (mycode, userid, maincomison) => {
  const form_user_id = userid;
  const date = new Date().toISOString();

  // const users = await Users.find({ owncode: mycode });
  const lavelUsers = await Lavelusers.find({ status: true });

  const periodid = `${date.replace(/\D/g, "")}${Math.floor(
    100 + Math.random() * 10000000
  )}`;

  for (const value of lavelUsers) {
    const i = value.lavel_id;
    const rewardAmount = (maincomison * value.percentage) / 100;

    const user = await Users.findOne({ ownCode: mycode });

    if (user) {
      const bonus = await Bonus.findOne({ userid: user._id });
      const wallet = await Wallet.findOne({ userid: user._id });

      if (bonus && wallet) {
        await Bonussummery.create({
          userid: form_user_id,
          periodid: periodid,
          laveluser: user._id,
          lavel: i,
          amount: rewardAmount,
        });

        wallet.amount += rewardAmount;
        await wallet.save();

        bonus.amount += rewardAmount;
        await bonus.save();

        await Walletsummery.create({
          userid: user._id,
          orderid: periodid,
          amount: rewardAmount,
          wallet: wallet.amount,
          type: "credit",
          sender_id: form_user_id,
          actiontype: "water reward",
          createdate: date,
        });
      }
    }
  }
};

module.exports.catchBlock = catchBlock;
