const oneMinPeriodId = require("../../../models/oneMinPeriodId.model");
const oneMinBetting = require("../../../models/oneMinBetting.model");
const oneMinManuallyResult = require("../../../models/oneMinManuallyResult.model");
const oneMinManuallyResultSwitch = require("../../../models/oneMinManuallyResultChange.model");

const { catchBlock, oneMinUserCount, oneMinUserArray, oneMinGameWinner } = require("../../../helpers/utils.helper");

const setResultGame = async function (req, res) {
    try {
        const game = await oneMinPeriodId.find();
        let lastGameId;
        const game_id = game.map((item) => item.gameid);
        if (game_id.length > 0) {
            lastGameId = game_id[game_id.length - 1];
        }
        const betting = await oneMinBetting.find({
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
            const Manualdata = await oneMinManuallyResult.find();
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
                    totalusernumber = await oneMinUserCount(periodid, tab, temparray);
                    totaluserArray = await oneMinUserArray(periodid, tab, temparray);
                    greentotal = await oneMinGameWinner(periodid, tab, "greenwinamount");
                    total =
                        greentotal +
                    (await oneMinGameWinner(
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
                    totalusernumber = await oneMinUserCount(periodid, tab, temparray);
                    totaluserArray = await oneMinUserArray(periodid, tab, temparray);
                    redtotal = await oneMinGameWinner(periodid, tab, "redwinamount");
                    total =
                        redtotal +
                    (await oneMinGameWinner(
                            periodid,
                            tab,
                            numbermappings[row.number] + "winamount"
                        ));
                } else if (row.number == 0) {
                    temparray = ["Red", "Violet", row.number];
                    totalusernumber = await oneMinUserCount(periodid, tab, temparray);
                    totaluserArray = await oneMinUserArray(periodid, tab, temparray);
                    redtotal = await oneMinGameWinner(
                        periodid,
                        tab,
                        "redwinamountwithviolet"
                    );
                    vtotal = await oneMinGameWinner(periodid, tab, "violetwinamount");
                    total =
                        redtotal +
                        vtotal +
                    (await oneMinGameWinner(
                            periodid,
                            tab,
                            numbermappings[row.number] + "winamount"
                        ));
                } else if (row.number == 5) {
                    temparray = ["Green", "Violet", row.number];
                    totalusernumber = await oneMinUserCount(periodid, tab, temparray);
                    totaluserArray = await oneMinUserArray(periodid, tab, temparray);
                    redtotal = await oneMinGameWinner(
                        periodid,
                        tab,
                        "greenwinamountwithviolet"
                    );
                    vtotal = await oneMinGameWinner(periodid, tab, "violetwinamount");
                    total =
                        redtotal +
                        vtotal +
                    (await oneMinGameWinner(
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
         return catchBlock(res , error);
    }
};
module.exports.setResultGame = setResultGame;

const selectResultNumber = async function (req, res) {
    const input = req.body;
    try {
        const data = await oneMinManuallyResult.find({ status: false });
        if (data.length === 0) {
            return res.status(404).json({ message: "No data found" });
        }
        await oneMinManuallyResult.updateMany(
            {},
            {
                $set: { status: false },
            }
        );

        await oneMinManuallyResult.updateOne(
            { number: input.number },
            {
                $set: { status: true },
            }
        );
        await oneMinManuallyResultSwitch.updateOne(
            {},
            {
                $set: { switch: "yes", tab: "parity" },
            }
        );

        const total = await oneMinManuallyResult.countDocuments({
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
        const game_id = await oneMinPeriodId.findOne().sort({ _id: -1 }).limit(1);
        console.log("/one/min/result", game_id);
        return res.status(200).json({
            data: game_id,
            message: "success",
            response: 1,
            success: true,
        });
    } catch (error) {
        console.log("error",error);
        return catchBlock(res, error);
    }
};
module.exports.getOneMinPeriodId = getOneMinPeriodId;