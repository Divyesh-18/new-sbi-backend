const moment = require("moment");
require("dotenv").config();
const { StatusCodes } = require("http-status-codes");
const { responseStatus } = require("../config/config");
const { catchBlock } = require("../helpers/utils.helper");
const helper = require("../helpers/utils.helper");
const Users = require("../models/user");
const Wallet = require("../models/wallet");
const Walletsummery = require("../models/walletsummery");
const FreeWalletHistory = require("../models/freewallethistory");
const Bonus = require("../models/Bonus");
const Attendance = require("../models/attendance");
const Otp = require("../models/otp");
const yup = require("yup");
const { required } = require("joi");
const nodemailer = require("nodemailer");
const paymentsetting = require("../models/paymentsetting");

//** Login with Email */
const login = async function (req, res) {
  try {
    const Userdata = await Users.findOne({
      mobile: req.body.mobile,
      password: req.body.password,
      status: true,
    });
    //console.log(Userdata)
    if (Userdata) {
      token = await Userdata.genereteAuthToken();
      const user = await Users.updateOne(
        { _id: Userdata._id },
        { active: true }
      );
      if (!user) {
        res.status(200).send({
          message: "User Not Found",
          response: 0,
          success: false,
        });
      }
      res.status(200).send({
        message: "success",
        response: 1,
        success: true,
        token: token,
      });
    } else {
      res.status(200).send({
        message: "crudational not mached",
        response: 0,
        success: false,
      });
    }
  } catch (error) {
    res.status(200).send({
      message: error,
      response: 0,
      success: false,
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    const user = req.user;
    console.log("req.users", user._id);
    await Users.findByIdAndUpdate(
      user._id,
      {
        $set: {
          tokens: undefined,
          active: false,
        },
      },
      {
        new: true,
      }
    );
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .json(200, "User logout successfully");
  } catch (error) {
    res.status(500).send({
      message: error.message,
      response: 0,
      success: false,
    });
  }
};

//register
const register = async function (req, res) {
  try {
    const Userdata = await Users.findOne({
      $or: [
        { mobile: parseInt(req.body.mobile_number) },
        // { email: req.body.email.toString() },
      ],
    });

    if (Userdata) {
      return res.status(200).send({
        message: "This User Allready Registerd !",
        response: 0,
        success: false,
      });
    }
    const GetOtpdata = await Otp.countDocuments({
      mobile_number: parseInt(req.body.mobile_number),
      email: req.body.email || '',
      otp: req.body.otp.toString(),
    });
    if (GetOtpdata > 0) {
      if (req.body.ref_code != null) {
        const Userdata = await Users.countDocuments({
          owncode: req.body.ref_code,
        });
        if (Userdata == 0) {
          return res.status(200).send({
            message: "Ref Code Not Mached",
            response: 0,
            success: false,
          });
        }
      }

      await helper.otpDelete(
        req.body.mobile_number,
        // req.body.email
      );
      let loginId = await paymentsetting.findOne().select("autoLoginId");
      const RegisterData = {
        mobile: req.body.mobile_number,
        country_code: req.body.selectedRegMobile,
        email: req.body.email || '',
        loginId: parseInt(loginId.autoLoginId),
        password: req.body.password,
        status: 1,
        active: false,
        play: false,
        code: req.body.ref_code,
        owncode: await helper.refcode(),
      };
      let Userdata = null;
      try {
        Userdata = await Users.create(RegisterData);
        loginId.autoLoginId = parseInt(loginId.autoLoginId) + 1;
        loginId.save();
      } catch (error) {
        console.log("error:-----------", error);
        return res.status(200).send({
          message: error,
          response: 0,
          success: false,
        });
      }

      if (Userdata != null) {
        // add wallet
        let Walletdata = null;
        try {
          const singbonus = await paymentsetting.findOne();
          Walletdata = await Wallet.create({
            userid: Userdata._id,
            amount: singbonus.signupbonusamount,
            free_amount: 0,
            win_amount: 0,
            envelopestatus: 0,
          });
        } catch (error) {
          console.log(error);
          return res.status(200).send({
            message: error,
            response: 0,
            success: false,
          });
        }

        // add summray
        let Walletsummerydata = null;
        try {
          const singbonus1 = await paymentsetting.findOne();
          Walletsummerydata = await Walletsummery.create({
            userid: Userdata._id,
            amount: singbonus1.signupbonusamount,
            type: "credit",
            actiontype: "register-bonus",
          });
        } catch (error) {
          console.log(error);
          return res.status(200).send({
            message: error,
            response: 0,
            success: false,
          });
        }

        // add Attendance
        let Attendancedata = null;
        try {
          Attendancedata = await Attendance.create({
            userid: Userdata._id,
            total_days: 0,
            today_rebates: 5,
            total_rebates: 5,
          });
        } catch (error) {
          console.log(error);
          return res.status(200).send({
            message: error,
            response: 0,
            success: false,
          });
        }

        // add Bonus
        let Bonusdata = null;
        try {
          Bonusdata = await Bonus.create({
            userid: Userdata._id,
            amount: 0,
          });
        } catch (error) {
          console.log(error);
          return res.status(200).send({
            message: error,
            response: 0,
            success: false,
          });
        }

        if (req.body.ref_code != null) {
          try {
            await helper.reward(req.body.ref_code, Userdata._id, 100);
          } catch (error) {
            console.log(error);
          }
        }

        return res.status(200).send({
          message: "success",
          response: 1,
          success: true,
          status: "success",
        });
      }
    } else {
      res.status(200).send({
        message: "Verification Code is false",
        response: 0,
        success: false,
      });
    }
  } catch (error) {
    console.log("Error :---", error)
    res.status(200).send({
      message: "hello",
      response: 0,
      success: false,
    });
  }
};

const sendOtp = async function (req, res) {
  try {
    var sendotp = Math.floor(100000 + Math.random() * 900000);

    // var message =
    // "Dear Customer, Your verification code is " +
    // sendotp +
    // " Please do not share it with anyone. CSPL";

    var message = "Your One Time Password is " + sendotp + ". Thanks SMSINDIAHUB";


    isOtpSend = await helper.sendOtp(sendotp, req.body.mobile_number, res);
    console.log(isOtpSend);
    if (isOtpSend) {
      const GetOtpdata = await Otp.countDocuments({
        mobile_number: req.body.mobile_number,
        email: req.body.email,
      });
      if (GetOtpdata > 0) {
        Otp.updateOne(
          { mobile_number: req.body.mobile_number, email: req.body.email }, // Filter
          { otp: sendotp } // Update
        )
          .then((obj) => {
            res.status(200).send({
              message: "success",
              response: 1,
              success: true,
            });
          })
          .catch((err) => {
            res.status(200).send({
              message: err,
              response: 0,
              success: false,
            });
            console.log("Error: " + err);
          });
      } else {
        try {
          const Otpdata = new Otp({
            mobile_number: req.body.mobile_number,
            email: req.body.email,
            otp: sendotp,
          });

          Otpdata.save()
            .then(() => {
              res.status(200).send({
                message: "success",
                response: 1,
                success: true,
              });
            })
            .catch((err) => {
              console.log(err);
              res.status(200).send({
                message: err,
                response: 0,
                success: false,
              });
            });
        } catch (error) {
          res.status(200).send({
            message: error,
            response: 0,
            success: false,
          });
        }
      }
    }
  } catch (error) {
    res.status(200).send({
      message: error,
      response: 0,
      success: false,
    });
  }
};

//forgotpassword
const ForgotPassword = async function (req, res) {
  try {
    const { mobile_number, email, otp, new_password } = req.body;
    const isOTPVaild = await Otp.countDocuments({ mobile_number, otp });

    if (isOTPVaild > 0) {
      const user = await Users.findOne({ mobile: mobile_number });

      if (user) {
        user.password = new_password;
        await user.save();

        await Otp.deleteOne({ mobile_number, otp });

        return res.status(200).send({
          message: "password reset successfully",
          response: 1,
          success: true,
        });
      } else {
        return res.status(200).send({
          message: "user not found",
          response: 0,
          success: false,
        });
      }
    } else {
      return res.status(200).send({
        message: "invalid otp",
        response: 0,
        success: false,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
      response: 0,
      success: false,
    });
  }
};

const sendOtpEmail = async function (req, res) {
  try {
    const sendOtp = Math.floor(100000 + Math.random() * 900000);

    const message = `Dear Customer, Your verification code is ${sendOtp}. Please do not share it with anyone. CSPL`;

    const input = req.body;

    const email = new Otp({
      mobile_number: input.mobile_number,
      email: input.email,
      otp: sendOtp,
    });
    //console.log(email)
    await email.save();

    const transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    //	console.log(message)
    const mailOptions = {
      from: "meghnathidivyesh92@gmail.com",
      to: input.email,
      subject: "Sending Email using Node.js",
      text: message,
    };
    //send mail
    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email has been send");
      }
    });
    //	console.log(mailOptions)
    res.status(200).json({
      message: "OTP sent successfully on email",
      response: 1,
      success: true,
    });
  } catch (error) {
    console.error("Error: " + error);
    res.status(500).send({
      message: error.message || "Internal Server Error",
      response: 0,
      success: false,
    });
  }
};

