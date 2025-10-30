const moment = require("moment");
const { StatusCodes } = require("http-status-codes");
const { responseStatus } = require("../config/config");
const { catchBlock, getMongoID } = require("../helpers/utils.helper");
const { model } = require("mongoose");
const notificationdata = require("../models/notificationdata");
const walletsummery = require("../models/walletsummery");
const attendance = require("../models/attendance");
const Wallet = require("../models/wallet");
const WinningWalletHistory = require("../models/WinningWalletHistory");
const Withdrawal = require("../models/withdrawal");
const PaymentSetting = require("../models/paymentsetting");
const express = require("express");
const { body, validationResult } = require("express-validator");
const Users = require("../models/user");
const { assert } = require("joi");
const { result, forEach } = require("lodash");
const { error, log } = require("winston");
const Otp = require("../models/otp");
const bankdetail = require("../models/bankdetail");
const { Console } = require("winston/lib/winston/transports");
const paymentsetting = require("../models/paymentsetting");
const complaint = require("../models/complaint");
const user_address = require("../models/useraddress");
const Bonus = require("../models/Bonus");
const Lavelusers = require("../models/lavelusers");
const mongoose = require("mongoose");
const Result = require("../models/result");
const chatApp = require("../models/chatApp");
const BonusSummary = require('../models/bonussummery');
const RedEnvelope = require('../models/redEnvelope');
//** Login with Email */
const dashbord = async function (req, res) {
  try {
    res.status(200).send({
      message: "success",
      response: 1,
      success: true,
      data: req.user,
    });
  } catch (error) { }
};

const noticationdata = async function (req, res) {
  try {
    const notifications = await notificationdata.find();
    const lastNotification = notifications[notifications.length - 1];
    res.status(200).json({
      success: true,
      message: "success",
      data: lastNotification,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      response: 0,
      status: false,
    });
    console.log(error);
  }
};

const minedashbord = async function (req, res) {
  try {
    const user = req.user;
    const wallet = await Wallet.findOne({ userid: user._id });

    const walletSummeryDocs = await walletsummery.find({
      userid: user._id,
      actiontype: "interest",
    });
    const intrast = walletSummeryDocs.reduce(
      (total, doc) => total + doc.amount,
      0
    );

    const withdrawalDocs = await Withdrawal.find({
      userid: user._id,
      status: 0,
    });
    const withdrawal = withdrawalDocs.reduce(
      (total, doc) => total + doc.amount,
      0
    );

    const reward1 = await walletsummery.find({
      userid: user._id,
      actiontype: { $in: ["reward", "recharge-bonus"] },
    });
    const reward2 = await WinningWalletHistory.find({
      userid: user._id,
      actiontype: "recharge-bonus",
    });

    const reward =
      reward1.reduce((total, doc) => total + doc.amount, 0) +
      reward2.reduce((total, doc) => total + doc.amount, 0);

    const data = {
      id: user.owncode,
      mobile: user.mobile,
      country_code: user.country_code,
      email: user.email,
      loginId: user.loginId,
      balance: (wallet.amount || 0).toFixed(2),
      commission: (reward || 0),
      intrast: (intrast || 0).toFixed(2),
      totalwithdrawal: (withdrawal || 0).toFixed(2),
      win_amount: (wallet.win_amount || 0).toFixed(2),
      free_amount: (wallet.free_amount || 0).toFixed(2),
    };

    res.status(200).json({
      success: true,
      response: 1,
      message: "success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      response: 0,
      status: false,
    });
    console.log(error);
  }
};

const getupi = async function (req, res) {
  try {
    const paymentsetting = await PaymentSetting.findOne();
    // console.log(paymentsetting);
    if (!paymentsetting) {
      res.status(404).json({
        messsage: "Payment setting not found",
        response: 0,
        status: false,
      });
    }
    const data = {
      UPI_ID: paymentsetting.UPI_ID,
      CRYPTO_ID: paymentsetting.CRYPTO_ID,
      second_upi_id: paymentsetting.second_upi_id,
      third_upi_id: paymentsetting.third_upi_id,
      thad_qr_code: `${process.env.IMAGE_URL}/images/${paymentsetting.thad_qr_code}`,
      usdt_code: paymentsetting.usdt_code,
      usdt_qr: `${process.env.IMAGE_URL}/images/${paymentsetting.usdt_qr}`,
      usdt_id: paymentsetting.usdt_id,
    };
    res.status(200).json({
      success: true,
      message: "success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      response: 0,
      status: false,
    });
    console.log(error);
  }
};
const recharge = async function (req, res) {
  try {
    const input = req.body;
    const walletsummer = await walletsummery.countDocuments({
      orderid: input.reference,
      actiontype: { $in: ["recharge-pending", "rechage-reject", "recharge"] },
    });

    //console.log(walletsummer);

    if (walletsummer > 0) {
      throw new Error("Please enter a unique reference");
    }

    const userid = req.user._id;
    const Users_wallet = async (id) => {
      const wallet = await Wallet.findOne({ userid: id });
      return wallet && wallet.amount !== null ? wallet.amount : 0;
    };

    const userWallet = await Users_wallet(userid);

    const walletsummerdata = {
      userid: userid,
      orderid: input.reference,
      amount: input.amount,
      wallet: userWallet,
      type: "credit",
      actiontype: "recharge-pending",
      rechargetype: input.rechargetype,
      usdtAmount: input.usdtAmount || 0,
    };

    const success = await walletsummery.create(walletsummerdata);
    res.status(200).json({
      message: "Deposit Request Submit Successfully",
      response: 1,
      success: true,
    });
    //console.log(success);
  } catch (error) {
    res.status(200).json({
      message: error.message,
      response: 0,
      success: false,
    });
  }
};

const rechargerecord = async function (req, res) {
  try {
    const input = req.body;
    const user = req.user;
    // const page = input.page || 1;
    // const pagerow = input.pagerow || 10;
    // const skip = (page - 1) * pagerow;
    const offset = input.offset || 1;
    const offsetvalue = input.offsetvalue || 10;
    const skip = (offset - 1) * offsetvalue;

    const whereCondition = {
      userid: user._id,
      actiontype: ["recharge", "recharge-reject", "recharge-pending"],
    };

    const data = await walletsummery
      .find(whereCondition)
      .skip(skip)
      .sort({ _id: -1 })
      .limit(offsetvalue);

    const total = await walletsummery.countDocuments(whereCondition);

    const success = {
      data: data,
      message: "success",
      response: 1,
      success: true,
      total: total,
    };
    return res.json(success);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      response: 0,
      message: "Internal server error",
    });
  }
};

