const helper = require("../helpers/utils.helper");
const Users = require("../models/user");
const Wallet = require("../models/wallet");
const Betting = require("../models/betting");
const order = require("../models/order");
const Walletsummery = require("../models/walletsummery");
const Gameid = require("../models/gameid");
const Result = require("../models/result");
const UserResult = require("../models/userresult");
const ManualResult = require("../models/manualresult");
const Manualresultswitch = require("../models/manualresultswitch");
const CountryCodes = require("../models/country_codes");
var ObjectId = require("mongoose").Types.ObjectId;
const paymetsetting = require("../models/paymentsetting");
const Lavelusers = require("../models/lavelusers");

const batenow = async function (req, res) {
  try {
    const user = req.user;
    const input = req?.body;
    const check = await Users.countDocuments({
      _id: user._id,
      play: 1,
    });
    if (check > 0) {
      return res.status(200).json({
        message: "Network Unavailable",
        response: 0,
        success: false,
      });
    }
    const getUserDetails = await Users.findById(user._id);
    if (!getUserDetails) {
      return res.status(404).json({ message: "User not found" });
    }
    const userCompleteRechargeDetails = getUserDetails?.code;
    if (userCompleteRechargeDetails) {
      const level1User = await Users.findOne({
        owncode: userCompleteRechargeDetails,
      });
      if (level1User) {
        const level2User = await Users.findOne({ owncode: level1User.code });
        const level3User = level2User
          ? await Users.findOne({ owncode: level2User.code })
          : null;
        const levels = await Lavelusers.find({ lavel_id: { $in: [1, 2, 3] } });
        const levelPercentages = levels.reduce((acc, level) => {
          acc[level.lavel_id] = level.percentage;
          return acc;
        }, {});

        // Apply bonuses
        const distributeBonus = async (referralUser, percentage) => {
          if (!referralUser) return;
          const wallet = await Wallet.findOne({ userid: referralUser._id });
          const bonusAmounts = (input?.finalamount * 5) / 100;
          const bonusAmount = (bonusAmounts * percentage) / 100;

          if (wallet) {
            const updatedAmount = wallet?.amount + bonusAmount;
            await Wallet.findOneAndUpdate(
              { userid: referralUser._id },
              { amount: updatedAmount },
              { new: true }
            );

            await Walletsummery.create({
              userid: referralUser._id,
              orderid: "-",
              amount: bonusAmount,
              sender_id: user._id,
              type: "credit",
              wallet: updatedAmount,
              actiontype: "bonus",
            });
          }
        };
        await distributeBonus(level1User, levelPercentages[1] || 30);
        await distributeBonus(level2User, levelPercentages[2] || 20);
        await distributeBonus(level3User, levelPercentages[3] || 10);
      }
    }

    if (input.counter < 30) {
      return res.status(200).json({ success: false, message: "Time Out" });
    } else {
      if (input.finalamount < 1) {
        return res
          .status(200)
          .json({ success: false, message: "Amount Is Not valid" });
      } else {
        const walt = await Wallet.findOne({
          amount: { $gte: input?.finalamount },
          userid: user._id,
        });

        if (walt == null) {
          return res
            .status(200)
            .json({ success: false, message: "Your balance is insufficient" });
        } else {
          walt.amount -= input.finalamount;
          await walt.save();

          const data = await Betting.create({
            userid: user._id,
            periodid: input?.inputgameid,
            type: input?.type,
            value: input?.value,
            amount: input?.finalamount,
            tab: input?.tab,
          });

          // const reward_amount = (input.finalamount * 5) / 100;
          // await helper.bate_reward(user.code, user._id, reward_amount);

          function generateTransactionId(userId) {
            return `${Date.now()}${Math.random()
              .toString(36)
              .substring(7)}${userId}`;
          }

          const tranorderid = generateTransactionId(user._id);

          await order.create({
            userid: user._id,
            tranorderid: tranorderid,
            amount: input?.finalamount,
            status: true,
          });

          await Walletsummery.create({
            userid: user._id,
            orderid: tranorderid,
            amount: input?.finalamount,
            type: "debit",
            wallet: walt.amount,
            actiontype: "join",
          });
          console.log("3 min user bate ==>", data);
          return res.status(200).json({
            data: data,
            success: true,
            message: "success",
          });
        }
      }
    }
  } catch (error) {
    console.log("3 min user bate fail", error);
    res.status(500).send({
      message: error.message,
      response: 0,
      success: false,
    });
  }
};

