const { catchBlock } = require("../../helpers/utils.helper");

const oneMinUserResult = require("../../models/oneMinUserResult.model");
const users = require("../../models/user");
const levelUser = require("../../models/lavelusers");
const oneMinOrder = require("../../models/oneMinOrder.model");
const Wallet = require("../../models/wallet");
const walletSummery = require("../../models/walletsummery");
const oneMinResult  = require("../../models/oneMinResult.model");
const oneMinPeriodModule  = require("../../models/oneMinPeriodId.model");
const oneMinBetting  = require("../../models/oneMinBetting.model");
var ObjectId = require("mongoose").Types.ObjectId;

const getOneMinResultByCategory = async function (req, res) {
    try {
        let { page, pageRow, category } = req.query;
        page = parseInt(page || 1);
        pageRow = parseInt(pageRow || 10);
        const skip = (page - 1) * pageRow;

        const result = await oneMinResult.find({
            tabtype: category,
        })
            .sort({ _id: -1 })
            .skip(skip)
            .limit(pageRow);

        let data = result.map((value) => ({
            id: value?._id,
            periodid: value?.periodid,
            price: value?.price,
            randomprice: value?.randomprice,
            randomresult:
                value?.resulttype == "real" ? value?.result : value?.randomresult,
            randomcolor: value?.resulttype == "real" ? value?.color : value?.randomcolor,
            resulttype: value?.resulttype,
            tabtype: value?.tabtype,
        }));

        const total = await oneMinResult.countDocuments({ tabtype: category });

        return res.status(200).json({
            data: data,
            message: "success",
            response: 1,
            success: true,
            total: total,
        });
    } catch (error) {
         console.log("error",error);
         return catchBlock(res, error);
    }
};
module.exports.getOneMinResultByCategory = getOneMinResultByCategory;

const getOneMinUserResult = async function (req, res) {
    try {
        var user = req.user;
        var input = req?.body;
        var page = parseInt(input?.page) || 1;
        var pagerow = parseInt(input?.pagerow) || 10;
        var category = input?.category;
        var periodid = input?.periodid;
        var skip = (page - 1) * pagerow;

        let currentPeriodId = await oneMinPeriodModule.findOne().sort({ _id: -1 }).limit(1);
        const bettingQuery = {
            userid: user._id,
            created_at: { $gte: new Date().setHours(0, 0, 0, 0) },
            tab: category,
            periodid: periodid ? periodid : currentPeriodId?.gameid,
        };
        const result = await oneMinBetting.find(bettingQuery).skip(skip).limit(pagerow);
        const result1 = await oneMinBetting.find(bettingQuery);

        // skip = (page > 0) ?   : (page - 1) * pagerow - result.length;
        let k = pagerow - result.length;
        let q = result1.length / pagerow;
        let t = page - Math.floor(q);
        t = t - 1;
        let c = Math.round(Math.abs(t * pagerow));
        if (q % 1 !== 0) {
            c = Math.round(Math.abs(c - (q % 1)));
        }

        // return true;
        const resultCount = await oneMinBetting.countDocuments(bettingQuery);
        var UserResults = [];
        if (k != 0) {
            UserResults = await oneMinUserResult.aggregate([
                {
                    $match: { userid: new ObjectId(user._id) },
                },
                {
                    $lookup: {
                        from: "oneminresults",
                        localField: "periodid",
                        foreignField: "periodid",
                        as: "Result",
                    },
                },
            ])
                .sort({ _id: -1 })
                .skip(c)
                .limit(k);
        }

        const total = await oneMinUserResult.aggregate([
            {
                $match: { userid: new ObjectId(user._id) },
            },
            {
                $lookup: {
                    from: "oneminresults",
                    localField: "periodid",
                    foreignField: "periodid",
                    as: "Result",
                },
            },
        ]);

        const data = [];
        for (const value of UserResults) {
            const item = {
                id: value?._id,
                periodid: value?.periodid,
                contract_money: value?.amount,
                contract_count: "1",
                delivery: value?.paidamount.toFixed(2),
                fee: value?.fee.toFixed(2),
                open_price: value?.openprice,
                select: value?.value,
                status: value?.status ? "success" : "Fail",
                amount: value?.paidamount.toFixed(2),
                created_at: value?.createdAt,
                type: value?.tab,
                result_number:
                    value?.Result[0]?.resulttype == "real"
                        ? value?.Result[0]?.result
                        : value?.Result[0]?.randomresult,
                result_color:
                    value?.Result[0]?.resulttype == "real"
                        ? value?.Result[0]?.color
                        : value?.Result[0]?.randomcolor,
            };
            data.push(item);
        }
        const totalDocumentsCount = total.length + resultCount;
        const success = {
            message: "Success",
            response: 1,
            success: true,
            currentpage: page,
            total: totalDocumentsCount,
            totalPages: Math.ceil(totalDocumentsCount / pagerow),
            waitlist: result,
            data: data,
        };
        console.log("success", success.waitlist);
        return res.status(200).send(success);
    } catch (error) {
         console.log("Error:-", error);
         return catchBlock(res,error);
    }
};
module.exports.getOneMinUserResult = getOneMinUserResult;