const getColorCode = async (req, res) => {
  try {
    const colorCode = await paymentsetting.findOne().select("theme_color");
    return res.status(200).json({
      success: true,
      message: "Get theme color code",
      data: colorCode,
    })
  } catch (error) {
    res.status(500).send({
      message: error.message || "Internal Server Error",
      response: 0,
      success: false,
    });
  }
};
const getApkLink = async (req, res) => {
  try {
    const item = await paymentsetting.findOne().select('apk');
    return res.status(200).json({
      success: true,
      message: "Get APK Link",
      data: `${process.env.IMAGE_URL}/${item.apk}`,
    });

  } catch (error) {
    res.status(500).send({
      message: error.message || "Internal Server Error",
      response: 0,
      success: false,
    });
  }
}
module.exports = {
  login: login,
  register: register,
  sendOtp: sendOtp,
  forgotpassword: ForgotPassword,
  sendOtpEmail: sendOtpEmail,
  logoutUser: logoutUser,
  getColorCode: getColorCode,
  getApkLink: getApkLink,
};

// var transport = nodemailer.createTransport({
// 	host: "sandbox.smtp.mailtrap.io",
// 	port: 2525,
// 	auth: {
// 		user: "d18562dd34dc11",
// 		pass: "d07e188039ae0e",
// 	},
// })