const newaddbankdetail = async function (req, res) {
  try {
    let user = req.user;
    if (!user) {
      return res.status(200).json({
        message: "User not found",
        success: false,
      });
    }
    const bk = await bankdetail.countDocuments({ userid: user._id });
    if (bk > 0) {
      return res.status(200).json({
        message: "Only one bank card can be bound",
        success: false,
      });
    }

    const input = req.body;
    const isOTPVaild = await Otp.find({
      mobile_number: input.mobile,
      email: input.email,
      otp: input.otp,
    });
    if (!isOTPVaild) {
      return res.status(200).json({
        message: "Invalid OTP",
        response: 0,
        success: false,
      });
    }

    const data = new bankdetail({
      userid: user._id,
      name: input.name,
      ifsc_code: input.ifsc_code,
      bank_code: input.bank_code,
      bank_account: input.bank_account,
      otp: input.otp,
      upi: null,
      mobile_number: input.mobile_number,
      address: input.address,
      city: input.city,
      state: input.state,
      email: input.email,
      type: "bank",
      status: 1,
    });
    await data.save();
    return res.json({
      message: "Success",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      response: 0,
      message: "Internal server error",
    });
  }
};

const getbankdetail = async function (req, res) {
  try {
    const user = req.user;
    const BankDetail = await bankdetail.find({
      userid: user._id,
      crypto_address: null,
    });
    const data = [];
    for (const value of BankDetail) {
      data.push({
        id: value._id,
        name: value.name,
        ifsc: value.ifsc,
        bankname: value.bankname,
        bankaccount: value.bankaccount,
        mobile: value.mobile,
        email: value.email,
      });
    }
    res.status(200).json({
      message: "success",
      respone: 1,
      success: true,
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      response: 0,
      message: "Internal server error",
    });
  }
};

const getBankDetailByUser = async function (req, res) {
  try {
    const user = req.user;
    const BankDetail = await bankdetail.find({
      userid: user._id,
      crypto_address: null,
    });
    return res.status(200).json({
      message: "success",
      respone: 1,
      success: true,
      data: BankDetail,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: 0,
      message: "Internal server error",
    });
  }
};
const editBankDetail = async function (req, res) {
  try {
    const id = req.user._id;
    const { name, ifsc_code, bank_code, bank_account, state, city, address, mobile_number } = req.body;
    const updatedBankDetail = await bankdetail.findOneAndUpdate(
      { userid: id },
      {
        name,
        ifsc_code,
        bank_code,
        bank_account,
        state,
        city,
        address,
        mobile_number
      },
      { new: true }
    );
    if (!updatedBankDetail) {
      return res.status(404).json({
        message: "Bank detail not found",
        response: 0,
        success: false,
      });
    }
    return res.status(200).json({
      message: "Bank detail updated successfully",
      response: 1,
      success: true,
      data: updatedBankDetail,
    });
  } catch (error) {
    return catchBlock(res, error);
  }
};
const deleteBankDetail = async function (req, res) {
  try {
    const user = req.user;

    const deletedBankDetail = await bankdetail.findOneAndDelete({
      userid: user._id,
    });
    if (!deletedBankDetail) {
      return res.status(404).json({
        message: "Bank detail not found",
        response: 0,
        success: false,
      });
    }
    return res.status(200).json({
      message: "Bank detail deleted successfully",
      response: 1,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      response: 0,
      message: "Internal server error",
    });
  }
}