const getOneMinPeriodId = async function (req, res) {
    try {
        const game_id = await oneMinPeriodModule.findOne().sort({ _id: -1 }).limit(1);
        return res.status(200).json({
            data: game_id,
            message: "success",
            response: 1,
            success: true,
        });
    } catch (error) {
        return catchBlock(res, error);
    }
};
module.exports.getOneMinPeriodId = getOneMinPeriodId;

const bate = async function (req, res) {
    try {
        const user = req.user;
        const input = req?.body;
        const check = await users.countDocuments({
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
        const getUserDetails = await users.findById(user._id);
        if (!getUserDetails) {
            return res.status(404).json({ message: "User not found" });
        }
        const userCompleteRechargeDetails = getUserDetails?.code;
        if (userCompleteRechargeDetails) {
            const level1User = await users.findOne({ owncode: userCompleteRechargeDetails });
            if (level1User) {
                const level2User = await users.findOne({ owncode: level1User.code });
                const level3User = level2User
                    ? await users.findOne({ owncode: level2User.code })
                    : null;
                const levels = await levelUser.find({ lavel_id: { $in: [1, 2, 3] } });
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

                        await walletSummery.create({
                            userid: referralUser._id,
                            orderid: '-',
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

                    const data = await oneMinBetting.create({
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

                    await oneMinOrder.create({
                        userid: user._id,
                        tranorderid: tranorderid,
                        amount: input?.finalamount,
                        status: true,
                    });

                    await walletSummery.create({
                        userid: user._id,
                        orderid: tranorderid,
                        amount: input?.finalamount,
                        type: "debit",
                        wallet: walt.amount,
                        actiontype: "join",
                    });
                    return res.status(200).json({
                        data: data,
                        success: true,
                        message: "success",
                    });
                }
            }
        }
    } catch (error) {
        console.log("1 min user bate fail ==>", error);
        return catchBlock(res, error);
    }
};
module.exports.bate = bate;

const oneMinOrderList = async function (req, res) {
    try {
        const user = req?.user;
        const input = req?.body;

        const page = input?.page || 1;
        const pagerow = input?.pagerow || 10;
        const skip = (page - 1) * pagerow;
        const category = input?.category;
        const periodid = input?.periodid;
        const levelTab = input?.levelTab;

        const query = levelTab === 3 ? { status: false } : levelTab === 4 ? { status: true } : {};

        const resultQuery = {
            userid: user._id,
            created_at: { $gte: new Date().setHours(0, 0, 0, 0) },
            tab: category,
            periodid: periodid,
            ...query,
        };
        const [result, resultCount, userResults] = await Promise.all([
            oneMinBetting.find(resultQuery).skip(skip).limit(pagerow),
            oneMinBetting.countDocuments(resultQuery),
            oneMinUserResult.aggregate([
                { $match: { userid: new ObjectId(user._id), ...query } },
                {
                    $lookup: {
                        from: "oneminresults",
                        localField: "periodid",
                        foreignField: "periodid",
                        as: "Result",
                    },
                },
                { $sort: { _id: -1 } },
                { $skip: skip },
                { $limit: pagerow },
            ])
        ]);

        const orderlist = userResults.map((value) => ({
            id: value?._id,
            period: value?.periodid,
            contract_money: value?.amount,
            contract_count: "1",
            delivery: value?.paidamount?.toFixed(2) || "0.00",
            fee: value?.fee?.toFixed(2) || "0.00",
            open_price: value?.openprice,
            result_number: value?.Result[0]?.randomresult,
            result_color: value?.Result[0]?.randomcolor,
            select: value?.value,
            status: value?.status ? "success" : "Fail",
            amount: value?.paidamount?.toFixed(2) || "0.00",
            created_at: value?.createdAt,
            type: value?.tab,
        }));

        const data = {
            loss: userResults.some((value) => value.status === false),
            win: userResults.some((value) => value.status === true),
            wait: result.length > 0,
        };

        // Get the total count using a single query for optimized performance
        const userResultsCount = await oneMinUserResult.countDocuments({ userid: new ObjectId(user._id), ...query });
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
        console.log("error",error);
        return catchBlock(res, error);
    }
};
module.exports.oneMinOrderList = oneMinOrderList;

const oneMinTrend = async function (req, res) {
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

        const results = await oneMinResult.find({
            tabtype: category,
            created_at: { $gte: currentDate, $lt: nextDate },
        })
            .sort({ _id: -1 })
            .exec();

        let greencount = await oneMinResult.countDocuments({
            tabtype: category,
            randomcolor: { $in: ["green", "green++violet"] },
            resulttype: { $in: ["random", "real"] },
            created_at: { $gte: currentDate, $lt: nextDate },
        });

        let redcount = await oneMinResult.countDocuments({
            tabtype: category,
            randomcolor: { $in: ["red", "red++violet"] },
            resulttype: { $in: ["random", "real"] },
            created_at: { $gte: currentDate, $lt: nextDate },
        });

        let violetcount = await oneMinResult.countDocuments({
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

       return res.json({ success: true, response: 1, message: "Success", data });
    } catch (error) {
        return catchBlock(res, error);
    }
};
module.exports.oneMinTrend = oneMinTrend;