const gameid = async function (req, res) {
  try {
    const game_id = await Gameid.findOne().sort({ _id: -1 }).limit(1);
    res.status(200).json({
      data: game_id,
      message: "success",
      response: 1,
      success: true,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      message: error.message,
      response: 0,
      status: false,
    });
  }
};

const getResultbyCategory = async function (req, res) {
  const user = req?.user;
  const input = req?.body;
  const page = input?.page || 1;
  const pagerow = input?.pagerow || 10;
  const skip = (page - 1) * pagerow;
  const category = input?.category;

  try {
    const result = await Result.find({
      tabtype: category,
    })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pagerow);

    let data = result.map((value) => ({
      id: value?._id,
      periodid: value?.periodid,
      price: value?.price,
      randomprice: value?.randomprice,
      randomresult:
        value?.resulttype == "real" ? value?.result : value?.randomresult,
      randomcolor:
        value?.resulttype == "real" ? value?.color : value?.randomcolor,
      resulttype: value?.resulttype,
      tabtype: value?.tabtype,
      createdate: value?.createdate,
    }));

    const total = await Result.countDocuments({ tabtype: category });

    return res.status(200).json({
      data: data,
      message: "success",
      response: 1,
      success: true,
      total: total,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// const userresult = async function (req, res) {
//   try {
//     var user = req.user;
//     var input = req?.body;
//     var page = parseInt(input?.page) || 1;
//     var pagerow = parseInt(input?.pagerow) || 10;
//     var category = input?.category;
//     var periodid = input?.periodid;
//     var skip = (page - 1) * pagerow;

//     let currentPeriodId = await Gameid.findOne().sort({ _id: -1 }).limit(1).select("gameid");
//     const bettingQuery = {
//       userid: user._id,
//       created_at: { $gte: new Date().setHours(0, 0, 0, 0) },
//       tab: category,
//       periodid: periodid ? periodid : currentPeriodId.gameid,
//     };
//     const result = await Betting.find(bettingQuery).skip(skip).limit(pagerow);
//     const result1 = await Betting.find(bettingQuery);

//     // skip = (page > 0) ?   : (page - 1) * pagerow - result.length;
//     let k = pagerow - result.length;
//     let q = result1.length / pagerow;
//     let t = page - Math.floor(q);
//     t = t - 1;
//     let c = Math.round(Math.abs(t * pagerow));
//     if (q % 1 !== 0) {
//       c = Math.round(Math.abs(c - (q % 1)));
//     }

//     // return true;
//     const resultCount = await Betting.countDocuments(bettingQuery);
//     var UserResults = [];
//     if (k != 0) {
//       UserResults = await UserResult.aggregate([
//         {
//           $match: { userid: new ObjectId(user._id) },
//         },
//         {
//           $lookup: {
//             from: "results",
//             localField: "periodid",
//             foreignField: "periodid",
//             as: "Result",
//           },
//         },
//       ])
//         .sort({ _id: -1 })
//         .skip(c)
//         .limit(k);
//     }

//     const total = await UserResult.aggregate([
//       {
//         $match: { userid: new ObjectId(user._id) },
//       },
//       {
//         $lookup: {
//           from: "results",
//           localField: "periodid",
//           foreignField: "periodid",
//           as: "Result",
//         },
//       },
//     ]);

//     const data = [];
//     for (const value of UserResults) {
//       const item = {
//         id: value?._id,
//         periodid: value?.periodid,
//         contract_money: value?.amount,
//         contract_count: "1",
//         delivery: value?.paidamount.toFixed(2),
//         fee: value?.fee.toFixed(2),
//         open_price: value?.openprice,
//         select: value?.value,
//         status: value?.status ? "success" : "Fail",
//         amount: value?.paidamount.toFixed(2),
//         created_at: value?.created_at,
//         type: value?.tab,
//         result_number:
//           value?.Result[0]?.resulttype == "real"
//             ? value?.Result[0]?.result
//             : value?.Result[0]?.randomresult,
//         result_color:
//           value?.Result[0]?.resulttype == "real"
//             ? value?.Result[0]?.color
//             : value?.Result[0]?.randomcolor,
//       };
//       data.push(item);
//     }
//     const totalDocumentsCount = total.length + resultCount;
//     const success = {
//       message: "Success",
//       response: 1,
//       success: true,
//       currentpage: page,
//       total: totalDocumentsCount,
//       totalPages: Math.ceil(totalDocumentsCount / pagerow),
//       waitlist: result,
//       data: data,
//     };
//     return res.status(200).send(success);
//   } catch (error) {
//     console.log("error", error)
//     return res
//       .status(500)
//       .send({ success: false, message: "Internal Server Error" });
//   }
// };

const userresult = async function (req, res) {
  try {
    const user = req.user;
    const input = req.body;
    const page = Math.max(1, parseInt(input?.page, 10) || 1);
    const pageRow = Math.max(1, parseInt(input?.pagerow, 10) || 10);
    const category = input?.category;
    const periodId = input?.periodid;
    const skip = (page - 1) * pageRow;

    const currentPeriodId = await Gameid.findOne()
      .sort({ _id: -1 })
      .limit(1)
      .select("gameid");

    if (!currentPeriodId && !periodId) {
      return res.status(404).send({
        success: false,
        message: "No game period found",
      });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const bettingQuery = {
      userid: user._id,
      created_at: { $gte: startOfDay },
      tab: category,
      periodid: periodId || currentPeriodId.gameid,
    };

    const [result, resultCount] = await Promise.all([
      Betting.find(bettingQuery).skip(skip).limit(pageRow),
      Betting.countDocuments(bettingQuery),
    ]);

    // Simplified logic - remove the complex skip calculation
    const remainingSlots = pageRow - result.length;
    let UserResults = [];

    if (remainingSlots > 0) {
      UserResults = await UserResult.aggregate([
        { $match: { userid: new ObjectId(user._id) } },
        {
          $lookup: {
            from: "results",
            localField: "periodid",
            foreignField: "periodid",
            as: "Result",
          },
        },
      ])
        .sort({ _id: -1 })
        .skip(Math.max(0, skip - resultCount))
        .limit(remainingSlots);
    }

    const totalUserResults = await UserResult.countDocuments({
      userid: new ObjectId(user._id),
    });

    const data = UserResults.map((value) => ({
      id: value?._id,
      periodid: value?.periodid,
      contract_money: value?.amount,
      contract_count: "1",
      delivery: value?.paidamount?.toFixed(2) || "0.00",
      fee: value?.fee?.toFixed(2) || "0.00",
      open_price: value?.openprice,
      select: value?.value,
      status: value?.status ? "success" : "Fail",
      amount: value?.paidamount?.toFixed(2) || "0.00",
      created_at: value?.created_at,
      type: value?.tab,
      result_number:
        value?.Result?.[0]?.resulttype === "real"
          ? value.Result[0].result
          : value.Result[0]?.randomresult,
      result_color:
        value?.Result?.[0]?.resulttype === "real"
          ? value.Result[0].color
          : value.Result[0]?.randomcolor,
    }));

    const totalDocumentsCount = totalUserResults + resultCount;

    return res.status(200).send({
      message: "Success",
      response: 1,
      success: true,
      currentpage: page,
      total: totalDocumentsCount,
      totalPages: Math.ceil(totalDocumentsCount / pageRow),
      waitlist: result,
      data: data,
    });
  } catch (error) {
    console.error("Error in userresult:", error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const userresult1 = async function (req, res) {
  try {
    const user = req?.user;
    const input = req?.body;

    const page = input?.page || 1;
    const pagerow = input?.pagerow || 10;
    const skip = (page - 1) * pagerow;
    const category = input?.category;
    const periodid = input?.periodid;
    const levelTab = input?.levelTab;

    const query =
      levelTab === 3
        ? { status: false }
        : levelTab === 4
        ? { status: true }
        : {};

    const resultQuery = {
      userid: user._id,
      created_at: { $gte: new Date().setHours(0, 0, 0, 0) },
      tab: category,
      periodid: periodid,
      ...query,
    };
    const [result, resultCount, userResults] = await Promise.all([
      Betting.find(resultQuery).skip(skip).limit(pagerow),
      Betting.countDocuments(resultQuery),
      UserResult.aggregate([
        { $match: { userid: new ObjectId(user._id), ...query } },
        {
          $lookup: {
            from: "results",
            localField: "periodid",
            foreignField: "periodid",
            as: "Result",
          },
        },
        { $sort: { _id: -1 } },
        { $skip: skip },
        { $limit: pagerow },
      ]),
    ]);

    const orderlist = userResults.map((value) => ({
      id: value?._id,
      period: value?.periodid,
      contract_money: value?.amount,
      contract_count: "1",
      delivery: value?.paidamount?.toFixed(2) || "0.00",
      fee: value?.fee?.toFixed(2) || "0.00",
      open_price: value?.openprice,
      result_number:
        value?.Result[0]?.resulttype == "real"
          ? value?.Result[0]?.result
          : value?.Result[0]?.randomresult,
      result_color:
        value?.Result[0]?.resulttype == "real"
          ? value?.Result[0]?.color
          : value?.Result[0]?.randomcolor,
      select: value?.value,
      status: value?.status ? "success" : "Fail",
      amount: value?.paidamount?.toFixed(2) || "0.00",
      created_at: value?.created_at,
      type: value?.tab,
    }));

    const data = {
      loss: userResults.some((value) => value.status === false),
      win: userResults.some((value) => value.status === true),
      wait: result.length > 0,
    };

    // Get the total count using a single query for optimized performance
    const userResultsCount = await UserResult.countDocuments({
      userid: new ObjectId(user._id),
      ...query,
    });
    const totalDocumentsCount = resultCount + userResultsCount;

    return res.json({
      success: true,
      message: "Success",
      data,
      total: totalDocumentsCount,
      waitlist: result,
      orderlist,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getcountrycode = async function (req, res) {
  try {
    let data = await CountryCodes.find();

    res.status(200).json({
      data: data,
      message: "Success",
      response: 1,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      message: "Feild",
      response: o,
    });
  }
};

const checkMissingUserResult = async (req, res) => {
  try {
    const { periodId, tabType } = req.body;

    if (!periodId || !tabType) {
      return res.status(400).json({ message: "periodId and tabType are required." });
    }

    const bets = await Betting.find({ periodid: periodId, tab: tabType });
    console.log("bets", bets.length);
    if (bets.length === 0) {
      return res.json({ message: "No bets found for this period/tab." });
    }
    const userResults = await UserResult.find({ periodid: periodId, tab: tabType });
    console.log("userResults", userResults.length);
    const missingBets = [];

    for (const bet of bets) {
      const resultExists = userResults.some(ur =>
        ur.userid.toString() === bet.userid.toString() &&
        Number(ur.periodid) === Number(bet.periodid) &&
        ur.type?.toLowerCase() === bet.type?.toLowerCase() &&
        ur.value?.toLowerCase().trim() === bet.value?.toLowerCase().trim() &&
        ur.tab?.toLowerCase() === bet.tab?.toLowerCase() &&
        ur.amount === bet.amount
      );

      if (!resultExists) {
        missingBets.push({
          userid: bet.userid,
          periodid: bet.periodid,
          type: bet.type,
          value: bet.value,
          amount: bet.amount,
          tab: bet.tab,
        });
      }
    }

    if (missingBets.length === 0) {
      return res.json({ message: "All bets have UserResults." });
    } else {
      return res.json({
        message: "Some bets are missing UserResults.",
        missingBets, 
        bets: bets.length,
        userResults: userResults.length
      });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = {
  batenow: batenow,
  gameid: gameid,
  getResultbyCategory: getResultbyCategory,
  userresult: userresult,
  userresult1: userresult1,
  getcountrycode: getcountrycode,
  checkMissingUserResult:checkMissingUserResult
};
