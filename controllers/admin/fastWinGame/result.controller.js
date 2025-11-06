const fastWinPeriod = require("../../../models/fastWinPeriodid");
const fastGameBetting = require("../../../models/fastGameBetting");
const fastWinManuallyResult = require("../../../models/fastWinManualResult");
const fastWinManualResultswitch = require("../../../models/fastWinManualResultswitchSchema");
const fastWinUserResult = require("../../../models/fastWinUserResult");

const { catchBlock, fastWinGameWinner, fastWinUserCount, fastWinUserArray } = require("../../../helpers/utils.helper");

const fastWinSetResultGame = async (req,res) =>{
    try {
        const game = await fastWinPeriod.find();
        let lastGameId;
        const game_id = game.map((item) => item.gameid);
        if (game_id.length > 0) {
            lastGameId = game_id[game_id.length - 1];
        }
        const betting = await fastGameBetting.find({
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
            const Manualdata = await fastWinManuallyResult.find();
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
                    totalusernumber = await fastWinUserCount(periodid, tab, temparray);
                    totaluserArray = await fastWinUserArray(periodid, tab, temparray);
                    greentotal = await fastWinGameWinner(periodid, tab, "greenwinamount");
                    total =
                        greentotal +
                    (await fastWinGameWinner(
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
                    totalusernumber = await fastWinUserCount(periodid, tab, temparray);
                    totaluserArray = await fastWinUserArray(periodid, tab, temparray);
                    redtotal = await fastWinGameWinner(periodid, tab, "redwinamount");
                    total =
                        redtotal +
                    (await fastWinGameWinner(
                            periodid,
                            tab,
                            numbermappings[row.number] + "winamount"
                        ));
                } else if (row.number == 0) {
                    temparray = ["Red", "Violet", row.number];
                    totalusernumber = await fastWinUserCount(periodid, tab, temparray);
                    totaluserArray = await fastWinUserArray(periodid, tab, temparray);
                    redtotal = await fastWinGameWinner(
                        periodid,
                        tab,
                        "redwinamountwithviolet"
                    );
                    vtotal = await fastWinGameWinner(periodid, tab, "violetwinamount");
                    total =
                        redtotal +
                        vtotal +
                    (await fastWinGameWinner(
                            periodid,
                            tab,
                            numbermappings[row.number] + "winamount"
                        ));
                } else if (row.number == 5) {
                    temparray = ["Green", "Violet", row.number];
                    totalusernumber = await fastWinUserCount(periodid, tab, temparray);
                    totaluserArray = await fastWinUserArray(periodid, tab, temparray);
                    redtotal = await fastWinGameWinner(
                        periodid,
                        tab,
                        "greenwinamountwithviolet"
                    );
                    vtotal = await fastWinGameWinner(periodid, tab, "violetwinamount");
                    total =
                        redtotal +
                        vtotal +
                    (await fastWinGameWinner(
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
        return catchBlock(res, error);
    }
};
module.exports.fastWinSetResultGame = fastWinSetResultGame;

const selectResultNumber = async function (req, res) {
    const input = req.body;
    try {
        const data = await fastWinManuallyResult.find({ status: false });
        if (data.length === 0) {
            return res.status(404).json({ message: "No data found" });
        }
        await fastWinManuallyResult.updateMany(
            {},
            {
                $set: { status: false },
            }
        );

        await fastWinManuallyResult.updateOne(
            { number: input.number },
            {
                $set: { status: true },
            }
        );
        await fastWinManualResultswitch.updateOne(
            {},
            {
                $set: { switch: "yes", tab: "parity" },
            }
        );

        const total = await fastWinManuallyResult.countDocuments({
            status: false,
        });

        return res.status(200).json({
            total: total,
            message: "Success",
            response: 1,
        });
    } catch (error) {
        return catchBlock(res, error);
    }
};
module.exports.selectResultNumber = selectResultNumber;

const getOneMinPeriodId = async function (req, res) {
    try {
        const game_id = await fastWinPeriod.findOne().sort({ _id: -1 }).limit(1);

        return res.status(200).json({
            data: game_id,
            message: "success",
            response: 1,
            success: true,
        });
    } catch (error) {
        console.log("error", error);
        return catchBlock(res, error);
    }
};
module.exports.getOneMinPeriodId = getOneMinPeriodId;

const fastWinPeriodHistory = async (req, res) => {
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
            fastWinPeriod.find(query)
                .sort({ gameid: -1 })
                .skip(skip)
                .limit(pagerow)
                .select("gameid createdAt")
                .lean(),
            fastWinPeriod.countDocuments(query),
        ]);

        const gameIds = games.map((g) => g.gameid);

        const [betResults, winResults] = await Promise.all([
            fastGameBetting.aggregate([
                { $match: { periodid: { $in: gameIds } } },
                { $group: { _id: "$periodid", total: { $sum: "$amount" } } },
            ]),
            fastWinUserResult.aggregate([
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
module.exports.fastWinPeriodHistory = fastWinPeriodHistory;

const periodIdWiseUserHistory = async function (req, res) {
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
                    from: "fastwinuserresults",
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
                    created_at: { $arrayElemAt: ["$user.created_at", 0] },
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
        const result = await fastGameBetting.aggregate(pipeline);
        let totalDocumentsCount = 0;
        if (countQuery) {
            countQuery.push({
                $count: "count",
            });
            let countData = await fastGameBetting.aggregate(countQuery);
            if (countData?.length) {
                totalDocumentsCount = countData[0]?.count;
            }
        } else {
            totalDocumentsCount = await fastGameBetting.countDocuments({ periodid: gameid });
        }
        return res.status(200).json({
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
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
module.exports.periodIdWiseUserHistory = periodIdWiseUserHistory;