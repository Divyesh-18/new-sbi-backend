const admins = require("../../models/admin/admin_login");
const Users = require("../../models/user");
const Wallet = require("../../models/wallet");
const Walletsummery = require("../../models/walletsummery");
const withdrawal = require("../../models/withdrawal");
const Manualresult = require("../../models/manualresult");
const DataTable = require("../../models/admin/datatable");
const Betting = require("../../models/betting");
const Gameid = require("../../models/gameid");
const paymetsetting = require("../../models/paymentsetting");
const helper = require("../../helpers/utils.helper");
const multer = require("multer");
const notificationdata = require("../../models/notificationdata");
const banner = require("../../models/banners");
const Products = require("../../models/product");
const Lavelusers = require("../../models/lavelusers");
const UserResult = require("../../models/userresult");
const BankDetail = require("../../models/bankdetail");
const { ObjectId } = require("mongodb");
const complaint = require("../../models/complaint");
const paymentsetting = require("../../models/paymentsetting");
const fs = require("fs");
const path = require("path");
const ManualResult = require("../../models/manualresult");
const Manualresultswitch = require("../../models/manualresultswitch");
const WinningWalletHistory = require("../../models/WinningWalletHistory");
const redEnvelope = require("../../models/redEnvelope");
const Complaints = require("../../models/complaint");
const attendances = require("../../models/attendance");
const { catchBlock } = require("../../helpers/utils.helper");

