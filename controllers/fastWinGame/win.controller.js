const { catchBlock } = require("../../helpers/utils.helper");
const fastWinResult = require("../../models/fastWinResult");
const fastWinPeriodIdModel = require("../../models/fastWinPeriodid");
const fastGameBetting = require("../../models/fastGameBetting");
const fastWinUserResult = require("../../models/fastWinUserResult");
const users = require("../../models/user");
const levelUser = require("../../models/lavelusers");
const Wallet = require("../../models/wallet");
const walletSummery = require("../../models/walletsummery");
const fastWinOrder = require("../../models/fastWinOrder");
const { ObjectId } = require("mongodb");

const getFastWinGameResultByCategory = async (req, res) => {
    try{
       const { page = 1, pageRow = 10, category } = req.query;
       const fastWinResults = await fastWinResult.find({ tabtype: category })
           .sort({ periodid: -1 })
           .skip((page - 1) * pageRow)
           .limit(parseInt(pageRow));
       const totalResults = await fastWinResult.countDocuments({ tabtype: category });
        let data = fastWinResults.map((value) => ({
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
        
       return res.status(200).json({
              data: data,
              currentPage: parseInt(page),
              totalPages: Math.ceil(totalResults / pageRow),
              totalResults: totalResults
         });
    }catch(error){
        catchBlock(error, res);
    }
};
module.exports.getFastWinGameResultByCategory = getFastWinGameResultByCategory;

const getFastWinUserResults = async (req, res) => {
    try {
        var user = req.user;
        var input = req?.body;
        var page = parseInt(input?.page) || 1;
        var pagerow = parseInt(input?.pagerow) || 10;
        var category = input?.category;
        var periodid = input?.periodid;
        var skip = (page - 1) * pagerow;

        let currentPeriodId = await fastWinPeriodIdModel.findOne().sort({ _id: -1 }).limit(1);
        const bettingQuery = {
            userid: user._id,
            created_at: { $gte: new Date().setHours(0, 0, 0, 0) },
            tab: category,
            periodid: currentPeriodId?.gameid,
        };
        const result = await fastGameBetting.find(bettingQuery).skip(skip).limit(pagerow);
        const result1 = await fastGameBetting.find(bettingQuery);

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
        const resultCount = await fastGameBetting.countDocuments(bettingQuery);
        var UserResults = [];
        if (k != 0) {
            UserResults = await fastWinUserResult.aggregate([
                {
                    $match: { userid: new ObjectId(user._id) },
                },
                {
                    $lookup: {
                        from: "fastwinresults",
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
        const total = await fastWinUserResult.aggregate([
            {
                $match: { userid: new ObjectId(user._id) },
            },
            {
                $lookup: {
                    from: "fastwinresults",
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
        return res.status(200).send(success);
    } catch (error) {
        return catchBlock(res, error);
    }
};
module.exports.getFastWinUserResults = getFastWinUserResults;

const fastWinGamePeriodId = async function (req, res) {
    try {
        const game_id = await fastWinPeriodIdModel.findOne().sort({ _id: -1 }).limit(1);
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
module.exports.fastWinGamePeriodId = fastWinGamePeriodId;

const bate = async function (req, res) {
    try {
        const user = req.user;
        const input = req.body;
        if (input.counter < 3)
            return res.status(200).json({ success: false, message: "Time Out" });

        if (input.finalamount < 1)
            return res.status(200).json({ success: false, message: "Amount is not valid" });

        const [getUserDetails, wallet] = await Promise.all([
            users.findById(user._id),
            Wallet.findOne({ userid: user._id }),
        ]);

        if (!getUserDetails)
            return res.status(404).json({ success: false, message: "User not found" });

        if (getUserDetails.play === 1)
            return res.status(200).json({
                success: false,
                message: "Network Unavailable",
                response: 0,
            });

        if (!wallet || wallet.amount < input.finalamount)
            return res.status(200).json({
                success: false,
                message: "Your balance is insufficient",
            });

        let levelUsers = [];
        if (getUserDetails.code) {
            const level1 = await users.findOne({ owncode: getUserDetails.code });
            const level2 = level1 ? await users.findOne({ owncode: level1.code }) : null;
            const level3 = level2 ? await users.findOne({ owncode: level2.code }) : null;
            levelUsers = [level1, level2, level3].filter(Boolean);
        }

        const levels = await levelUser.find({ lavel_id: { $in: [1, 2, 3] } });
        const levelPercentages = levels.reduce(
            (acc, l) => ({ ...acc, [l.lavel_id]: l.percentage }),
            { 1: 30, 2: 20, 3: 10 } 
        );
        const updatedWallet = await Wallet.findOneAndUpdate(
            { userid: user._id, amount: { $gte: input.finalamount } },
            { $inc: { amount: -input.finalamount } },
            { new: true }
        );

        if (!updatedWallet)
            return res.status(200).json({
                success: false,
                message: "Insufficient balance (update failed)",
            });

        const tranorderid = `${Date.now()}${Math.random().toString(36).slice(2)}${user._id}`;

        const [betData] = await Promise.all([
            fastGameBetting.create({
                userid: user._id,
                periodid: input.inputgameid,
                type: input.type,
                value: input.value,
                amount: input.finalamount,
                tab: input.tab,
            }),
            fastWinOrder.create({
                userid: user._id,
                tranorderid,
                amount: input.finalamount,
                status: true,
            }),
            walletSummery.create({
                userid: user._id,
                orderid: tranorderid,
                amount: input.finalamount,
                type: "debit",
                wallet: updatedWallet.amount,
                actiontype: "join",
            }),
        ]);

        const baseBonus = (input.finalamount * 5) / 100;

        await Promise.all(
            levelUsers.map(async (refUser, i) => {
                const level = i + 1;
                const percentage = levelPercentages[level];
                const bonusAmount = (baseBonus * percentage) / 100;

                const updated = await Wallet.findOneAndUpdate(
                    { userid: refUser._id },
                    { $inc: { amount: bonusAmount } },
                    { new: true }
                );

                if (updated) {
                    await walletSummery.create({
                        userid: refUser._id,
                        orderid: "-",
                        amount: bonusAmount,
                        sender_id: user._id,
                        type: "credit",
                        wallet: updated.amount,
                        actiontype: "bonus",
                    });
                }
            })
        );

        return res.status(200).json({
            data: betData,
            success: true,
            message: "success",
        });
    } catch (error) {
        return catchBlock(res, error);
    }
};
module.exports.bate = bate;


const fastWinOrderList = async function (req, res) {
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
        let currentPeriodId = await fastWinPeriodIdModel.findOne().sort({ _id: -1 }).limit(1);
        console.log("currentPeriodId", periodid);
        const resultQuery = {
            userid: user._id,
            created_at: { $gte: new Date().setHours(0, 0, 0, 0) },
            tab: category,
            periodid: currentPeriodId?.gameid,
            ...query,
        };
        const [result, resultCount, userResults] = await Promise.all([
            fastGameBetting.find(resultQuery).skip(skip).limit(pagerow),
            fastGameBetting.countDocuments(resultQuery),
            fastWinUserResult.aggregate([
                { $match: { userid: new ObjectId(user._id), ...query } },
                {
                    $lookup: {
                        from: "fastwinresults",
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
        const userResultsCount = await fastWinUserResult.countDocuments({ userid: new ObjectId(user._id), ...query });
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
        return catchBlock(res, error);
    }
};
module.exports.fastWinOrderList = fastWinOrderList;


const fastWinTrend = async function (req, res) {
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

        const results = await fastWinResult.find({
            tabtype: category,
            created_at: { $gte: currentDate, $lt: nextDate },
        })
            .sort({ _id: -1 })
            .exec();

        let greencount = await fastWinResult.countDocuments({
            tabtype: category,
            randomcolor: { $in: ["green", "green++violet"] },
            resulttype: { $in: ["random", "real"] },
            created_at: { $gte: currentDate, $lt: nextDate },
        });

        let redcount = await fastWinResult.countDocuments({
            tabtype: category,
            randomcolor: { $in: ["red", "red++violet"] },
            resulttype: { $in: ["random", "real"] },
            created_at: { $gte: currentDate, $lt: nextDate },
        });

        let violetcount = await fastWinResult.countDocuments({
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
module.exports.fastWinTrend = fastWinTrend;