const rewardrecord = async function (req, res) {
  try {
    const input = req.body;
    const user = req.user;
    const page = input.page || 1;
    const pagerow = input.pagerow || 10;
    const skip = (page - 1) * pagerow;

    const whereCondition = {
      userid: user._id,
      actiontype: ["reward", "recharge-bonus", "water reward"],
    };
    const data = await walletsummery
      .find(whereCondition)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pagerow);
    const total = await walletsummery.countDocuments(whereCondition);
    const success = {
      data: data,
      message: "Success",
      response: 1,
      total: total,
      success: true,
    };
    res.json(success);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const interestrecord = async function (req, res) {
  try {
    const input = req.body;
    const user = req.user;
    const page = input.page || 1;
    const pagerow = input.pagerow || 10;
    const skip = (page - 1) * pagerow;

    const whereCondition = {
      userid: user._id,
      actiontype: ["interest"],
    };
    const data = await walletsummery
      .find(whereCondition)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pagerow);

    const total = await walletsummery.countDocuments(whereCondition);
    const success = {
      data: data,
      total: total,
      message: "Success",
      response: 1,
      success: true,
    };
    res.json(success);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const generateWithdrawalCode = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `pokerbaazi${year}${month}${date}${hour}${minutes}${randomDigits}`;
};


const withdrawal = async function (req, res) {
  try {
    const input = req.body;
    const user = req.user;
    const withdrawal = await bankdetail.findOne({ _id: input.account_id });
    const wallet = await Wallet.findOne({ userid: user._id })
    const getWidthrolStatus = await paymentsetting.findOne();
    var withdrawalCode = generateWithdrawalCode();
    if (getWidthrolStatus.withdrawal_status === false) {
      return res.status(200).json({
        message: "Network Unavailable",
        response: 0,
        success: false,
      });
    }
    const minimum_withdrawal_amount = await paymentsetting.findOne().select("minimum_withdrawal_amount");
    if (input.amount < minimum_withdrawal_amount.minimum_withdrawal_amount) {
      return res.status(200).json({
        message: `Minimum withdrawal amount is ${minimum_withdrawal_amount?.minimum_withdrawal_amount || 211}`,
        response: 0,
        success: false,
      });
    }
    if (input.selectedWallet === "wallet") {
      const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
      const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));
      const withdrawalCount = await Withdrawal.countDocuments({
        userid: user._id,
        createdate: { $gte: startOfDay, $lte: endOfDay },
      });
      const withdrawalSwitch = await paymentsetting.findOne({
        where: { withdrawal_status: true },
      });
      const Walletsummery = await walletsummery.countDocuments({
        userid: user._id,
        actiontype: "recharge",
      });
      if (wallet.amount < input.amount) {
        return res.json({
          message: "Enter Valid Amount",
          response: 0,
          success: false,
        });
      }
      if (
        wallet.amount < input.amount &&
        withdrawalSwitch.withdrawalamount < input.amount
      ) {
        res.json({ message: "Low Balence", response: 0, success: false });
      } else if (user.password != input.password) {
        res.json({
          message: "Paasword Not meched",
          response: 0,
          success: false,
        });
      } else if (withdrawalCount >= 2) {
        res.json({
          message: "You can only send two withdrawal requests per day",
          response: 0,
          success: false,
        });
      } else if (withdrawalSwitch == 0) {
        res.json({
          message: "This time you do not have send request",
          response: 0,
          success: false,
        });
      }
      //  else if (Walletsummery == 0) {
      //   res.json({
      //     message: "please minimum one recharge",
      //     response: 0,
      //     success: false,
      //   });
      // } 
      else {
        wallet.amount -= input.amount;
        wallet.save();

        const withdrawal = await Withdrawal.create({
          userid: user._id,
          amount: input.amount,
          paybleamount: input.amount - (input.amount * 5) / 100,
          payout: input.payout,
          account_id: input.account_id,
          payid: Withdrawal._id,
          code: withdrawalCode,
          type: "wallet",
          ifsc: Withdrawal.ifsc,
          account: Withdrawal.account,
          status: 2,
        });
        await walletsummery.create({
          userid: user._id,
          orderid: "-",
          amount: input.amount,
          wallet: wallet.amount,
          type: "debit",
          actiontype: 'withdrawal',
        })
        res.status(200).json({
          success: true,
          message: "withdrawal successfully IN wallet",
          withdrawal: withdrawal,
        });
      }
    } else {
      const withdrawalCount = await Withdrawal.countDocuments({
          userid: user._id,
          createdate: new Date().toISOString().split("T")[0],
      });
      console.log("withdrawalCount2", withdrawalCount)
      const withdrawalSwitch = await paymentsetting.findOne({
        where: { withdrawal_status: true },
      });
      const Walletsummery = await walletsummery.countDocuments({
        userid: user._id,
        actiontype: "recharge",
      });
      if (wallet.win_amount < input.amount) {
        return res.json({
          message: "Enter Valid Amount",
          response: 0,
          success: false,
        });
      }
      if (
        wallet.win_amount < input.amount &&
        withdrawalSwitch.withdrawalamount < input.amount
      ) {
        res.json({ message: "Low Balence", response: 0, success: false });
      } else if (user.password != input.password) {
        res.json({
          message: "Paasword Not meched",
          response: 0,
          success: false,
        });
        console.log("withdrawalCount", withdrawalCount)
      } else if (withdrawalCount >= 2) {
        res.json({
          message: "You can only send two withdrawal requests per day",
          response: 0,
          success: false,
        });
      } else if (withdrawalSwitch == 0) {
        res.json({
          message: "This time you do not have send request",
          response: 0,
          success: false,
        });
      } 
      // else if (Walletsummery == 0) {
      //   res.json({
      //     message: "please minimum one recharge",
      //     response: 0,
      //     success: false,
      //   });
      // }
       else {
        wallet.win_amount -= input.amount;
        wallet.save();
        await Withdrawal.create({
          userid: user._id,
          amount: input.amount,
          paybleamount: input.amount - (input.amount * 5) / 100,
          payout: input.payout,
          account_id: input.account_id,
          payid: Withdrawal._id,
          type: "WinWallet",
          ifsc: Withdrawal.ifsc,
          code: withdrawalCode,
          account: Withdrawal.account,
          status: 2,
        });
        await WinningWalletHistory.create({
          userid: user._id,
          amount: input.amount,
          type: "debit",
          wallet: wallet.win_amount,
          actiontype: "withdrawal",
        });
        await walletsummery.create({
          userid: user._id,
          orderid: "-",
          amount: input.amount,
          wallet: wallet.win_amount,
          type: "debit",
          actiontype: 'withdrawal',
        })
        res.status(200).json({
          success: true,
          message: "withdrawal successfully in winwallet",
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const transactions = async function (req, res) {
  try {
    const user = req.user;
    const input = req.body;
    const page = input.page || 1;
    const pagerow = input.pagerow || 10;
    const skip = (page - 1) * pagerow;
    const whereCondition = {
      userid: getMongoID(user._id),
      actiontype: { $ne: "recharge-pending" },
    };

    const data = await walletsummery
      .find(whereCondition)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pagerow);

    const total = await walletsummery.find({
      userid: getMongoID(user._id),
      type: "credit",
      actiontype: { $ne: "recharge-pending" },
    });
    const success = {
      data: data,
      message: "success",
      response: 1,
      success: true,
      total: total.length,
    };
    res.json(success);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      response: 0,
      success: false,
    });
    console.log(error);
  }
};

const newCryptoAddress = async function (req, res) {
  try {
    const user = req.user;
    const bk = bankdetail.find({
      userid: user._id,
      crypto_address: { $ne: null },
    });
    if (bk > 0) {
      res.status(200).json({
        message: "Only one crypto address can be bound",
        success: false,
      });
    }
    const input = req.body;
    const result = await bankdetail.updateOne({
      userid: user._id,
      crypto_address: input.crypto_address,
    });
    res.status(200).json({
      message: "success",
      success: true,
      result: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const addcryptodetail = async function (req, res) {
  try {
    const input = req.body;
    const user = req.user;
    const result = await bankdetail.updateOne({
      userid: user._id,
      crypto_address: input.crypto_address,
    });
    res.status(200).json({
      message: "success",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getCryptoDetail = async function (req, res) {
  try {
    const user = req.user;
    const address = await bankdetail.find({
      userid: user._id,
      crypto_address: { $ne: null },
    });
    //console.log(address);

    const data = address.map((value) => ({
      id: value.id,
      crypto_address: value.crypto_address,
    }));

    const success = {
      success: true,
      message: "success",
      data: data,
    };

    res.json(success);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const addcomplaints = async function (req, res) {
  try {
    const user = req.user;
    const input = req.body;
    const data = await complaint.create({
      userid: user._id,
      complait_for: input.type,
      complait_id: input.out_id,
      complait_subject: input.WhatsApp,
      complait_text: input.Description,
      complait_reply: "",
      complait_reply_time: null,
      complaint_status: "Under Review",
    });
    res.status(200).json({
      data: data,
      message: "success",
      response: 1,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const waitcomplaints = async function (req, res) {
  try {
    const input = req.body;
    const page = parseInt(input.page) || 1;
    const pagerow = parseInt(input.pagerow) || 10;
    const skip = (page - 1) * pagerow;
    const user = req.user;

    const query = {
      userid: user._id,
      complaint_status: "Under Review",
    };

    const data = await complaint.find(query).skip(skip).limit(pagerow);

    const totalDocumentsCount = await complaint.countDocuments(query);

    res.status(200).json({
      data: data,
      totalDocumentsCount: totalDocumentsCount,
      totalPages: Math.ceil(totalDocumentsCount / pagerow),
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

const complitcomplaints = async function (req, res) {
  try {
    const input = req.body;
    const page = parseInt(input.page) || 1;
    const pagerow = parseInt(input.pagerow) || 10;
    const skip = (page - 1) * pagerow;
    const user = req.user;

    const query = {
      userid: user._id,
      complaint_status: { $ne: "Under Review" },
    };

    const data = await complaint.find(query).skip(skip).limit(pagerow);

    const totalDocumentsCount = await complaint.countDocuments(query);

    res.status(200).json({
      data: data,
      totalDocumentsCount: totalDocumentsCount,
      totalPages: Math.ceil(totalDocumentsCount / pagerow),
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

const wintransactions = async function (req, res) {
  try {
    const user = req.user;
    const input = req.body;

    const page = parseInt(input.page) || 1;
    const pagerow = parseInt(input.pagerow) || 10;
    const skip = (page - 1) * pagerow;

    const whereCondition = {
      userid: user._id,
      actiontype: { $in: ["win", "withdrawal"] },
    };
    const data = await WinningWalletHistory.find(whereCondition)
      .sort({ createdate: -1 })
      .skip(skip)
      .limit(pagerow);
    // console.log(walletsummer);
    const total = await WinningWalletHistory.countDocuments(whereCondition);
    // console.log(total);
    const totalSum = data
      .reduce((acc, item) => item.wallet + item.amount, 0)
      .toFixed(2);
    res.status(200).json({
      data: data,
      message: "success",
      respone: 1,
      success: true,
      total: total,
      totalSum: totalSum,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      response: 0,
      success: false,
    });
  }
};

const address = async function (req, res) {
  try {
    const user = req.user;
    const input = req.body;

    const address = await user_address.create({
      userid: user._id,
      full_name: input.full_name,
      mobile: input.mobile_number,
      pincode: input.pincode,
      state: input.state,
      city: input.city,
      address: input.detail_address,
    });
    res.status(200).json({
      address: address,
      message: "success",
      respone: 1,
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      response: 0,
      success: false,
    });
  }
};

const getaddress = async function (req, res) {
  try {
    const user = req.user;
    // console.log(user);
    const address = await user_address.find({ userid: user._id });
    // res.send(address);
    data = [];
    for (const value of address) {
      data.push({
        _id: value._id,
        full_name: value.full_name,
        mobile: value.mobile,
        pincode: value.pincode,
        state: value.state,
        city: value.city,
        address: value.address,
      });
    }
    res.status(200).json({
      message: "success",
      respone: 1,
      success: true,
      data: data,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      response: 0,
      success: false,
    });
  }
};

const transferWalletAmount = async function (req, res) {
  const user = req.user;
  const { amount } = req.body;
  try {
    const response = {};
    const wallet = await Wallet.findOne({ userid: user._id });
    if (!wallet) {
      response.status = "error";
      response.message = "Wallet data not found for this user.";
      return res.json(response);
    }
    const winAmount = wallet.win_amount || 0;
    if (amount && amount <= winAmount) {
      wallet.amount += parseInt(amount);
      wallet.win_amount -= parseInt(amount);
      await wallet.save();
      const orderid = Date.now() + Math.random() + user._id;
      await WinningWalletHistory.create({
        userid: user._id,
        orderid,
        amount,
        type: "debit",
        wallet: wallet.amount,
        actiontype: "Transfer",
      });
      response.status = "success";
      response.message =
        "Win wallet amount successfully transferred to main wallet.";
    } else {
      response.status = "error";
      response.message = "Please enter a valid amount.";
    }
    res.json(response);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      response: 0,
      success: false,
    });
  }
};

// const promotiondashbordnew = async function (req, res) {
//   try {
//     const input = req.body;
//     const levelTabFlag = input.levelTab;
//     const bonus = await Bonus.findOne({ userid: req.user._id });
//     const user = await Users.findOne({ id: req.user._id });

//     const laveldata = await Lavelusers.find();
//     let ownddd = req.user.owncode;
//     let userscounts = 0;
//     let total_level_recharge = 0;

//     for (let i = 1; i <= laveldata.length; i++) {
//       if (ownddd !== "") {
//         let ids = [];
//         if (i === 1) {
//           const users = await Users.find({ code: ownddd });
//           ids = users.map((user) => user._id);
//           ownddd = users.map((user) => user.owncode);
//         } else {
//           const users = await Users.find({ code: { $in: ownddd } });
//           ids = users.map((user) => user._id);
//           ownddd = users.map((user) => user.owncode);
//         }

//         if (ids.length > 0) {
//           userscounts += ids.length;
//           const amounts = await walletsummery.aggregate([
//             {
//               $match: {
//                 actiontype: "recharge",
//                 userid: { $in: ids },
//               },
//             },
//             {
//               $group: {
//                 _id: null,
//                 totalAmount: { $sum: "$amount" },
//               },
//             },
//           ]);

//           if (amounts.length > 0) {
//             total_level_recharge += amounts[0].totalAmount;
//           }
//         }
//       }
//     }
//     const data = {
//       promotion_code: req.user.owncode,
//       total_bonus: bonus ? bonus.amount.toFixed(2) : 0,
//       total_people: userscounts,
//       contribution: total_level_recharge.toFixed(2),
//     };

//     res.json({ success: true, message: "Success", data });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

const promotiondashbordnew = async function (req, res) {
  try {
    const input = req.body;
    const levelTabFlag = parseInt(input.levelTab, 10);
    const page = input[`lavel${levelTabFlag}Page`] || 1;
    const pageSize = input[`lavel${levelTabFlag}PageRow`] || 10;
    const skip = (page - 1) * pageSize;
    const search = input.search;

    const bonus = await walletsummery.find({ userid: req.user._id, actiontype: 'bonus' }).select("amount");
    const owncode = req.user.owncode;
    let ownddd = [owncode];

    const levelCounts = { countlevel1: 0, countlevel2: 0, countlevel3: 0 };
    const levelsData = {};

    let userscounts = 0;
    let total_level_recharge = 0;

    for (let i = 1; i <= 3; i++) {
      if (ownddd.length === 0) break;

      const users = await Users.find({ code: { $in: ownddd } });
      const ids = users.map((user) => user._id);
      ownddd = users.map((user) => user.owncode);

      if (ids.length > 0) {
        userscounts += ids.length;
        levelCounts[`countlevel${i}`] += ids.length;

        const amounts = await walletsummery.aggregate([
          { $match: { actiontype: "join", userid: { $in: ids } } },
          { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
        ]);

        if (amounts.length > 0) {
          total_level_recharge += amounts[0].totalAmount;
        }

        if (i === levelTabFlag) {
          const userDetails = await Users.aggregate([
            {
              $match: {
                code: { $in: users.map((user) => user.code) }
              }
            },
            {
              $lookup: {
                from: "wallet_summeries",
                localField: "_id",
                foreignField: "sender_id",
                as: "userRewardAmount",
              },
            },
            {
              $addFields: {
                filteredRewards: {
                  $filter: {
                    input: "$userRewardAmount",
                    as: "wallet",
                    cond: {
                      $and: [
                        { $eq: ["$$wallet.type", "credit"] },
                        { $eq: ["$$wallet.actiontype", "bonus"] }
                      ]
                    }
                  }
                },
                filteredRechargeBonus: {
                  $filter: {
                    input: "$userRewardAmount",
                    as: "wallet",
                    cond: {
                      $and: [
                        { $eq: ["$$wallet.type", "credit"] },
                        { $eq: ["$$wallet.actiontype", "recharge-bonus"] }
                      ]
                    }
                  }
                },
              }
            },
            {
              $addFields: {
                filteredRechargeBonus: {
                  $arrayElemAt: ["$filteredRechargeBonus.amount", 0]
                },
                totalRewardAmount: {
                  $sum: "$filteredRewards.amount"
                }
              }
            },
            {
              $project: {
                _id: 1,
                loginId: 1,
                mobile: 1,
                totalRewardAmount: 1,
                filteredRechargeBonus: 1,
              },
            },
          ])
            .skip(skip)
            .limit(pageSize);

          levelsData[`level${i}`] = userDetails.map((user) => ({
            id: user._id,
            loginId: user.loginId,
            mobile: user.mobile,
            Water_reward: user.totalRewardAmount,
            First_reward: user.filteredRechargeBonus || 0,
          }));
        }
      }
    }
    const totalBonus = bonus.reduce((sum, b) => sum + (b.amount || 0), 0);
    const responseData = {
      promotion_code: owncode,
      total_bonus: totalBonus.toFixed(2),
      total_people: userscounts,
      contribution: total_level_recharge,
      ...levelCounts,
      [`level${levelTabFlag}`]: levelsData[`level${levelTabFlag}`] || [],
    };
    res.json({
      success: true,
      response: 1,
      message: "Success",
      data: responseData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const myTeemLevelOfUsers = async (req, res) => {
  const input = req.body;
  let page = input.page ? Number(input.page) : 1;
  let pageSize = input.pageSize ? Number(input.pageSize) : 10;
  let skip = (page - 1) * pageSize;
  let searchTearms = input.searchTearms;

  try {
    const { endLevel } = req.body;
    let owncode = req.user.owncode;

    const allUserUserReferidLavel = async (
      userCodes,
      level,
      endLevel,
      skip,
      limit
    ) => {
      if (level === endLevel) {
        const aggregateData = await Users.aggregate([
          {
            $match: {
              code: { $in: userCodes },
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
            $project: {
              _id: 1,
              code: 1,
              owncode: 1,
              mobile: 1,
              created_at: 1,
              userTotleRechargeAmount: {
                $arrayElemAt: ["$usertotlerechargeamount", 0],
              },
            },
          },
        ])
          .skip(skip)
          .limit(limit);

        return aggregateData;
      }

      let storeLevelData = [];

      const data = await Users.find({ code: { $in: userCodes } });

      if (data.length > 0) {
        for (const user of data) {
          const childData = await allUserUserReferidLavel(
            [user.owncode],
            level + 1,
            endLevel,
            skip,
            limit
          );

          storeLevelData.push(...childData);
        }

        return storeLevelData;
      } else {
        return [];
      }
    };

    const endLevelData = await allUserUserReferidLavel(
      [owncode],
      1,
      endLevel,
      skip,
      pageSize
    );
    let mobileGetData = [];
    endLevelData.map((item) => mobileGetData.push(item.mobile));

    if (searchTearms) {
      const searchTermInt = parseInt(searchTearms);
      if (!isNaN(searchTermInt)) {
        mobileGetData[0] = searchTermInt;
      }
    }

    // console.log("mobilenumber", mobileGetData);
    res.status(200).json({
      data: endLevelData,
      totleCount: endLevelData.length,
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

const getPromotionLink = async function (req, res) {
  try {
    const user = req.user;
    const promotionCode = user.owncode;
    const data = { promotion_code: promotionCode };
    const successResponse = { success: true, message: "Success", data: data };
    res.json(successResponse);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
      response: 0,
      success: false,
    });
  }
};

const getattendance = async function (req, res) {
  try {
    const user = req.user;
    const Attendance = await attendance.findOne({ userid: user._id });

    if (!Attendance) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance not found" });
    }

    const data = {};
    data.total = Attendance.total_days || 0;
    data.today_rebates = 0;
    data.total_rebates = Attendance.total_rebates || 0;

    const todayDate = moment().format("YYYY-MM-DD");
    const oldDate = Attendance.updated_at
      ? moment(Attendance.updated_at).format("YYYY-MM-DD")
      : null;

    if (todayDate === oldDate) {
      data.today_rebates = 5;
      data.status = "Had signed in";
    } else {
      data.status = "Not signed";
    }

    const success = { success: true, message: "Success", data };
    res.json(success);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
      response: 0,
      success: false,
    });
  }
};

const Attendance = async function (req, res) {
  try {
    const user = req.user;
    const Attendances = await attendance.findOne({ userid: user._id });
    if (!Attendances) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance not found" });
    }

    const todayDate = new Date().toISOString().split("T")[0];
    const oldDate = Attendances.updated_at
      ? Attendances.updated_at.toISOString().split("T")[0]
      : null;
    const bonus = 5;
    if (oldDate && todayDate > oldDate) {
      Attendances.total_days += 1;
      Attendances.total_rebates += bonus;
      Attendances.today_rebates = bonus;

      Attendances.updated_at = new Date();

      await Attendances.save();

      let userWallet = await Wallet.findOne({ userid: user._id });
      userWallet.amount += bonus;
      await userWallet.save();
      console.log("userWallet.wallet", userWallet.amount)
      await walletsummery.create({
        userid: user._id,
        orderid: "",
        amount: bonus,
        wallet: Number(userWallet.amount) || 0,
        type: "credit",
        actiontype: "sign-in-bonus",
      });

      return res.json({ success: true, message: "Success" });
    } else {
      return res.json({ success: false, message: "Had signed in" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const singalcomplaints = async function (req, res) {
  try {
    const input = req.body;
    const complaints = await complaint.findOne({ _id: input._id });

    if (!complaints) {
      return res
        .status(500)
        .json({ success: false, message: "complaints not found" });
    }
    res.status(200).json({
      data: complaints,
      message: "success",
      success: true,
      respone: 1,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const trend = async function (req, res) {
  let resArr = [];
  let res1Arr = [];
  let data = {};
  let color = "";
  let outcolor = "";
  let tup = "";
  let number = 0;
  let number2 = 0;
  let loopvar = 0;

  const { category } = req.body;

  try {
    // Get the current date
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);

    const results = await Result.find({
      tabtype: category,
      created_at: { $gte: currentDate, $lt: nextDate },
    })
      .sort({ _id: -1 })
      .exec();

    let greencount = await Result.countDocuments({
      tabtype: category,
      randomcolor: { $in: ["green", "green++violet"] },
      resulttype: { $in: ["random", "real"] },
      created_at: { $gte: currentDate, $lt: nextDate },
    });

    let redcount = await Result.countDocuments({
      tabtype: category,
      randomcolor: { $in: ["red", "red++violet"] },
      resulttype: { $in: ["random", "real"] },
      created_at: { $gte: currentDate, $lt: nextDate },
    });

    let violetcount = await Result.countDocuments({
      tabtype: category,
      randomcolor: { $in: ["red++violet", "green++violet"] },
      resulttype: { $in: ["random", "real"] },
      created_at: { $gte: currentDate, $lt: nextDate },
    });

    for (const value of results) {
      let periodid = "";
      if (typeof value.periodid === "number") {
        periodid = value.periodid.toString().slice(-3);
      }

      if (value.resulttype === "random") {
        switch (value.randomcolor) {
          case "red++violet":
          case "RED & VIOLET":
            tup = "red";
            outcolor = "violet-red";
            break;
          case "green++violet":
          case "GREEN & VIOLET":
            tup = "green";
            outcolor = "violet-green";
            break;
          case "green":
          case "GREEN":
            tup = "green";
            outcolor = "green";
            break;
          case "red":
          case "RED":
            tup = "red";
            outcolor = "red";
            break;
          default:
            tup = value.randomcolor;
            outcolor = value.randomcolor;
            break;
        }
      } else {
        switch (value.randomcolor) {
          case "red++violet":
          case "RED & VIOLET":
            tup = "red";
            outcolor = "violet-red";
            break;
          case "green++violet":
          case "GREEN & VIOLET":
            tup = "green";
            outcolor = "violet-green";
            break;
          case "green":
          case "GREEN":
            tup = "green";
            outcolor = "green";
            break;
          case "red":
          case "RED":
            tup = "red";
            outcolor = "red";
            break;
          default:
            tup = value.randomcolor;
            outcolor = value.randomcolor;
            break;
        }
      }

      if (color && color !== tup) {
        number++;
        number2 = 0;
      }

      resArr[number] = resArr[number] || [];
      resArr[number][number2] = {
        color: outcolor,
        value:
          value.resulttype === "random" ? value.randomresult : value.result,
        parity: periodid || 0,
      };

      color = tup;
      loopvar = Math.max(loopvar, number2);
      number2++;
    }

    for (let i = 0; i < loopvar; i++) {
      res1Arr[i] = [];
      for (let key in resArr) {
        res1Arr[i][key] = resArr[key][i] || "";
      }
    }
    data.allresult = res1Arr;
    data.latresult = results[0];
    data.greencount = greencount;
    data.redcount = redcount;
    data.totalviolet = violetcount;

    res.json({ success: true, response: 1, message: "Success", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const deleteAddress = async (req, res) => {
  let input = req.body;
  try {
    const Banner = await user_address.find().select("_id").limit(1);
    if (Banner.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }
    await user_address.deleteOne({ _id: input._id });

    res.status(200).json({
      message: "Address deleted successfully",
      response: 1,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
const withdrawalRecord = async (req, res) => {
  const userid = req.user;
  const input = req.body;
  const page = input.page || 1;
  const pagerow = input.pagerow || 10;
  const skip = (page - 1) * pagerow;
  try {
    const data = await Withdrawal.find({ userid: userid._id })
      .skip(skip)
      .limit(pagerow)
      .sort({ _id: -1 });
    const total = await Withdrawal.countDocuments({ userid: userid._id });
    res.status(200).json({
      data: data,
      total: total,
      message: "Withdrawal record exist.",
      response: 1,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getAllChatAppListUsers = async (req, res) => {
  try {
    let query = {};
    if (req.body.search && !isNaN(req.body.search)) {
      query = { mobile: req.body.search };
    }
    const userSearchData = await Users.find(query);

    if (!userSearchData || userSearchData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found.",
      });
    }

    const data = userSearchData.map((item) => ({
      userid: item._id,
      mobile: item.mobile,
    }));

    res.status(200).json({
      data: data,
      message: "Users retrieved successfully.",
      response: 1,
      success: true,
    });
  } catch (error) {
    console.log("Error", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const addMessage = async (req, res) => {
  const input = req.body;
  const userid = req.user;
  const img = req.file;
  let images;

  try {
    images = {
      message: {
        text: input.message,
      },
      users: [userid._id, input.senderid],
      sender: userid._id,
      status: 0,
    };
    if (img) {
      (images.fileType = input.fileType), (images.image = img?.filename);
    }

    const data = await chatApp.create(images);
    if (data) {
      return res.json({
        msg: "Message added successfully!",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const AllMessageGet = async function (req, res) {
  const input = req.body;
  const userid = req.user;
  const page = input.page || 1;
  const pageSize = input.pageSize || 100;
  const skip = (page - 1) * pageSize;
  try {
    const from = userid._id;
    const to = input.to;
    const data = await chatApp
      .find({
        users: {
          $all: [from, to],
        },
      })
      .sort({ created_at: -1 }) // Sort in descending order based on created_at
      .limit(pageSize)
      .skip(skip);
    const projectMessages = data
      .map((msg) => {
        return {
          id: msg._id,
          fromSelf: msg.sender.toString() === from,
          message: msg.message.text,
          to: to,
          image: msg.image
            ? `${process.env.IMAGE_URL}/images/${msg.image}`
            : "",
          sender: msg.sender,
          fileType: msg.fileType || "",
          created_at: msg.created_at,
          status: msg.status,
        };
      })
      .reverse(); // Reverse the order after sorting
    const totalDocumentsCount = await chatApp.countDocuments({
      users: {
        $all: [from, to],
      },
    });
    res.status(200).json({
      data: projectMessages,
      currentPage: page,
      totalPages: Math.ceil(totalDocumentsCount / pageSize),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getAllUser = async function (req, res) {
  try {
    const userId = req.user._id;
    const sentMessages = await chatApp.find({ sender: userId });
    const receivedMessages = await chatApp.find({ users: userId });
    const allMessages = [...sentMessages, ...receivedMessages].sort(
      (a, b) => a.createdAt - b.createdAt
    );

    let lastMessages = {};
    allMessages.forEach((message) => {
      if (message.sender && message.sender.toString() === userId.toString()) {
        const recipientId = message.users[1]?.toString();
        if (recipientId) {
          lastMessages[recipientId] = message;
        }
      } else {
        const senderId = message.sender?.toString();
        if (senderId) {
          lastMessages[senderId] = message;
        }
      }
    });

    const userIds = new Set();
    sentMessages.forEach((message) => {
      if (message.sender) {
        userIds.add(message.sender.toString());
      }
      if (message.users[1]) {
        userIds.add(message.users[1].toString());
      }
    });

    receivedMessages.forEach((message) => {
      if (message.sender) {
        userIds.add(message.sender.toString());
      }
      if (message.users[0]) {
        userIds.add(message.users[0].toString());
      }
    });

    userIds.delete(userId.toString());

    const users = await Users.find({ _id: { $in: Array.from(userIds) } }).sort({
      created_at: 1,
    });

    const receivedMessagesStatusZeroCountMap = {};
    receivedMessages.forEach((message) => {
      if (message.status === 0 && message.sender) {
        const senderId = message.sender.toString();
        if (!receivedMessagesStatusZeroCountMap[senderId]) {
          receivedMessagesStatusZeroCountMap[senderId] = 0;
        }
        receivedMessagesStatusZeroCountMap[senderId]++;
      }
    });

    const data = users.map((item) => ({
      userid: item._id,
      mobile: item.mobile,
      created_at: item.created_at,
      lastMessageTime: lastMessages[item._id.toString()]
        ? lastMessages[item._id.toString()].created_at
        : null,
      lastMessage: lastMessages[item._id.toString()]
        ? lastMessages[item._id.toString()].message.text
        : null,
      receivedMessagesStatusZeroCount:
        receivedMessagesStatusZeroCountMap[item._id.toString()] || 0,
    }));

    data.sort((a, b) => {
      if (!a.lastMessageTime && !b.lastMessageTime) {
        return 0;
      }
      if (!a.lastMessageTime) {
        return 1;
      }
      if (!b.lastMessageTime) {
        return -1;
      }
      return b.lastMessageTime - a.lastMessageTime; // Descending order
    });

    res.status(200).json({
      data: data,
      message: "success",
      success: true,
      response: 1,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getAllUserwithsearch = async function (req, res) {
  try {
    const input = req.body;
    const userid = req.user._id;
    const searchTerms = input?.searchTerms;
    let pipeline = [
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(userid) },
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "_id",
          foreignField: "sender",
          as: "messages",
        },
      },
      {
        $project: {
          _id: 1,
          mobile: 1,
          created_at: 1,
        },
      },
    ];

    if (searchTerms) {
      pipeline.push(
        {
          $addFields: {
            search_mobile: { $toString: "$mobile" },
          },
        },
        {
          $match: {
            search_mobile: {
              $regex: new RegExp(searchTerms),
              $options: "i",
            },
          },
        },
        {
          $project: {
            search_mobile: 0,
          },
        }
      );
    }

    const users = await Users.aggregate(pipeline);

    const data = users.map((item) => ({
      userid: item._id,
      mobile: item.mobile,
      created_at: item.created_at,
    }));

    res.status(200).json({
      data: data,
      message: "success",
      success: true,
      response: 1,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getloginuser = async function (req, res) {
  try {
    const userid = req.user._id;
    const user = await Users.find({ _id: userid });
    const data = user.map((item) => ({
      userid: item._id,
      mobile: item.mobile,
      email: item.email,
    }));
    res.status(200).json({
      data: data,
      message: "success",
      success: true,
      response: 1,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// const fineUserFromUrl = async (req, res) => {
//   const input = req.query;
//   try {
//     const data = await Users.findOne({ _id: input.userid });
//     res.status(200).json({
//       data: data,
//       message: "Users exists.",
//       response: 1,
//       success: true,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };

const fineUserFromUrl = async (req, res) => {
  const input = req.query; // Assuming userid is sent as query parameter
  try {
    const data = await Users.findOne({ _id: input.userid });
    if (data) {
      res.status(200).json({
        data: data,
        message: "User exists.",
        response: 1,
        success: true,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const MessageSeenAndUnseen = async (req, res) => {
  const user = req.user._id;
  const input = req.body;
  console.log(user);
  try {
    const MessageUpdate = await chatApp.updateMany(
      { sender: input.senderId, "users.1": user, status: 0 },
      { $set: { status: 1 } }
    );
    if (MessageUpdate) {
      res.send("Message Status Update Successfully");
    } else {
      res.send("No messages were updated");
    }
  } catch (error) {
    console.error("Error updating message status:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const bonusRecord = async (req, res) => {
  try {
    const { page, pagerow } = req.body;
    const offset = (page - 1) * pagerow;
    const levelData = await BonusSummary.aggregate([
      {
        $match: { laveluser: new mongoose.Types.ObjectId(req.user._id) },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userid',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: '$userDetails',
      },
      {
        $project: {
          amount: 1,
          created_at: 1,
          mobile: '$userDetails.mobile',
        },
      },
      { $skip: offset },
      { $limit: pagerow },
      { $sort: { created_at: -1 } },
    ]);
    const totalRecords = await BonusSummary.countDocuments({ laveluser: new mongoose.Types.ObjectId(req.user._id) });

    const successResponse = {
      success: true,
      message: 'Success',
      data: levelData,
      total: totalRecords,
    };

    return res.json(successResponse);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
const applyRecord = async (req, res) => {
  try {
    const { page, pagerow } = req.body;
    const offset = (page - 1) * pagerow;
    const limit = pagerow;
    const leveldata = await BonusSummary.aggregate([
      {
        $match: {
          laveluser: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userid',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $unwind: '$userInfo',
      },
      {
        $project: {
          amount: 1,
          created_at: 1,
          mobile: '$userInfo.mobile',
        },
      },
      {
        $skip: offset,
      },
      {
        $limit: limit,
      },
      {
        $sort: { createdate: -1 },
      },
    ]);

    const total = await BonusSummary.countDocuments({
      laveluser: new mongoose.Types.ObjectId(req.user._id),
    });
    res.json({
      success: true,
      message: 'Success',
      data: leveldata,
      total,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
const addRedEnvelope = async (req, res) => {
  try {
    const id = req.user._id;
    const { amount, password } = req.body;
    const user = await Users.findById(id);
    if (user.red_envelope === false) {
      return res.status(200).json({
        success: false,
        message: 'You are not eligible to add a red envelope at this time.',
      });
    }
    const wallet = await Wallet.findOne({ userid: id })
    if (wallet.amount < amount) {
      return res.status(400).json({
        success: false,
        message: 'Low Balence',
      })
    }
    wallet.amount -= Number(amount);
    wallet.save();
    if (user.password != password) {
      return res.status(400).json({
        success: false,
        message: 'password does not match',
      })
    }
    const walletsummerdata = {
      userid: id,
      orderid: null,
      amount: amount,
      wallet: wallet.amount,
      type: "debit",
      actiontype: "envelope",
    };
    await walletsummery.create(walletsummerdata);
    const numbers = '123456789';
    const characters = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomString = numbers.charAt(Math.floor(Math.random() * numbers.length));
    for (let i = 0; i < 8; i++) {
      randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const uniqueId = randomString;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1);
    await RedEnvelope.create({
      name: 'New Red Envelope',
      code: uniqueId.toLocaleLowerCase(),
      distributed_amount: amount,
      type: 'lucky',
      status: 1,
      created_by: id,
      expiry_date: expiryDate,
    });
    res.status(200).json({
      success: true,
      message: 'red envelop add successfully',
    })
  } catch (error) {
    console.log("Error", error)
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
const getRedEnvolop = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }
    const page = req.query.page;
    const pagerow = req.query.pagerow;
    const offset = (page - 1) * pagerow;

    const redEnvelope = await RedEnvelope.find({ created_by: new mongoose.Types.ObjectId(userId) })
      .skip(offset)
      .limit(pagerow)
      .sort({ _id: -1 });

    const totalRecords = await RedEnvelope.countDocuments({ created_by: new mongoose.Types.ObjectId(userId) });

    res.status(200).json({
      success: true,
      message: 'Success',
      data: redEnvelope,
      page: page,
      pagerow: pagerow,
      total: totalRecords,
    })
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
const getEnvelope = async (req, res) => {
  try {
    const userId = req.user._id;
    const id = req.params.id;
    const { Continue } = req.query;
    const envelope = await RedEnvelope.findOne({ code: id });
    if (!envelope) {
      return res.status(400).json({ success: false, message: 'Envelope not found' });
    }

    if (Number(envelope.status) !== 1) {
      return res.status(400).json({ success: false, message: 'Envelope is not valid or already used' });
    }
    if (Continue === 'true') {
      const wallet = await Wallet.findOne({ userid: userId });
      if (!wallet) {
        return res.status(400).json({ success: false, message: 'Wallet not found' });
      }
      wallet.amount += Number(envelope.distributed_amount);
      await wallet.save();

      const orderId = `${Date.now()}${Math.floor(Math.random() * 1000000)}${userId}`;
      await walletsummery.create({
        userid: userId,
        amount: envelope.distributed_amount,
        orderid: orderId,
        type: 'credit',
        wallet: wallet.amount,
        actiontype: 'envelope',
      });

      envelope.status = 0;
      await envelope.save();

      return res.status(200).json({
        success: true,
        message: 'Envelope processed successfully',
        data: { amount: envelope.distributed_amount },
      });
    }

    // If "Continue" is not passed, just return the envelope details
    return res.status(200).json({
      success: true,
      message: 'Envelope fetched successfully',
      data: { amount: envelope.distributed_amount },
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};
const getTelegramLink = async (req, res) => {
  try {
    const telegram_link = await paymentsetting.findOne().select('telegram_link');
    return res.status(200).json({
      success: true,
      message: 'Success',
      data: telegram_link,
    })
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
const getQrCodeImg = async (req, res) => {
  try {
    const item = await paymentsetting.findOne().select('qr_code');
    return res.status(200).json({
      success: true,
      message: 'Success',
      data: `${process.env.IMAGE_URL}/images/${item.qr_code}`,
    })
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
const getMinimumRechargeAmount = async (req, res) => {
  try {
    const item = await paymentsetting.findOne().select('minimum_recharge_amount usdt_rate');
    return res.status(200).json({
      success: true,
      message: 'Success',
      data: item,
    })
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  dashbord: dashbord,
  noticationdata: noticationdata,
  minedashbord: minedashbord,
  getupi: getupi,
  recharge: recharge,
  rechargerecord: rechargerecord,
  newaddbankdetail: newaddbankdetail,
  getbankdetail: getbankdetail,
  getBankDetailByUser: getBankDetailByUser,
  rewardrecord: rewardrecord,
  interestrecord: interestrecord,
  withdrawal: withdrawal,
  transactions: transactions,
  newCryptoAddress: newCryptoAddress,
  addcryptodetail: addcryptodetail,
  getCryptoDetail: getCryptoDetail,
  addcomplaints: addcomplaints,
  waitcomplaints: waitcomplaints,
  complitcomplaints: complitcomplaints,
  wintransactions: wintransactions,
  address: address,
  getaddress: getaddress,
  transferWalletAmount: transferWalletAmount,
  myTeemLevelOfUsers: myTeemLevelOfUsers,
  promotiondashbordnew: promotiondashbordnew,
  getPromotionLink: getPromotionLink,
  getattendance: getattendance,
  Attendance: Attendance,
  singalcomplaints: singalcomplaints,
  trend: trend,
  deleteAddress: deleteAddress,
  withdrawalRecord: withdrawalRecord,
  getAllChatAppListUsers: getAllChatAppListUsers,
  addMessage: addMessage,
  AllMessageGet: AllMessageGet,
  getAllUser: getAllUser,
  getAllUserwithsearch: getAllUserwithsearch,
  getloginuser: getloginuser,
  fineUserFromUrl: fineUserFromUrl,
  MessageSeenAndUnseen: MessageSeenAndUnseen,
  bonusRecord: bonusRecord,
  applyRecord: applyRecord,
  addRedEnvelope: addRedEnvelope,
  getRedEnvolop: getRedEnvolop,
  getEnvelope: getEnvelope,
  getTelegramLink: getTelegramLink,
  getQrCodeImg: getQrCodeImg,
  getMinimumRechargeAmount: getMinimumRechargeAmount,
  editBankDetail: editBankDetail,
  deleteBankDetail: deleteBankDetail,
};
