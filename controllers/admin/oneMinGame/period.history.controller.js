const oneMinBetting = require("../../../models/oneMinBetting.model");
const oneMinUserResult = require("../../../models/oneMinUserResult.model");
const oneMinPeriodId = require("../../../models/oneMinPeriodId.model");

const oneMinPeriodHistory = async (req, res) => {
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
            oneMinPeriodId.find(query)
                .sort({ gameid: -1 })
                .skip(skip)
                .limit(pagerow)
                .select("gameid createdAt")
                .lean(),
            oneMinPeriodId.countDocuments(query),
        ]);

        const gameIds = games.map((g) => g.gameid);

        const [betResults, winResults] = await Promise.all([
            oneMinBetting.aggregate([
                { $match: { periodid: { $in: gameIds } } },
                { $group: { _id: "$periodid", total: { $sum: "$amount" } } },
            ]),
            oneMinUserResult.aggregate([
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
module.exports.oneMinPeriodHistory = oneMinPeriodHistory;

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
                    from: "oneminuserresults",
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
        const result = await oneMinBetting.aggregate(pipeline);
        let totalDocumentsCount = 0;
        if (countQuery) {
            countQuery.push({
                $count: "count",
            });
            let countData = await oneMinBetting.aggregate(countQuery);
            if (countData?.length) {
                totalDocumentsCount = countData[0]?.count;
            }
        } else {
            totalDocumentsCount = await oneMinBetting.countDocuments({ periodid: gameid });
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