const desktop = async (req, res) => {
  try {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const [
      TotalUser,
      TotalBalanceAgg,
      ActiveUser,
      TodayRechargeAgg,
      TodayWithdrawalAgg,
      winAgg,
      ProfitAgg,
      RechargeAgg,
      PendingRechargesAgg,
      SuccessRechargeAgg,
      RejectRechargeAgg,
      PendingWithdrawalsAgg,
      ApprovedWithdrawalsAgg,
      RejectWithdrawalsAgg,
      LossAgg,
      TodayWithdrawalsAgg
    ] = await Promise.all([
      Users.countDocuments(),
      Wallet.aggregate([{ $group: { _id: null, totalBalance: { $sum: "$amount" } } }]),
      Users.countDocuments({ active: true }),
      Walletsummery.aggregate([
        { $match: { actiontype: "recharge", createdate: { $gte: currentDate } } },
        { $group: { _id: null, totalRecharge: { $sum: "$amount" } } },
      ]),
      withdrawal.aggregate([
        { $match: { createdate: { $gte: currentDate } } },
        { $group: { _id: null, totalWithdrawal: { $sum: "$amount" } } },
      ]),
      WinningWalletHistory.aggregate([
        {
          $match: {
            createdate: { $gte: currentDate },
            actiontype: { $in: ["join", "interest", "bate-bonus", "win"] },
            type: "credit",
          },
        },
        { $group: { _id: null, amount: { $sum: "$amount" } } },
      ]),
      Walletsummery.aggregate([
        {
          $match: {
            createdate: { $gte: currentDate },
            actiontype: { $in: ["join", "interest", "bate-bonus", "win"] },
            type: "debit",
          },
        },
        { $group: { _id: null, totalProfit1: { $sum: "$amount" } } },
      ]),
      Walletsummery.aggregate([
        {
          $match: { actiontype: "recharge", createdate: { $gte: currentDate } },
        },
        { $group: { _id: null, successrecharge1: { $sum: "$amount" } } },
      ]),
      Walletsummery.aggregate([
        { $match: { actiontype: "recharge-pending" } },
        { $group: { _id: null, pendingrecharge: { $sum: "$amount" } } },
      ]),
      Walletsummery.aggregate([
        { $match: { actiontype: "recharge" } },
        { $group: { _id: null, successrecharge: { $sum: "$amount" } } },
      ]),
      Walletsummery.aggregate([
        { $match: { actiontype: "recharge-reject" } },
        { $group: { _id: null, rejectrecharge: { $sum: "$amount" } } },
      ]),
      withdrawal.aggregate([
        { $match: { status: 2 } },
        { $group: { _id: null, pendingwithdrawalrequests: { $sum: "$amount" } } },
      ]),
      withdrawal.aggregate([
        { $match: { status: 1 } },
        { $group: { _id: null, approvedwithdrawalrequests: { $sum: "$amount" } } },
      ]),
      withdrawal.aggregate([
        { $match: { status: 0 } },
        { $group: { _id: null, rejectwithdrawalrequests: { $sum: "$amount" } } },
      ]),
      Walletsummery.aggregate([
        {
          $match: {
            createdate: { $gte: currentDate },
            actiontype: { $in: ["join", "interest", "bate-bonus", "win"] },
            type: "credit",
          },
        },
        { $group: { _id: null, loss1: { $sum: "$amount" } } },
      ]),
      withdrawal.aggregate([
        {
          $match: {
            status: 1,
            createdate: { $gte: currentDate },
          },
        },
        { $group: { _id: null, totalWithdrawalAmount: { $sum: "$amount" } } },
      ]),
    ]);
    const getValue = (arr, key) => (arr.length > 0 ? arr[0][key] : 0);

    const win = getValue(winAgg, "amount");
    const profit = getValue(ProfitAgg, "totalProfit1");
    const recharge = getValue(RechargeAgg, "successrecharge1");

    const adminProfitAmount = profit - win;
    const totalProfit = recharge + adminProfitAmount;

    const totalLoss =
      getValue(LossAgg, "loss1") +
      getValue(TodayWithdrawalsAgg, "totalWithdrawalAmount") +
      win;

    const data = {
      TotalUser,
      TotalBalance: getValue(TotalBalanceAgg, "totalBalance"),
      ActiveUser,
      TodayRecharge: getValue(TodayRechargeAgg, "totalRecharge"),
      TodayWithdrawal: getValue(TodayWithdrawalAgg, "totalWithdrawal"),
      Profit: totalProfit,
      PendingRecharges: getValue(PendingRechargesAgg, "pendingrecharge"),
      SuccessRecharge: getValue(SuccessRechargeAgg, "successrecharge"),
      RejectRecharge: getValue(RejectRechargeAgg, "rejectrecharge"),
      PendingWithdrawalRequests: getValue(PendingWithdrawalsAgg, "pendingwithdrawalrequests"),
      ApprovedWithdrawalRequests: getValue(ApprovedWithdrawalsAgg, "approvedwithdrawalrequests"),
      RejectWithdrawalRequests: getValue(RejectWithdrawalsAgg, "rejectwithdrawalrequests"),
      Loss: totalLoss,
    };

    return res.status(200).json({
      status: true,
      message: "Dashboard data",
      data,
    });

  } catch (error) {
    return catchBlock(res, error);
  }
};
const AllUser = async (req, res) => {
  try {
    const input = req.body;
    const page = parseInt(input.page) || 1;
    const pageSize = parseInt(input.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    const searchTerms = input.searchTerms;
    const search = searchTerms;
    const query = {};

    if (search) {
      const isNumericSearch = /^\d+$/.test(search);
      const orConditions = [
        { owncode: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
      if (isNumericSearch) {
        orConditions.push({ mobile: Number(search) });
      }
      query.$or = orConditions;
    }

    const users = await Users.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ _id: -1 })
      .lean();

    const totalDocumentsCount = await Users.countDocuments(query);

    const userIds = users.map(user => user._id);

    const [
      wallets,
      banks,
      recharges,
      firstRecharges,
      withdrawals
    ] = await Promise.all([
      Wallet.aggregate([
        { $match: { userid: { $in: userIds } } },
        { $group: { _id: "$userid", totalUserWallet: { $sum: "$amount" } } }
      ]),
      BankDetail.find({ userid: { $in: userIds } }).lean(),
      Walletsummery.aggregate([
        { $match: { userid: { $in: userIds }, actiontype: "recharge" } },
        { $group: { _id: "$userid", totalRechargeAmount: { $sum: "$amount" } } }
      ]),
      Walletsummery.aggregate([
        { $match: { userid: { $in: userIds }, actiontype: "recharge" } },
        { $sort: { createdAt: 1 } },
        { $group: { _id: "$userid", firstAmount: { $first: "$amount" } } }
      ]),
      withdrawal.aggregate([
        { $match: { userid: { $in: userIds }, status: 1 } },
        { $group: { _id: "$userid", withdrawalAmount: { $sum: "$amount" } } }
      ])
    ]);

    // Convert results to maps for quick lookup
    const walletMap = Object.fromEntries(wallets.map(item => [item._id.toString(), item.totalUserWallet]));
    const bankMap = Object.fromEntries(banks.map(item => [item.userid.toString(), item]));
    const rechargeMap = Object.fromEntries(recharges.map(item => [item._id.toString(), item.totalRechargeAmount]));
    const firstRechargeMap = Object.fromEntries(firstRecharges.map(item => [item._id.toString(), item.firstAmount]));
    const withdrawalMap = Object.fromEntries(withdrawals.map(item => [item._id.toString(), item.withdrawalAmount]));

    // Merge extra info into users
    const finalData = users.map(user => {
      const id = user._id.toString();
      return {
        ...user,
        userwallet: { totalUserWallet: walletMap[id] || 0 },
        userbankdetail: bankMap[id] || {
          name: "",
          ifsc_code: "",
          bank_code: "",
          bank_account: "",
          upi: "",
        },
        userrechargeamount: { totalRechargeAmount: rechargeMap[id] || 0 },
        userfirstrecharge: { totalFirstRechargeAmount: firstRechargeMap[id] || 0 },
        userwithdrawals: { withdrawalAmount: withdrawalMap[id] || 0 },
      };
    });

    return res.status(200).json({
      data: finalData,
      totalPages: Math.ceil(totalDocumentsCount / pageSize),
      currentPage: page,
      totalCount: totalDocumentsCount,
      message: "user is existed",
      response: 1,
      success: true,
    });

  } catch (error) {
    return catchBlock(res, error);
  }
};

const adminDetail = async function (req, res) {
  const adminId = req.admin;
  try {
    const adminData = await admins.findOne({ _id: adminId });
    if (!adminData) {
      return res.status(404).json({
        message: "Admin not found.",
        response: 0,
        success: false,
      });
    }
    return res.status(200).json({
      message: "Success",
      response: 1,
      success: true,
      adminData: adminData,
    });
  } catch (error) {
    return catchBlock(res, error);
  }
};
const datatable = async (req, res) => {
  try {
    const input = req.body;
    const page = parseInt(input.page || 1);
    const pagerow = parseInt(input.pagerow || 10);
    const skip = (page - 1) * pagerow;
    const searchTerms = input?.searchTerms || "";

    const query = {};
    if (searchTerms) {
      const searchConditions = [];
      const numberSearch = Number(searchTerms);
      const isNumber = !isNaN(numberSearch);
      if (!isNumber) {
        searchConditions.push({ gameid: { $regex: searchTerms, $options: "i" } });
      } else {
        searchConditions.push({ gameid: numberSearch });
      }
      searchConditions.push(
        { userTotalBateAmount: numberSearch },
        { TotalWinAmount: numberSearch },
        { profitLoss: numberSearch }
      );
      query.$or = searchConditions;
    }

    const [games, totalCount] = await Promise.all([
      Gameid.find(query)
        .sort({ gameid: -1 })
        .skip(skip)
        .limit(pagerow)
        .select("gameid created_at")
        .lean(),
      Gameid.countDocuments(query),
    ]);

    const gameIds = games.map((g) => g.gameid);

    const [betResults, winResults] = await Promise.all([
      Betting.aggregate([
        { $match: { periodid: { $in: gameIds } } },
        { $group: { _id: "$periodid", total: { $sum: "$amount" } } },
      ]),
      UserResult.aggregate([
        { $match: { periodid: { $in: gameIds }, status: true } },
        { $group: { _id: "$periodid", total: { $sum: "$paidamount" } } },
      ]),
    ]);

    const betMap = Object.fromEntries(betResults.map((b) => [b._id, b.total]));
    const winMap = Object.fromEntries(winResults.map((w) => [w._id, w.total]));

    const data = games.map((game) => {
      const userTotalBateAmount = betMap[game.gameid] || 0;
      const TotalWinAmount = winMap[game.gameid] || 0;
      const profitLoss = userTotalBateAmount - TotalWinAmount;
      return {
        ...game,
        userTotalBateAmount,
        TotalWinAmount,
        profitLoss,
      };
    });

    return res.status(200).json({
      data,
      totalPages: Math.ceil(totalCount / pagerow),
      currentPage: page,
      totalCount,
      message: "Data fetched successfully",
      response: 1,
      success: true,
    });
  } catch (error) {
    return catchBlock(res, error);
  }
};

const walletHistory = async function (req, res) {
  try {
    const input = req.body;
    const page = parseInt(input.page) || 1;
    const pageSize = parseInt(input.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    const searchTerms = input.searchTerms;

    let filter = {};
    let userIdsFromMobileSearch = [];

    if (searchTerms) {
      const orConditions = [];

      orConditions.push({ orderid: { $regex: searchTerms, $options: "i" } });
      orConditions.push({ type: { $regex: searchTerms, $options: "i" } });
      orConditions.push({ actiontype: { $regex: searchTerms, $options: "i" } });

      const numericSearch = Number(searchTerms);
      if (!isNaN(numericSearch)) {
        orConditions.push({ amount: numericSearch });
        orConditions.push({ wallet: numericSearch });
      }
      const isMobileNumber = /^\d{6,15}$/.test(searchTerms);
      if (isMobileNumber) {
        const mobileNumber = Number(searchTerms);
        const matchedUsers = await Users.find(
          { mobile: mobileNumber },
          { _id: 1 }
        ).lean();
        userIdsFromMobileSearch = matchedUsers.map(u => u._id.toString());
        if (userIdsFromMobileSearch.length > 0) {
          orConditions.push({ userid: { $in: userIdsFromMobileSearch } });
        }
      }

      filter.$or = orConditions;
    }

    const walletData = await Walletsummery.find(filter)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const userIds = [...new Set(walletData.map(w => w.userid?.toString()))];
    const userMap = {};

    if (userIds.length) {
      const users = await Users.find(
        { _id: { $in: userIds } },
        { _id: 1, mobile: 1 }
      ).lean();
      users.forEach(user => {
        userMap[user._id.toString()] = user.mobile;
      });
    }

    const enrichedData = walletData.map(entry => ({
      _id: entry._id,
      userid: entry.userid || "-",
      orderid: entry.orderid || "-",
      amount: entry.amount || 0,
      wallet: entry.wallet || 0,
      type: entry.type || "-",
      actiontype: entry.actiontype || "-",
      createdate: entry.createdate || "-",
      mobile: userMap[entry.userid?.toString()] || "-",
    }));

    const total = await Walletsummery.countDocuments(filter);

    return res.status(200).json({
      data: enrichedData,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
      total: total,
      message: "Success",
      response: 1,
    });
  } catch (error) {
    return catchBlock(res, error);
  }
};

const WithdrawalRequest = async (req, res) => {
  let input = req.body;
  let page = input.page || 1;
  let pageSize = input.pageSize || 10;
  let skip = (page - 1) * pageSize;
  const searchTerms = input?.searchTerms;
  try {
    let pipeline = [
      {
        $match: {
          status: { $in: [2, 3] },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userid",
          foreignField: "_id",
          as: "userpendingrechargedata",
        },
      },
      {
        $lookup: {
          from: "bankdetails",
          localField: "userid",
          foreignField: "userid",
          as: "bankdetail",
        },
      },
      {
        $addFields: {
          mobile: {
            $arrayElemAt: ["$userpendingrechargedata.mobile", 0],
          },
          name: {
            $arrayElemAt: ["$bankdetail.name", 0],
          },
          ifsc_code: {
            $arrayElemAt: ["$bankdetail.ifsc_code", 0],
          },
          bank_code: {
            $arrayElemAt: ["$bankdetail.bank_code", 0],
          },
          bank_account: {
            $arrayElemAt: ["$bankdetail.bank_account", 0],
          },
        },
      },
      {
        $project: {
          _id: 1,
          userid: 1,
          amount: 1,
          paybleamount: 1,
          payout: 1,
          type: 1,
          status: 1,
          createdate: 1,
          mobile: 1,
          name: 1,
          ifsc_code: 1,
          bank_code: 1,
          bank_account: 1,
        },
      },
      { $sort: { _id: -1 } },
    ];

    let totalDocumentsCount = 0;

    if (searchTerms) {
      pipeline.push(
        {
          $match: {
            status: 2,
          },
        },
        {
          $addFields: {
            search_usermobile: { $toString: "$mobile" },
            search_amount: { $toString: "$amount" },
            search_paybleamount: { $toString: "$paybleamount" },
            search_type: { $toString: "$type" },
          },
        },
        {
          $match: {
            $or: [
              {
                search_usermobile: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
              {
                search_amount: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
              {
                search_paybleamount: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
              {
                search_type: { $regex: new RegExp(searchTerms), $options: "i" },
              },
            ],
          },
        },
        {
          $project: {
            search_usermobile: 0,
            search_amount: 0,
            search_paybleamount: 0,
            search_type: 0,
          },
        }
      );

      totalDocumentsCount = await withdrawal.aggregate([
        ...pipeline,
        { $count: "count" },
      ]);

      totalDocumentsCount =
        totalDocumentsCount.length > 0 ? totalDocumentsCount[0].count : 0;
    } else {
      totalDocumentsCount = await withdrawal.countDocuments({ status: 2 });
    }

    const regectRechargeData = await withdrawal.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: pageSize },
    ]);

    res.status(200).json({
      data: regectRechargeData,
      totalPages: Math.ceil(totalDocumentsCount / pageSize),
      currentPage: page,
      totalCount: totalDocumentsCount,
      message: "withdrawal Requset",
      response: 1,
      status: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      response: 0,
      status: false,
      error: error.message,
    });
  }
};

const WithdrawalAccept = async (req, res) => {
  let input = req.body;
  let page = input.page || 1;
  let pageSize = input.pageSize || 10;
  let skip = (page - 1) * pageSize;
  const searchTerms = input?.searchTerms;
  try {
    let pipeline = [
      {
        $match: {
          status: 1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userid",
          foreignField: "_id",
          as: "userpendingrechargedata",
        },
      },
      {
        $lookup: {
          from: "bankdetails",
          localField: "userid",
          foreignField: "userid",
          as: "bankdetail",
        },
      },
      {
        $addFields: {
          mobile: {
            $arrayElemAt: ["$userpendingrechargedata.mobile", 0],
          },
          name: {
            $arrayElemAt: ["$bankdetail.name", 0],
          },
          ifsc_code: {
            $arrayElemAt: ["$bankdetail.ifsc_code", 0],
          },
          bank_code: {
            $arrayElemAt: ["$bankdetail.bank_code", 0],
          },
          bank_account: {
            $arrayElemAt: ["$bankdetail.bank_account", 0],
          },
        },
      },
      {
        $project: {
          _id: 1,
          userid: 1,
          amount: 1,
          paybleamount: 1,
          payout: 1,
          type: 1,
          status: 1,
          createdate: 1,
          mobile: 1,
          name: 1,
          ifsc_code: 1,
          bank_code: 1,
          bank_account: 1,
        },
      },
      { $sort: { _id: -1 } },
    ];

    let totalDocumentsCount = 0;

    if (searchTerms) {
      pipeline.push(
        {
          $match: {
            status: 1,
          },
        },
        {
          $addFields: {
            search_usermobile: { $toString: "$mobile" },
            search_amount: { $toString: "$amount" },
            search_paybleamount: { $toString: "$paybleamount" },
          },
        },
        {
          $match: {
            $or: [
              {
                search_usermobile: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
              {
                search_amount: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
              {
                search_paybleamount: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
            ],
          },
        },
        {
          $project: {
            search_usermobile: 0,
            search_amount: 0,
            search_paybleamount: 0,
          },
        }
      );

      totalDocumentsCount = await withdrawal.aggregate([
        ...pipeline,
        { $count: "count" },
      ]);

      totalDocumentsCount =
        totalDocumentsCount.length > 0 ? totalDocumentsCount[0].count : 0;
    } else {
      totalDocumentsCount = await withdrawal.countDocuments({ status: 1 });
    }

    const regectRechargeData = await withdrawal.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: pageSize },
    ]);

    res.status(200).json({
      data: regectRechargeData,
      totalPages: Math.ceil(totalDocumentsCount / pageSize),
      currentPage: page,
      totalCount: totalDocumentsCount,
      message: "withdrawal Accept",
      response: 1,
      status: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      response: 0,
      status: false,
      error: error.message,
    });
  }
};

const WithdrawalReject = async (req, res) => {
  let input = req.body;
  let page = input.page || 1;
  let pageSize = input.pageSize || 10;
  let skip = (page - 1) * pageSize;
  const searchTerms = input?.searchTerms;
  try {
    let pipeline = [
      {
        $match: {
          status: 0,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userid",
          foreignField: "_id",
          as: "userpendingrechargedata",
        },
      },
      {
        $lookup: {
          from: "bankdetails",
          localField: "userid",
          foreignField: "userid",
          as: "bankdetail",
        },
      },
      {
        $addFields: {
          mobile: {
            $arrayElemAt: ["$userpendingrechargedata.mobile", 0],
          },
          name: {
            $arrayElemAt: ["$bankdetail.name", 0],
          },
          ifsc_code: {
            $arrayElemAt: ["$bankdetail.ifsc_code", 0],
          },
          bank_code: {
            $arrayElemAt: ["$bankdetail.bank_code", 0],
          },
          bank_account: {
            $arrayElemAt: ["$bankdetail.bank_account", 0],
          },
        },
      },
      {
        $project: {
          _id: 1,
          userid: 1,
          amount: 1,
          paybleamount: 1,
          payout: 1,
          type: 1,
          status: 1,
          createdate: 1,
          mobile: 1,
          name: 1,
          ifsc_code: 1,
          bank_code: 1,
          bank_account: 1,
        },
      },
      { $sort: { _id: -1 } },
    ];

    let totalDocumentsCount = 0;

    if (searchTerms) {
      pipeline.push(
        {
          $match: {
            status: 0,
          },
        },
        {
          $addFields: {
            search_usermobile: { $toString: "$mobile" },
            search_amount: { $toString: "$amount" },
            search_paybleamount: { $toString: "$paybleamount" },
          },
        },
        {
          $match: {
            $or: [
              {
                search_usermobile: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
              {
                search_amount: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
              {
                search_paybleamount: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
            ],
          },
        },
        {
          $project: {
            search_usermobile: 0,
            search_amount: 0,
            search_paybleamount: 0,
          },
        }
      );

      totalDocumentsCount = await withdrawal.aggregate([
        ...pipeline,
        { $count: "count" },
      ]);

      totalDocumentsCount =
        totalDocumentsCount.length > 0 ? totalDocumentsCount[0].count : 0;
    } else {
      totalDocumentsCount = await withdrawal.countDocuments({ status: 0 });
    }

    const regectRechargeData = await withdrawal.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: pageSize },
    ]);

    res.status(200).json({
      data: regectRechargeData,
      totalPages: Math.ceil(totalDocumentsCount / pageSize),
      currentPage: page,
      totalCount: totalDocumentsCount,
      message: "withdrawal Reject",
      response: 1,
      status: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      response: 0,
      status: false,
      error: error.message,
    });
  }
};

const RechargeAccept = async (req, res) => {
  let input = req.body;
  let page = input.page || 1;
  let pageSize = input.pageSize || 10;
  let skip = (page - 1) * pageSize;
  const searchTerms = input?.searchTerms;
  try {
    let pipeline = [
      {
        $match: {
          actiontype: "recharge",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userid",
          foreignField: "_id",
          as: "userpendingrechargedata",
        },
      },
      {
        $addFields: {
          usermobilenumber: {
            $arrayElemAt: ["$userpendingrechargedata.mobile", 0],
          },
        },
      },
      {
        $project: {
          _id: 1,
          userid: 1,
          orderid: 1,
          amount: 1,
          wallet: 1,
          type: 1,
          actiontype: 1,
          rechargetype: 1,
          createdate: 1,
          usermobilenumber: 1,
          usdtAmount:1,
        },
      },
      { $sort: { _id: -1 } },
    ];

    let totalDocumentsCount = 0;

    if (searchTerms) {
      pipeline.push(
        {
          $match: {
            actiontype: "recharge",
          },
        },
        {
          $addFields: {
            search_usermobile: { $toString: "$usermobilenumber" },
            search_orderid: { $toString: "$orderid" },
            search_amount: { $toString: "$amount" },
            search_wallet: { $toString: "$wallet" },
          },
        },
        {
          $match: {
            $or: [
              {
                search_usermobile: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
              {
                search_orderid: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
              {
                search_wallet: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
              {
                search_amount: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
            ],
          },
        },
        {
          $project: {
            search_usermobile: 0,
            search_orderid: 0,
            search_wallet: 0,
            search_amount: 0,
          },
        }
      );

      totalDocumentsCount = await Walletsummery.aggregate([
        ...pipeline,
        { $count: "count" },
      ]);

      totalDocumentsCount =
        totalDocumentsCount.length > 0 ? totalDocumentsCount[0].count : 0;
    } else {
      totalDocumentsCount = await Walletsummery.countDocuments({
        actiontype: "recharge",
      });
    }

    const regectRechargeData = await Walletsummery.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: pageSize },
    ]);

    res.status(200).json({
      data: regectRechargeData,
      totalPages: Math.ceil(totalDocumentsCount / pageSize),
      totalCount: totalDocumentsCount,
      currentPage: page,
      message: "Recharge Accept",
      response: 1,
      status: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      response: 0,
      status: false,
      error: error.message,
    });
  }
};

const RechargeReject = async (req, res) => {
  let input = req.body;
  let page = input.page || 1;
  let pageSize = input.pageSize || 10;
  let skip = (page - 1) * pageSize;
  const searchTerms = input?.searchTerms;
  try {
    let pipeline = [
      {
        $match: {
          actiontype: "recharge-reject",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userid",
          foreignField: "_id",
          as: "userpendingrechargedata",
        },
      },
      {
        $addFields: {
          usermobilenumber: {
            $arrayElemAt: ["$userpendingrechargedata.mobile", 0],
          },
        },
      },
      {
        $project: {
          _id: 1,
          userid: 1,
          orderid: 1,
          amount: 1,
          wallet: 1,
          type: 1,
          actiontype: 1,
          rechargetype: 1,
          createdate: 1,
          usermobilenumber: 1,
          usdtAmount:1,
        },
      },
      { $sort: { _id: -1 } },
    ];

    let totalDocumentsCount = 0;

    if (searchTerms) {
      pipeline.push(
        {
          $match: {
            actiontype: "recharge-reject",
          },
        },
        {
          $addFields: {
            search_usermobile: { $toString: "$usermobilenumber" },
            search_orderid: { $toString: "$orderid" },
            search_amount: { $toString: "$amount" },
            search_wallet: { $toString: "$wallet" },
          },
        },
        {
          $match: {
            $or: [
              {
                search_usermobile: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
              {
                search_orderid: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
              {
                search_wallet: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
              {
                search_amount: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
            ],
          },
        },
        {
          $project: {
            search_usermobile: 0,
            search_orderid: 0,
            search_wallet: 0,
            search_amount: 0,
          },
        }
      );

      totalDocumentsCount = await Walletsummery.aggregate([
        ...pipeline,
        { $count: "count" },
      ]);

      totalDocumentsCount =
        totalDocumentsCount.length > 0 ? totalDocumentsCount[0].count : 0;
    } else {
      totalDocumentsCount = await Walletsummery.countDocuments({
        actiontype: "recharge-reject",
      });
    }

    const regectRechargeData = await Walletsummery.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: pageSize },
    ]);

    res.status(200).json({
      data: regectRechargeData,
      totalPages: Math.ceil(totalDocumentsCount / pageSize),
      currentPage: page,
      totalCount: totalDocumentsCount,
      message: "Recharge reject",
      response: 1,
      status: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      response: 0,
      status: false,
      error: error.message,
    });
  }
};

const RechargePending = async (req, res) => {
  let input = req.body;
  let page = input.page || 1;
  let pageSize = input.pageSize || 10;
  let skip = (page - 1) * pageSize;
  const searchTerms = input?.searchTerms;
  try {
    let pipeline = [
      {
        $match: {
          actiontype: "recharge-pending",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userid",
          foreignField: "_id",
          as: "userpendingrechargedata",
        },
      },
      {
        $addFields: {
          usermobilenumber: {
            $arrayElemAt: ["$userpendingrechargedata.mobile", 0],
          },
        },
      },
      {
        $project: {
          _id: 1,
          userid: 1,
          orderid: 1,
          amount: 1,
          wallet: 1,
          type: 1,
          actiontype: 1,
          rechargetype: 1,
          createdate: 1,
          usermobilenumber: 1,
          usdtAmount:1,
        },
      },
      { $sort: { _id: -1 } },
    ];

    let totalDocumentsCount = 0;

    if (searchTerms) {
      pipeline.push(
        {
          $match: {
            actiontype: "recharge-pending",
          },
        },
        {
          $addFields: {
            search_usermobile: { $toString: "$usermobilenumber" },
            search_orderid: { $toString: "$orderid" },
            search_amount: { $toString: "$amount" },
            search_wallet: { $toString: "$wallet" },
          },
        },
        {
          $match: {
            $or: [
              {
                search_usermobile: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
              {
                search_orderid: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
              {
                search_wallet: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
              {
                search_amount: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
            ],
          },
        },
        {
          $project: {
            search_usermobile: 0,
            search_orderid: 0,
            search_wallet: 0,
            search_amount: 0,
          },
        }
      );

      totalDocumentsCount = await Walletsummery.aggregate([
        ...pipeline,
        { $count: "count" },
      ]);

      totalDocumentsCount =
        totalDocumentsCount.length > 0 ? totalDocumentsCount[0].count : 0;
    } else {
      totalDocumentsCount = await Walletsummery.countDocuments({
        actiontype: "recharge-pending",
      });
    }

    const regectRechargeData = await Walletsummery.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: pageSize },
    ]);

    res.status(200).json({
      data: regectRechargeData,
      totalPages: Math.ceil(totalDocumentsCount / pageSize),
      currentPage: page,
      totalCount: totalDocumentsCount,
      message: "Recharge Pending",
      response: 1,
      status: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      response: 0,
      status: false,
      error: error.message,
    });
  }
};

const AdminAcceptRecharge = async function (req, res) {
  const input = req.body;
  const page = input.page || 1;
  const pagerow = input.pagerow || 10;
  const skip = (page - 1) * pagerow;
  try {
    const data = await Walletsummery.find({ actiontype: "recharge-pending" })
      .skip(skip)
      .select("_id")
      .limit(1);
    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    const WalletsummeryData = await Walletsummery.findById(input._id);

    const walletData = await Wallet.findOne({
      userid: WalletsummeryData.userid,
    });

    await Wallet.findOneAndUpdate(
      { userid: WalletsummeryData.userid },
      { $inc: { amount: WalletsummeryData.amount } },
      { new: true }
    );

    const getPaymentSiteSettingData = await paymentsetting.find();
    const firstUser = await Users.findById(WalletsummeryData.userid);

    const getUserDetails = await Users.findById(WalletsummeryData.userid);

    if (!getUserDetails) {
      return res.status(404).json({ message: "User not found" });
    }

    let userCompleteRechargeDetails = getUserDetails.code;
    if (firstUser.owncode !== "NT1DGPUK") {
      if (userCompleteRechargeDetails) {
        const matchCodeInOtherUser = await Users.findOne({
          owncode: userCompleteRechargeDetails,
        });
        if (matchCodeInOtherUser) {
          const levelUpUserId = matchCodeInOtherUser._id;
          const matchOwncodeUserIdInWallets = await Wallet.findOne({
            userid: levelUpUserId,
          });
          if (matchOwncodeUserIdInWallets) {
            const existingRecharge = await Walletsummery.findOne({
              userid: WalletsummeryData.userid,
              actiontype: "recharge",
            });

            if (!existingRecharge) {
              const bonusMapping = [
                { recharge: 50000, bonus: 5600 },
                { recharge: 40000, bonus: 4200 },
                { recharge: 30000, bonus: 3200 },
                { recharge: 20000, bonus: 2200 },
                { recharge: 10000, bonus: 1200 },
                { recharge: 9000, bonus: 1090 },
                { recharge: 8000, bonus: 980 },
                { recharge: 7000, bonus: 870 },
                { recharge: 6000, bonus: 760 },
                { recharge: 5000, bonus: 650 },
                { recharge: 4000, bonus: 540 },
                { recharge: 3000, bonus: 430 },
                { recharge: 2000, bonus: 320 },
                { recharge: 1000, bonus: 210 },
                { recharge: 500, bonus: 165 }
              ];
              let updatedWalletAmount = 0;
              for (const entry of bonusMapping) {
                if (WalletsummeryData.amount >= entry.recharge) {
                  updatedWalletAmount = entry.bonus;
                  break;
                }
              }
              let rechargeAmounts = Number(matchOwncodeUserIdInWallets.amount || 0);
              let totalUpdatedWalletAmounts = updatedWalletAmount + rechargeAmounts;
              totalUpdatedWalletAmounts = isNaN(totalUpdatedWalletAmounts) ? 0 : totalUpdatedWalletAmounts;

              let updatedWallet = await Wallet.findOneAndUpdate(
                { userid: levelUpUserId },
                { amount: totalUpdatedWalletAmounts },
                { new: true }
              );

              await Walletsummery.create({
                userid: levelUpUserId,
                amount: updatedWalletAmount,
                sender_id: WalletsummeryData.userid || '-',
                type: "credit",
                wallet: updatedWallet.amount || 0,
                actiontype: "recharge-bonus",
              });
              // let updatedWalletAmount =
              //   (WalletsummeryData.amount * getPaymentSiteSettingData[0]?.rechargebonus1) /
              //   100;
              // updatedWalletAmount = isNaN(updatedWalletAmount) ? 0 : updatedWalletAmount;

              // let rechargeAmounts = Number(matchOwncodeUserIdInWallets.amount || 0);

              // let totleUpdatedWalletAmounts = updatedWalletAmount + rechargeAmounts;



              // totleUpdatedWalletAmounts = isNaN(totleUpdatedWalletAmounts)
              //   ? 0
              //   : totleUpdatedWalletAmounts;

              // let updatedWallet = await Wallet.findOneAndUpdate(
              //   { userid: levelUpUserId },
              //   { amount: totleUpdatedWalletAmounts },
              //   { new: true }
              // );
              // await Walletsummery.create({
              //   userid: levelUpUserId,
              //   amount: updatedWalletAmount,
              //   sender_id: WalletsummeryData.userid || '-',
              //   type: "credit",
              //   wallet: updatedWallet.amount || 0,
              //   actiontype: "recharge-bonus",
              // });

            }

          }
        }
      }
    }
    await Walletsummery.findByIdAndUpdate(input._id, {
      $set: { actiontype: "recharge" },
    });
    const total = await Walletsummery.countDocuments({
      actiontype: "recharge-pending",
    });

    return res.status(200).json({
      total: total,
      message: "Success",
      response: 1,
    });
  } catch (error) {
    console.log("Error admin fetching data", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const AdminRejectRecharge = async function (req, res) {
  const input = req.body;
  const page = input.page || 1;
  const pagerow = input.pagerow || 10;
  const skip = (page - 1) * pagerow;
  try {
    const data = await Walletsummery.find({ actiontype: "recharge-pending" })
      .skip(skip)
      .select("_id")
      .limit(1);
    if (data.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    await Walletsummery.findByIdAndUpdate(input._id, {
      $set: { actiontype: "recharge-reject" },
    });

    const total = await Walletsummery.countDocuments({
      actiontype: "recharge-pending",
    });

    return res.status(200).json({
      total: total,
      message: "Success",
      response: 1,
    });
  } catch (error) {
    console.log("Error admin fetching data", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const AdminAcceptWithdrawal = async function (req, res) {
  const input = req.body;
  const page = input.page || 1;
  const pagerow = input.pagerow || 10;
  const skip = (page - 1) * pagerow;
  try {
    const data = await withdrawal
      .find({ status: { $in: [2, 3] } })
      .skip(skip)
      .select("_id")
      .limit(1);
    // const ids = data.map(item);
    if (data.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    await withdrawal.findByIdAndUpdate(input._id, {
      $set: { status: 1 },
    });

    const total = await Walletsummery.countDocuments({
      status: 2,
    });

    return res.status(200).json({
      total: total,
      message: "Success",
      response: 1,
    });
  } catch (error) {
    console.log("Error admin fetching data", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const AdminRejectWithdrawal = async function (req, res) {
  const input = req.body;
  const page = input.page || 1;
  const pagerow = input.pagerow || 10;
  const skip = (page - 1) * pagerow;
  try {
    const data = await withdrawal
      .find({ status: { $in: [2, 3] } })
      .skip(skip)
      .select("_id")
      .limit(1);

    if (data.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    const WalletData = await withdrawal.findByIdAndUpdate(input._id, {
      $set: { status: 0 },
    });

    const total = await Walletsummery.countDocuments({
      status: 2,
    });

    let wallet;
    if (WalletData.type === "wallet") {
      wallet = await Wallet.findOne({ userid: WalletData.userid });
      wallet.amount += parseInt(WalletData.amount);
    } else {
      wallet = await Wallet.findOne({ userid: WalletData.userid });
      wallet.win_amount += parseInt(WalletData.amount);
    }

    await wallet.save();

    return res.status(200).json({
      total: total,
      message: "Success",
      response: 1,
    });
  } catch (error) {
    console.log("Error admin fetching data", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const adminAgreeWithdrawal = async (req, res) => {
  try {
    const { id } = req.body;
    const wallet = await withdrawal.findById(id);
    if (wallet) {
      wallet.status = 3;
      wallet.save();
    }
    return res.status(200).json({
      data: wallet,
      message: "Success",
      response: 1,
    });
  } catch (error) {
    console.log("Error admin fetching data", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const setresulgame = async function (req, res) {
  try {
    const game = await Gameid.find();
    let lastGameId;
    const game_id = game.map((item) => item.gameid);
    if (game_id.length > 0) {
      lastGameId = game_id[game_id.length - 1];
    }
    const betting = await Betting.find({
      periodid: lastGameId,
    });
    // const userIdsSet = new Set();

    // betting.forEach((item) => userIdsSet.add(item.userid.toString()));
    // const userIds = Array.from(userIdsSet);

    const numbermappings = [
      "zero",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
    ];
    const periodid = parseInt(req.body.periodid);
    const tab = req.body.tab;
    const actiontype = req.body.actiontype;

    if (actiontype === "getdata") {
      const Manualdata = await Manualresult.find();
      let datas = [];
      let i = 0;

      for (const row of Manualdata) {
        let temparray;
        let totalusernumber;
        let total;
        let greentotal;
        let redtotal;
        let vtotal;
        let totaluserArray;

        if (
          row.number == 1 ||
          row.number == 3 ||
          row.number == 7 ||
          row.number == 9
        ) {
          temparray = ["Green", row.number];
          totalusernumber = await helper.getusercount(periodid, tab, temparray);
          totaluserArray = await helper.getuserArray(periodid, tab, temparray);
          greentotal = await helper.winner(periodid, tab, "greenwinamount");
          total =
            greentotal +
            (await helper.winner(
              periodid,
              tab,
              numbermappings[row.number] + "winamount"
            ));
        } else if (
          row.number == 2 ||
          row.number == 4 ||
          row.number == 6 ||
          row.number == 8
        ) {
          temparray = ["Red", row.number];
          totalusernumber = await helper.getusercount(periodid, tab, temparray);
          totaluserArray = await helper.getuserArray(periodid, tab, temparray);
          redtotal = await helper.winner(periodid, tab, "redwinamount");
          total =
            redtotal +
            (await helper.winner(
              periodid,
              tab,
              numbermappings[row.number] + "winamount"
            ));
        } else if (row.number == 0) {
          temparray = ["Red", "Violet", row.number];
          totalusernumber = await helper.getusercount(periodid, tab, temparray);
          totaluserArray = await helper.getuserArray(periodid, tab, temparray);
          redtotal = await helper.winner(
            periodid,
            tab,
            "redwinamountwithviolet"
          );
          vtotal = await helper.winner(periodid, tab, "violetwinamount");
          total =
            redtotal +
            vtotal +
            (await helper.winner(
              periodid,
              tab,
              numbermappings[row.number] + "winamount"
            ));
        } else if (row.number == 5) {
          temparray = ["Green", "Violet", row.number];
          totalusernumber = await helper.getusercount(periodid, tab, temparray);
          totaluserArray = await helper.getuserArray(periodid, tab, temparray);
          redtotal = await helper.winner(
            periodid,
            tab,
            "greenwinamountwithviolet"
          );
          vtotal = await helper.winner(periodid, tab, "violetwinamount");
          total =
            redtotal +
            vtotal +
            (await helper.winner(
              periodid,
              tab,
              numbermappings[row.number] + "winamount"
            ));
        }
        datas.push({
          id: i,
          color: row.color,
          number: row.number,
          uniqueUserIds: totaluserArray,
          totalusernumber: totalusernumber,
          total: total,
          status: row.status,
        });
        i++;
      }

      return res.status(200).json({
        message: "Success",
        response: 1,
        data: datas,
      });
    }
  } catch (error) {
    console.log("Error admin fetching data", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const siteSetting = async function (req, res) {
  const input = req.body;

  try {
    const files = req.files;

    const paymet = await paymetsetting.create({
      UPI_ID: input.UPI_ID,
      CRYPTO_ID: input.CRYPTO_ID,
      commission_rate: input.commission_rate,
      rechargeamount: input.rechargeamount,
      withdrawalamount: input.withdrawalamount,
      bonusamount: input.bonusamount,
      batbonus: input.batbonus,
      rechargebonus1: input.rechargebonus1,
      interest_rate: input.interest_rate,
      sitename: input.sitename,
      signupbonusamount: input.signupbonusamount,
      favicon: files.favicon[0].filename,
      logo: files.logo[0].filename,
      apk: files.apk[0].filename,
      withdrawal_status: input.withdrawal_status,
    });

    res.status(200).json({
      message: "success",
      response: 1,
      success: true,
      paymet: paymet,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      response: 0,
      success: false,
      error: error.message,
    });
    console.log(error);
  }
};

const notification = async function (req, res) {
  const input = req.body;
  if (!input.heading || !input.content) {
    return res.status(400).json({
      message: "Please provide heading and content",
      response: 0,
      success: false,
    });
  }
  try {
    const Notification = await notificationdata.create({
      heading: input.heading,
      content: input.content,
    });
    res.status(200).json({
      message: "success",
      Notification: Notification,
      response: 1,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      response: 0,
      success: false,
      error: error.message,
    });
    console.log(error);
  }
};

const addbanner = async function (req, res) {
  const input = req.body;
  const file = req.files;
  try {
    const AddBanner = await banner.create({
      banner_title: input.banner_title,
      material: file.material[0].filename,
      status: 1,
    });
    res.status(200).json({
      AddBanner: AddBanner,
      message: "success",
      response: 1,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      response: 0,
      success: false,
      error: error.message,
    });
    console.log(error);
  }
};

const updatebanner = async function (req, res) {
  const input = req.body;
  const file = req.files;

  try {
    const existingBanner = await banner.findById(input._id);
    if (!existingBanner) {
      return res.status(404).json({
        message: "Banner not found",
        response: 0,
        success: false,
      });
    }
    let updateFields = {
      banner_title: input.banner_title,
      status: 1,
    };

    if (file && file.material) {
      updateFields.material = file.material[0].filename;
      if (existingBanner.material) {
        const materialPath = path.join(
          "E:",
          "Node-game",
          "node-game-demo",
          "public",
          "images",
          existingBanner.material
        );
        if (fs.existsSync(materialPath)) {
          fs.unlinkSync(materialPath);
        } else {
          console.log("File does not exist.");
        }
      }
    }

    const updatedBanner = await banner.findByIdAndUpdate(
      input._id,
      updateFields,
      { new: true }
    );

    if (!updatedBanner) {
      return res.status(404).json({
        message: "Banner not found",
        response: 0,
        success: false,
      });
    }

    res.status(200).json({
      updatedBanner: updatedBanner,
      message: "Success",
      response: 1,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
      response: 0,
      success: false,
    });
  }
};

const deleteBanner = async function (req, res) {
  const input = req.body;
  try {
    const Banner = await banner.find().select("_id").limit(1);
    if (Banner.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }
    await banner.deleteOne({ _id: input._id });

    res.status(200).json({
      message: "Banner deleted successfully",
      response: 1,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      response: 0,
      success: false,
      error: error.message,
    });
  }
};

const AdminActiveUnActiveUser = async (req, res) => {
  const input = await req.body;

  try {
    let actives = await Users.findById(input._id);

    let data = await Users.findByIdAndUpdate(input._id, {
      $set: {
        status: !actives.status,
      },
    });

    await res.status(200).json({
      message: "Success",
      data: data,
      status: 1,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      response: 0,
      success: false,
      error: error.message,
    });
  }
};

const adminPlay = async (req, res) => {
  let input = await req.body;
  try {
    let plays = await Users.findById(input._id);

    let data = await Users.findByIdAndUpdate(input._id, {
      $set: {
        play: !plays.play,
      },
    });

    await res.status(200).json({
      data: data,
      message: "Success",
      status: true,
      response: 1,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internel server error",
      response: 0,
      status: false,
      error: error.message,
    });
  }
};

const adminUpdateWallet = async function (req, res) {
  try {
    const input = req.body;

    if (!input || !input.userid) {
      return res.status(400).json({
        message: "Userid is required",
        response: 0,
        success: false,
      });
    }

    let updateWalletsData = await Wallet.findOne({ userid: input.userid });

    if (!updateWalletsData) {
      res.status(500).json({
        message: "Userid is required",
        response: 0,
        success: false,
      });
    }

    let updatedWallet = await Wallet.findByIdAndUpdate(
      updateWalletsData._id,
      {
        amount: input.amount.toFixed(2),
      },
      { new: true }
    );

    res.status(200).json({
      updatedWallet: updatedWallet,
      message: "Success",
      response: 1,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
      response: 0,
      success: false,
    });
  }
};

const addproduct = async function (req, res) {
  const input = req.body;
  const file = req.files;
  try {
    const addproduct = await Products.create({
      name: input.name,
      price: input.price,
      image: file.image[0].filename,
      status: 1,
    });
    res.status(200).json({
      addproduct: addproduct,
      response: 1,
      message: "success",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      response: 0,
      success: false,
      error: error.message,
    });
    console.log(error);
  }
};

const updateproduct = async function (req, res) {
  const input = req.body;
  const file = req.files;
  try {
    const existingProduct = await Products.findById(input._id);
    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
        response: 0,
        success: false,
      });
    }

    let updateFields = {
      name: input.name,
      price: input.price,
      status: 1,
    };

    if (file && file.image) {
      updateFields.image = file.image[0].filename;
      if (existingProduct.image) {
        const imagePath = path.join(
          "E:",
          "Node-game",
          "node-game-demo",
          "public",
          "images",
          existingProduct.image
        );

        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        } else {
          console.log("File does not exist.");
        }
      }
    }

    const updatedProduct = await Products.findByIdAndUpdate(
      input._id,
      updateFields,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        message: "Product not found",
        response: 0,
        success: false,
      });
    }

    res.status(200).json({
      updatedProduct: updatedProduct,
      message: "Success",
      response: 1,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
      response: 0,
      success: false,
    });
  }
};

const deleteProduct = async function (req, res) {
  const input = req.body;
  try {
    const product = await Products.find().select("_id").limit(1);
    if (product.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }
    await Products.deleteOne({ _id: input._id });

    res.status(200).json({
      message: "Product deleted successfully",
      response: 1,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      response: 0,
      success: false,
      error: error.message,
    });
  }
};

const getleveluser = async function (req, res) {
  const input = req.body;
  const page = input.page || 1;
  const pagerow = input.pagerow || 10;
  const skip = (page - 1) * pagerow;
  let searchTerms = input.searchTerms || {};
  const conditions = {};
  for (let key in searchTerms) {
    if (!isNaN(searchTerms[key])) {
      conditions[key] = parseInt(searchTerms[key]);
    } else {
      conditions[key] = { $regex: searchTerms[key], $options: "i" };
    }
  }
  try {
    const leveluser = await Lavelusers.find(conditions)
      .skip(skip)
      .limit(pagerow);
    const data = leveluser.map((item) => ({
      _id: item._id,
      lavel_id: item.lavel_id,
      percentage: item.percentage,
      amount: item.amount,
      status: item.status,
    }));
    const totalDocumentsCount = await Lavelusers.countDocuments(conditions);
    res.status(200).json({
      data: data,
      totalDocumentsCount: totalDocumentsCount,
      totalPages: Math.ceil(totalDocumentsCount / pagerow),
      currentPage: page,
      message: "success",
      response: 1,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", response: 0 });
  }
};

const addleveluser = async function (req, res) {
  const input = req.body;
  try {
    const leveluser = await Lavelusers.create({
      lavel_id: input.lavel_id,
      percentage: input.percentage,
      amount: input.amount,
      status: true,
    });
    res.status(200).json({
      leveluser: leveluser,
      response: 1,
      message: "success",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      response: 0,
      success: false,
      error: error.message,
    });
    console.log(error);
  }
};

const updateleveluser = async function (req, res) {
  const input = req.body;
  try {
    const existingData = await Lavelusers.findById(input._id);

    if (!existingData) {
      return res.status(404).json({
        message: "Data not found",
        response: 0,
        success: false,
      });
    }

    existingData.lavel_id = input.lavel_id;
    existingData.percentage = input.percentage;
    existingData.amount = input.amount;
    existingData.status = 1;

    const updatedData = await existingData.save();

    res.status(200).json({
      updatedData: updatedData,
      response: 1,
      message: "Success",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
      response: 0,
      success: false,
    });
  }
};

const deleteleveluser = async function (req, res) {
  try {
    const lastRecord = await Lavelusers.findOne().sort({ _id: -1 });
    if (!lastRecord) {
      return res.status(404).json({
        message: "No records found",
        response: 0,
        success: false,
      });
    }
    await Lavelusers.deleteOne({ _id: lastRecord._id });
    res.status(200).json({
      deletedRecord: lastRecord,
      message: "Record deleted successfully",
      response: 1,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      response: 0,
      success: false,
    });
  }
};

const adminUpdateAllUser = async (req, res) => {
  try {
    const input = req.body;

    if (!input || !input._id) {
      return res.status(400).json({
        message: "UserID is required",
        response: 0,
        success: false,
      });
    }

    const userId = new ObjectId(input._id);

    const userData = await Users.aggregate([
      {
        $match: {
          _id: userId,
        },
      },
      {
        $lookup: {
          from: "bankdetails",
          localField: "_id",
          foreignField: "userid",
          as: "bankDetails",
        },
      },
      {
        $project: {
          _id: 1,
          email: 1,
          mobile: 1,
          password: 1,
          country_code: 1,
          code: 1,
          owncode: 1,
          status: 1,
          tokens: 1,
          created_at: 1,
          play: 1,
          __v: 1,
          active: 1,
          bankDetails: { $arrayElemAt: ["$bankDetails", 0] },
        },
      },
    ]);

    if (!userData || userData.length === 0) {
      return res.status(404).json({
        message: "User not found",
        response: 0,
        success: false,
      });
    }

    const user = userData[0];

    const updateUser = await Users.findByIdAndUpdate(
      user._id,
      {
        mobile: input.mobile,
        email: input.email,
        password: input.password,
        status: input.status,
      },
      { new: true }
    );

    let updateUserbankdetails;
    if (user.bankDetails) {
      updateUserbankdetails = await BankDetail.findByIdAndUpdate(
        user.bankDetails._id,
        {
          name: input.name,
          ifsc_code: input.ifsc_code,
          bank_code: input.bank_code,
          bank_account: input.bank_account,
          upi: input.upi,
          type: input.type,
        },
        { new: true }
      );
    }

    const updatedData = {
      updateUser,
      bankDetails: updateUserbankdetails,
    };

    res.status(200).json({
      updatedData,
      message: "User and bank details updated successfully",
      response: 1,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      response: 0,
      success: false,
    });
  }
};

const period_bateing_history = async function (req, res) {
  const input = req.body;
  const page = input.page || 1;
  const pagerow = input.pagerow || 10;
  const skip = (page - 1) * pagerow;
  const searchTerms = input?.searchTerms;
  try {
    const gameid = req.body.gameid;
    let conditions = [];
    const query = conditions.length > 0 ? { $or: conditions } : {};
    let pipeline = [];
    pipeline.push(
      { $match: { periodid: gameid } },
      {
        $lookup: {
          from: "users",
          localField: "userid",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "userresults",
          let: {
            bet_userid: "$userid",
            bet_periodid: "$periodid",
            bet_amount: "$amount",
            bet_type: "$type",
            bet_value: "$value",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$userid", "$$bet_userid"] },
                    { $eq: ["$periodid", "$$bet_periodid"] },
                    { $eq: ["$amount", "$$bet_amount"] },
                    { $eq: ["$type", "$$bet_type"] },
                    { $eq: ["$value", "$$bet_value"] },
                  ],
                },
              },
            },
          ],
          as: "user_result",
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user.mobile", 0] },
          value: { $arrayElemAt: ["$user_result.value", 0] },
          amount: { $arrayElemAt: ["$user_result.amount", 0] },
          type: { $arrayElemAt: ["$user_result.type", 0] },
          tab: { $arrayElemAt: ["$user_result.tab", 0] },
          paidamount: { $arrayElemAt: ["$user_result.paidamount", 0] },
          fee: { $arrayElemAt: ["$user_result.fee", 0] },
          status: { $arrayElemAt: ["$user_result.status", 0] },
          created_at: { $arrayElemAt: ["$user_result.created_at", 0] },
          userid: { $arrayElemAt: ["$user_result.userid", 0] },
        },
      },
      {
        $project: {
          user: 1,
          value: 1,
          amount: 1,
          type: 1,
          tab: 1,
          paidamount: 1,
          fee: 1,
          status: 1,
          created_at: 1,
          userid: 1,
        },
      }
    );
    let countQuery = null;
    if (searchTerms) {
      pipeline.push(
        { $match: { periodid: gameid } },
        {
          $addFields: {
            search_user: { $toString: "$user" },
            search_amount: { $toString: "$amount" },
            search_value: { $toString: "$value" },
            search_tab: { $toString: "$tab" },
            search_status: { $toString: "$status" },
            search_paidamount: { $toString: "$paidamount" },
          },
        },
        {
          $match: {
            $or: [
              {
                search_user: { $regex: new RegExp(searchTerms), $options: "i" },
              },
              {
                search_amount: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
              {
                search_value: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
              {
                search_tab: { $regex: new RegExp(searchTerms), $options: "i" },
              },
              {
                search_status: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
              {
                search_paidamount: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
            ],
          },
        },
        {
          $project: {
            search_user: 0,
            search_amount: 0,
            search_value: 0,
            search_tab: 0,
            search_status: 0,
            search_paidamount: 0,
          },
        }
      );
      countQuery = [...pipeline];
    }
    pipeline.push({ $skip: skip }, { $limit: pagerow });
    const result = await Betting.aggregate(pipeline);
    let totalDocumentsCount = 0;
    if (countQuery) {
      countQuery.push({
        $count: "count",
      });
      let countData = await Betting.aggregate(countQuery);
      if (countData?.length) {
        totalDocumentsCount = countData[0]?.count;
      }
    } else {
      totalDocumentsCount = await Betting.countDocuments({ periodid: gameid });
    }
    res.status(200).json({
      data: result,
      gameid: gameid,
      totalDocumentsCount: totalDocumentsCount,
      totalPages: Math.ceil(totalDocumentsCount / pagerow),
      currentPage: page,
      message: "success",
      response: 1,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const AdminGetAllUserUserReferidLavel = async (req, res) => {
  try {
    const { owncode, endLevel } = req.body;

    const allUserUserReferidLavel = async (userCodes, level, endLevel) => {
      if (level === endLevel) {
        const aggregateData = await Users.aggregate([
          {
            $match: {
              code: { $in: userCodes },
            },
          },
          {
            $lookup: {
              from: "wallets",
              localField: "_id",
              foreignField: "userid",
              pipeline: [
                { $group: { _id: null, totalWallet: { $sum: "$amount" } } },
                { $project: { _id: 0 } },
              ],
              as: "usertotalwallet",
            },
          },
          {
            $lookup: {
              from: "wallet_summeries",
              localField: "_id",
              foreignField: "userid",
              pipeline: [
                {
                  $match: {
                    actiontype: "recharge",
                  },
                },
                { $group: { _id: null, rechargeAmount: { $sum: "$amount" } } },
                { $project: { _id: 0 } },
              ],
              as: "usertotlerechargeamount",
            },
          },
          {
            $lookup: {
              from: "withdrawals",
              localField: "_id",
              foreignField: "userid",
              pipeline: [
                {
                  $group: { _id: null, userWithdarawals: { $sum: "$amount" } },
                },
                { $project: { _id: 0 } },
              ],
              as: "usertotlewithdrawals",
            },
          },
          {
            $lookup: {
              from: "wallet_summeries",
              localField: "_id",
              foreignField: "userid",
              pipeline: [
                {
                  $match: {
                    actiontype: "recharge",
                  },
                },
                { $unwind: "$actiontype" },
                { $group: { _id: null, amount: { $first: "$amount" } } },
                { $project: { _id: 0 } },
              ],
              as: "userfirstrechargeamount",
            },
          },
          {
            $project: {
              _id: 1,
              code: 1,
              owncode: 1,
              mobile: 1,
              created_at: 1,
              userTotalWallet: {
                $ifNull: [
                  { $arrayElemAt: ["$usertotalwallet", 0] },
                  { totalWallet: 0 },
                ],
              },
              userFirstRechargeAmount: {
                $ifNull: [
                  { $arrayElemAt: ["$userfirstrechargeamount", 0] },
                  { amount: 0 },
                ],
              },
              userTotleRechargeAmount: {
                $ifNull: [
                  { $arrayElemAt: ["$usertotlerechargeamount", 0] },
                  { rechargeAmount: 0 },
                ],
              },
              userTotleWithdrawals: {
                $ifNull: [
                  { $arrayElemAt: ["$usertotlewithdrawals", 0] },
                  { totleWithdrawals: 0 },
                ],
              },
            },
          },
        ]);
        return aggregateData;
      }

      let storeLevelData = [];

      const data = await Users.find({ code: { $in: userCodes } });

      if (data.length > 0) {
        for (const user of data) {
          const childData = await allUserUserReferidLavel(
            [user.owncode],
            level + 1,
            endLevel
          );

          storeLevelData.push(...childData);
        }

        return storeLevelData;
      } else {
        return [];
      }
    };

    const endLevelData = await allUserUserReferidLavel([owncode], 1, endLevel);

    res.status(200).json({
      data: endLevelData,
      message: "User data retrieved successfully",
      status: true,
      response: 1,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Internal server error",
      status: false,
      response: 0,
      error: error.message,
    });
  }
};

const getcomplaint = async function (req, res) {
  try {
    const input = req.body;
    const page = input.page;
    const pageSize = input.pageSize;
    const skip = (page - 1) * pageSize;

    const data = await complaint.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userid",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $match: {
          complaint_status: "Under Review",
        },
      },
      {
        $project: {
          _id: 1,
          complait_for: 1,
          complait_subject: 1,
          complaint_status: 1,
          complait_id: 1,
          complait_text: 1,
          complait_reply: 1,
          complait_reply_time: 1,
          complaint_time: 1,
          mobile: { $arrayElemAt: ["$user.mobile", 0] },
        },
      },
      { $skip: skip },
      { $limit: pageSize },
    ]);
    totalDocumentsCount = await complaint.countDocuments();
    res.status(200).json({
      data: data,
      totalDocumentsCount: totalDocumentsCount,
      totalPages: Math.ceil(totalDocumentsCount / pageSize),
      currentPage: page,
      response: 1,
      message: "success",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const updateComplaint = async function (req, res) {
  try {
    const _id = req.body._id;
    const input = req.body;

    // Check if the complaint exists
    const existingComplaint = await complaint.findOne({ _id });
    if (!existingComplaint) {
      return res.status(404).json({
        message: "Complaint not found",
        response: 0,
        success: false,
      });
    }

    // Update the complaint
    const updatedComplaint = await complaint.findOneAndUpdate(
      { _id },
      {
        $set: {
          complaint_status: input.complaint_status,
          complait_reply: input.complait_reply,
        },
      },
      { new: true }
    );

    res.status(200).json({
      updatedComplaint: updatedComplaint,
      response: 1,
      message: "Complaint updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error while updating complaint:", error);
    res.status(500).json({
      message: "Internal Server Error",
      response: -1,
      success: false,
    });
  }
};
const user_game_history = async function (req, res) {
  try {
    const input = req.body;
    const page = parseInt(input.page) || 1;
    const pageSize = parseInt(input.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    const userId = new ObjectId(input.userId);
    const searchTerms = input.searchTerms;

    const matchQuery = {
      userid: userId,
    };
    let conditions = [];
    const query = conditions.length > 0 ? { $or: conditions } : {};
    let pipeline = [];
    pipeline.push(
      { $match: matchQuery },
      { $sort: { created_at: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "userid",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $addFields: {
          mobile: { $arrayElemAt: ["$user.mobile", 0] },
        },
      },
      {
        $project: {
          _id: 1,
          userid: 1,
          periodid: 1,
          type: 1,
          value: 1,
          amount: 1,
          openprice: 1,
          tab: 1,
          paidamount: 1,
          fee: 1,
          status: 1,
          created_at: 1,
          mobile: 1,
        },
      },
      { $sort: { _id: -1 } },
    );

    let countQuery = null;
    if (searchTerms) {
      pipeline.push(
        {
          $addFields: {
            search_periodid: { $toString: "$periodid" },
          },
        },
        {
          $match: {
            $or: [
              {
                search_periodid: {
                  $regex: new RegExp(searchTerms),
                  $options: "i",
                },
              },
            ],
          },
        },
        {
          $project: {
            search_periodid: 0,
          },
        }
      );
      countQuery = [...pipeline];
    }
    pipeline.push({ $skip: skip }, { $limit: pageSize });
    const betting_history = await UserResult.aggregate(pipeline);
    let totalDocumentsCount = 0;
    if (countQuery) {
      countQuery.push({
        $count: "count",
      });
      let countData = await UserResult.aggregate(countQuery);
      if (countData?.length) {
        totalDocumentsCount = countData[0]?.count;
      }
    } else {
      totalDocumentsCount = await UserResult.countDocuments({
        ...matchQuery,
        ...query,
      });
    }
    res.status(200).json({
      betting_history: betting_history,
      totalPages: Math.ceil(totalDocumentsCount / pageSize),
      currentPage: page,
      total: totalDocumentsCount,
      response: 1,
      message: "success",
      success: true,
    });
  } catch (error) {
    console.error("Error while fetching user game history:", error);
    res.status(500).json({
      message: "Internal Server Error",
      response: -0,
      success: false,
    });
  }
};

const getSiteSettingInputDefaultData = async (req, res) => {
  try {
    const data = await paymentsetting.findOne().sort({ _id: -1 });

    if (!data) {
      res.status(400).json({
        data: data,
        response: 1,
        message: "Data not found",
        success: true,
      });
    }

    res.status(200).json({
      data: data,
      response: 1,
      message: "success",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      response: -0,
      success: false,
    });
  }
};

const GetNotification = async function (req, res) {
  try {
    const notifications = await notificationdata.find();
    const lastNotification = notifications[notifications.length - 1];

    res.status(200).json({
      notification: lastNotification,
      response: 1,
      message: "success",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      response: -0,
      success: false,
    });
  }
};
const siteSettingUpdate = async function (req, res) {
  const input = req.body;

  try {
    const files = req.files;
    const existingSetting = await paymetsetting.findOne();

    if (!existingSetting) {
      return res.status(404).json({
        message: "SiteSetting not found",
        response: 0,
        success: false,
      });
    }
    const basePath = path.join("E:", "Node-game", "node-game-demo", "public", "images");
    const apkPath = path.join("E:", "Node-game", "node-game-demo", "public");
    if (files.favicon && existingSetting.favicon && fs.existsSync(path.join(basePath, existingSetting.favicon))) {
      fs.unlinkSync(path.join(basePath, existingSetting.favicon));
    }
    if (files.apk && existingSetting.apk && fs.existsSync(path.join(apkPath, existingSetting.apk))) {
      fs.unlinkSync(path.join(apkPath, existingSetting.apk));
    }
    if (files.logo && existingSetting.logo && fs.existsSync(path.join(basePath, existingSetting.logo))) {
      fs.unlinkSync(path.join(basePath, existingSetting.logo));
    }
    if (files.qr_code && existingSetting.qr_code && fs.existsSync(path.join(basePath, existingSetting.qr_code))) {
      fs.unlinkSync(path.join(basePath, existingSetting.qr_code));
    }
    Object.assign(existingSetting, input);

    if (files.favicon) {
      const apkExtension = path.extname(files.favicon[0].filename);
      const allowedExtensions = [".jpg", ".jpeg", ".png"];
      if (!allowedExtensions.includes(apkExtension.toLowerCase())) {
        return res.status(400).json({
          message:
            "Invalid file format. Only .jpg and .png files are allowed for APK updates.",
          response: 0,
          success: false,
        });
      } else {
        existingSetting.favicon = files.favicon[0].filename;
      }
    }
    if (files.logo) {
      const apkExtension = path.extname(files.logo[0].filename);
      const allowedExtensions = [".jpg", ".jpeg", ".png"];
      if (!allowedExtensions.includes(apkExtension.toLowerCase())) {
        return res.status(400).json({
          message:
            "Invalid file format. Only .jpg and .png files are allowed for APK updates.",
          response: 0,
          success: false,
        });
      } else {
        existingSetting.logo = files.logo[0].filename;
      }
    }
    if (files.apk) {
      const apkExtension = path.extname(files.apk[0].filename);
      if (apkExtension.toLowerCase() !== ".apk") {
        return res.status(400).json({
          message:
            "Invalid file format. Only .apk files are allowed for APK updates.",
          response: 0,
          success: false,
        });
      }
      existingSetting.apk = files.apk[0].filename;
    }
    if (files.qr_code) {
      const apkExtension = path.extname(files.qr_code[0].filename);
      const allowedExtensions = [".jpg", ".jpeg", ".png"];
      if (!allowedExtensions.includes(apkExtension.toLowerCase())) {
        return res.status(400).json({
          message:
            "Invalid file format. Only .jpg and .png files are allowed updates.",
          response: 0,
          success: false,
        });
      } else {
        existingSetting.qr_code = files.qr_code[0].filename;
      }
    }
    if (files.thad_qr_code){
      const thadQrCode = path.extname(files.thad_qr_code[0].filename);
      const allowedExtensions = [".jpg", ".jpeg", ".png"];
      if (!allowedExtensions.includes(thadQrCode.toLowerCase())) {
        return res.status(400).json({
          message:
            "Invalid file format. Only .jpg and .png files are allowed updates.",
          response: 0,
          success: false,
        });
      } else {
        existingSetting.thad_qr_code = files.thad_qr_code[0].filename;
      }
    }
    if (files.usdt_qr){
      const usdtQrCode = path.extname(files.usdt_qr[0].filename);
      const allowedExtensions = [".jpg", ".jpeg", ".png"];
      if (!allowedExtensions.includes(usdtQrCode.toLowerCase())) {
        return res.status(400).json({
          message:
            "Invalid file format. Only .jpg and .png files are allowed updates.",
          response: 0,
          success: false,
        });
      } else {
        existingSetting.usdt_qr = files.usdt_qr[0].filename;
      }
    }

    await existingSetting.save();

    const updatedFields = {
      UPI_ID: existingSetting.UPI_ID,
      CRYPTO_ID: existingSetting.CRYPTO_ID,
      commission_rate: existingSetting.commission_rate,
      rechargeamount: existingSetting.rechargeamount,
      withdrawalamount: existingSetting.withdrawalamount,
      bonusamount: existingSetting.bonusamount,
      batbonus: existingSetting.batbonus,
      rechargebonus1: existingSetting.rechargebonus1,
      interest_rate: existingSetting.interest_rate,
      sitename: existingSetting.sitename,
      signupbonusamount: existingSetting.signupbonusamount,
      withdrawal_status: existingSetting.withdrawal_status,
      favicon: existingSetting.favicon,
      logo: existingSetting.logo,
      apk: existingSetting.apk,
      telegram_link: existingSetting.telegram_link,
      theme_color: existingSetting.theme_color,
      qr_code: existingSetting.qr_code,
      minimum_recharge_amount: existingSetting.minimum_recharge_amount,
      minimum_withdrawal_amount: existingSetting.minimum_withdrawal_amount,
      second_upi_id: existingSetting.second_upi_id,
      third_upi_id: existingSetting.third_upi_id,
      thad_qr_code: existingSetting.thad_qr_code,
      usdt_qr: existingSetting.usdt_qr,
      usdt_rate:existingSetting.usdt_rate,
      usdt_code:existingSetting.usdt_code,
      usdt_id:existingSetting.usdt_id,
    };

    res.status(200).json({
      message: "Success",
      response: 1,
      success: true,
      paymet: updatedFields,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      response: 0,
      success: false,
      error: error.message,
    });
    console.log(error);
  }
};

const SelectResultNumber = async function (req, res) {
  const input = req.body;

  try {
    const data = await ManualResult.find({ status: false });
    if (data.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }
    await ManualResult.updateMany(
      {},
      {
        $set: { status: false },
      }
    );

    await ManualResult.updateOne(
      { number: input.number },
      {
        $set: { status: true },
      }
    );
    await Manualresultswitch.updateOne(
      {},
      {
        $set: { switch: "yes", tab: "parity" },
      }
    );

    const total = await ManualResult.countDocuments({
      status: false,
    });

    return res.status(200).json({
      total: total,
      message: "Success",
      response: 1,
    });
  } catch (error) {
    console.log("Error admin fetching data", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const adminSiteNameAndLogoInformation = async (_, res) => {
  try {
    const paymentData = await paymentsetting.find();

    const datas = paymentData.map((item) => ({
      _id: item._id,
      sitename: item.sitename,
      favicon: `${process.env.IMAGE_URL}/images/${item.favicon}`,
      logo: `${process.env.IMAGE_URL}/images/${item.logo}`,
      apk: `${process.env.IMAGE_URL}/${item.apk}`,
      qr_code: `${process.env.IMAGE_URL}/images/${item.qr_code}`,
    }));
    let data;
    datas.forEach((items) => {
      data = items;
    });

    return res.status(200).json({
      data: data,
      message: "Success",
      response: 1,
    });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const redEnvelopeUserList = async (req, res) => {
  try {
    // const page = parseInt(req.query.page) || 1;
    // const pagerow = parseInt(req.query.pagerow) || 10;
    // const skip = (page - 1) * pagerow;
    const user = await Users.find({ red_envelope: false })
      .select('mobile')
    // .skip(skip)
    // .limit(pagerow);
    // const total = await Users.countDocuments({ red_envelope: false });
    return res.status(200).json({
      message: 'red envelope user fetch successfully.',
      data: user,
      // page: page,
      // total: total,
    })
  } catch (error) {
    console.log("Error admin fetching data", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const addUserRedEnvelope = async (req, res) => {
  try {
    const userId = req.query.userId;
    const user = await Users.findById(userId);
    if (user) {
      user.red_envelope = true;
      user.save();
    }
    return res.status(200).json({
      message: 'red envelope user add successfully.',
    });
  } catch (error) {
    console.log("Error admin fetching data", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const redEnvelopeList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pagerow = parseInt(req.query.pagerow) || 10;
    const skip = (page - 1) * pagerow;
    const search = req.query.search || "";

    const query = { red_envelope: true };

    if (search) {
      if (!isNaN(search)) {
        query.$expr = {
          $regexMatch: {
            input: { $toString: "$mobile" },
            regex: new RegExp(`.*${search}.*`, "i"),
          },
        };
      } else {
        query.mobile = { $regex: search, $options: "i" };
      }
    }
    const users = await Users.find(query)
      .select("mobile loginId")
      .skip(skip)
      .limit(pagerow);

    const totalCount = await Users.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: users,
      metadata: {
        total: totalCount,
        page,
        pagerow,
        totalPages: Math.ceil(totalCount / pagerow),
      },
    });
  } catch (error) {
    console.error("Error fetching data for red envelope list", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const removeUserInRedEnvelope = async (req, res) => {
  try {
    const userId = req.query.userId;
    const user = await Users.findById(userId);
    if (user) {
      user.red_envelope = false;
      user.save();
    }
    return res.status(200).json({
      message: 'red envelope user remove successfully.',
    });
  } catch (error) {
    console.log("Error admin fetching data", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const redEnvelopeDataList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageRow = parseInt(req.query.pageRow) || 10;
    const skip = (page - 1) * pageRow;
    const search = req.query.search || "";
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { distributed_amount: { $regex: search, $options: "i" } },
      ];
    }
    const redEnvelopes = await redEnvelope.find(query).sort({ _id: -1 }).skip(skip).limit(pageRow);
    const totalCount = await redEnvelope.countDocuments(query);
    return res.status(200).json({
      success: true,
      data: redEnvelopes,
      total: totalCount,
      page: page,
      pageRow: pageRow,
      totalPages: Math.ceil(totalCount / pageRow),
    });
  } catch (error) {
    console.log("Error admin fetching data", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const redEnvelopeStatusUpdate = async (req, res) => {
  try {
    const id = req.query.id;
    let status = req.query.status;
    const red_envelope = await redEnvelope.findById(id);
    if (red_envelope) {
      red_envelope.status = status;
      red_envelope.save();
    }
    return res.status(200).json({
      success: true,
      message: 'status update successfully'
    });
  } catch (error) {
    console.log("Error admin fetching data", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const getSingleRedEvelope = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await redEnvelope.findById(id);
    return res.status(200).json({
      success: true,
      message: 'fatch single data successfully',
      data: data
    });
  } catch (error) {
    console.log("Error admin fetching data", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
const editRedEnvelope = async (req, res) => {
  try {
    const id = req.query.id;
    const input = req.body;
    const data = await redEnvelope.findById(id);
    if (data) {
      data.name = input.name || data.name;
      data.code = input.code || data.code;
      data.distributed_amount = input.distributed_amount || data.distributed_amount;
      data.status = 1;
      data.save();
    }
    return res.status(200).json({
      success: true,
      message: 'redEnvelope update successfully'
    });
  } catch (error) {
    console.log("Error admin fetching data", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const clearHistory = async (req, res) => {
  try {
    await Users.deleteMany({ owncode: { $ne: "NT1DGPUK" } });
    const user = await Users.findOne({ owncode: "NT1DGPUK" });
    console.log(user._id);
    await Walletsummery.deleteMany({ userid: { $ne: user._id } });
    await withdrawal.deleteMany({ userid: { $ne: user._id } });
    await BankDetail.deleteMany({ userid: { $ne: user._id } });
    await Betting.deleteMany();
    await Complaints.deleteMany();
    await attendances.deleteMany({ userid: { $ne: user._id } });
    await Wallet.deleteMany({ userid: { $ne: user._id } });
    return res.status(200).json({ message: "History cleared successfully" });
  } catch (error) {
    console.log("Error admin fetching data", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getUserBankDetail = async (req, res) => {
  try {
    const id = req.params.id;
    const bankAccount = await BankDetail.findOne({ userid: id });
    return res.status(200).json({
      response: 1,
      success: true,
      data: bankAccount,
    });

  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ error: "Internal server error" })
  }
};

const updateBankDetail = async (req, res) => {
  try {
    const { bankAccount, bankCode, ifscCode, name, upi, userId } = req.body;

    const account = await BankDetail.findOne({ userid: helper.getMongoID(userId) });
    if (account) {
      account.name = name;
      account.ifsc_code = ifscCode;
      account.bank_code = bankCode;
      account.bank_account = bankAccount;
      account.upi = upi;
      await account.save();
    } else {
      const mobile = await Users.findOne({ _id: helper.getMongoID(userId) }).select('mobile');
      await BankDetail.create({
        userid: userId,
        name,
        ifscCode,
        bankCode,
        bankAccount,
        upi,
        mobile_number: mobile.mobile ? mobile.mobile : null,
        address: null,
        city: null,
        state: null,
        type: 'bank',
        status: 1,
      });
    }
    res.status(200).json({
      message: "Bank details added successfully",
      response: 1,
      success: true,
    });
  }
  catch (error) {
    return catchBlock(res, error)
  }
};
const autoLoginId = async (req, res) => {
  try {
    const { autoLoginId } = req.body;
    const user = await Users.findOne({ loginId: autoLoginId });
    if (user) {
      return res.status(400).json({
        message: "User with this login ID already exists",
        response: 0,
        success: false,
      });
    }
    const paymentData = await paymentsetting.findOne();
    if (!paymentData) {
      return res.status(404).json({
        message: "Payment setting not found",
        response: 0,
        success: false,
      });
    }
    paymentData.autoLoginId = autoLoginId;
    await paymentData.save();
    return res.status(200).json({
      message: "Auto Login ID updated successfully",
      response: 1,
      success: true,
    });
  } catch (error) {
    return catchBlock(res, error)
  }
};
const getAutoLoginId = async (req, res) => {
  const paymentData = await paymentsetting.findOne().select('autoLoginId');
  if (!paymentData) {
    return res.status(404).json({
      message: "Payment setting not found",
      response: 0,
      success: false,
    });
  }
  return res.status(200).json({
    autoLoginId: paymentData.autoLoginId,
    response: 1,
    success: true,
  });
};

const changeAdminPassword = async (req, res) => {
  try {
    const userName = req.query.name;
    if(!userName){
       return res.status(400).json({
        message: "User name is required",
        response: 0,
        success: false,
        });
    }
    const {newName , newPassword} = req.body;
    if(!newName || !newPassword){
       return res.status(400).json({
        message: "New name and new password are required",
        response: 0,
        success: false,
         });
    }
      const admin = await admins.findOne();
      admin.name = newName;
      admin.password = newPassword;
      await admin.save();

    return res.status(200).json({
      message: "Admin credentials updated successfully",
      response: 1,
      success: true,
    });
  } catch (error) {
    console.error("Error: " + error)
    res.status(500).json({
      message: error.message || "Internal Server Error",
      response: 0,
      success: false,
    })
  }
};
module.exports = {
  desktop: desktop,
  adminDetail: adminDetail,
  datatable: datatable,
  walletHistory: walletHistory,
  WithdrawalAccept: WithdrawalAccept,
  WithdrawalReject: WithdrawalReject,
  RechargeAccept: RechargeAccept,
  RechargeReject: RechargeReject,
  WithdrawalRequest: WithdrawalRequest,
  RechargePending: RechargePending,
  AdminAcceptRecharge: AdminAcceptRecharge,
  AdminRejectRecharge: AdminRejectRecharge,
  AdminAcceptWithdrawal: AdminAcceptWithdrawal,
  AdminRejectWithdrawal: AdminRejectWithdrawal,
  setresulgame: setresulgame,
  siteSetting: siteSetting,
  notification: notification,
  addbanner: addbanner,
  updatebanner: updatebanner,
  deleteBanner: deleteBanner,
  addproduct: addproduct,
  updateproduct: updateproduct,
  deleteProduct: deleteProduct,
  AllUser: AllUser,
  getleveluser: getleveluser,
  addleveluser: addleveluser,
  updateleveluser: updateleveluser,
  deleteleveluser: deleteleveluser,
  AdminActiveUnActiveUser: AdminActiveUnActiveUser,
  adminPlay: adminPlay,
  adminUpdateWallet: adminUpdateWallet,
  adminUpdateAllUser: adminUpdateAllUser,
  period_bateing_history: period_bateing_history,
  getcomplaint: getcomplaint,
  AdminGetAllUserUserReferidLavel: AdminGetAllUserUserReferidLavel,
  updateComplaint: updateComplaint,
  user_game_history: user_game_history,
  getSiteSettingInputDefaultData: getSiteSettingInputDefaultData,
  GetNotification: GetNotification,
  siteSettingUpdate: siteSettingUpdate,
  SelectResultNumber: SelectResultNumber,
  adminSiteNameAndLogoInformation: adminSiteNameAndLogoInformation,
  redEnvelopeUserList: redEnvelopeUserList,
  addUserRedEnvelope: addUserRedEnvelope,
  redEnvelopeList: redEnvelopeList,
  removeUserInRedEnvelope: removeUserInRedEnvelope,
  redEnvelopeDataList: redEnvelopeDataList,
  redEnvelopeStatusUpdate: redEnvelopeStatusUpdate,
  editRedEnvelope: editRedEnvelope,
  getSingleRedEvelope: getSingleRedEvelope,
  adminAgreeWithdrawal: adminAgreeWithdrawal,
  clearHistory: clearHistory,
  getUserBankDetail: getUserBankDetail,
  updateBankDetail: updateBankDetail,
  autoLoginId: autoLoginId,
  getAutoLoginId: getAutoLoginId,
  changeAdminPassword: changeAdminPassword
};
