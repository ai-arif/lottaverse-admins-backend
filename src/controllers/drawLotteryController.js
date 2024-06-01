const LotteryDraw = require('../models/lotteryDrawSchema');
const User = require('../models/userSchema');
const PurchaseHistory = require('../models/puchaseHistorySchema');
const Lottery = require('../models/lotterySchema');
const sendResponse = require('../utils/sendResponse');

function getDateBasedRandomIndex(max) {
    const now = new Date();
    return now.getMilliseconds() % max;
}

const createLotteryDraw = async (req, res) => {
    try {
        const { lotteryId } = req.body;
        const lottery = await Lottery.findOne({ lotteryID: lotteryId });

        if (!lottery) {
            throw new Error("Lottery not found.");
        }
        if (!lottery.isActive) {
            throw new Error("Lottery is not active.");
        }
        if (lottery.hasDraw) {
            return sendResponse(res, 400, 'Lottery has already been drawn');
        }

        const existingDraw = await LotteryDraw.findOne({ lotteryId });

        if (existingDraw) {
            throw new Error("Lottery has already been drawn.");
        }

        const leaders = await User.find({ payout: { $gt: 0 } }).sort({ payout: -1 }).limit(30);

        const purchaseHistories = await PurchaseHistory.find({ lotteryId }).populate('userId');

        let secondWinner = null;
        let thirdWinner = null;
        if (purchaseHistories.length > 0) {
            const secondWinnerIndex = getDateBasedRandomIndex(purchaseHistories.length);
            secondWinner = purchaseHistories[secondWinnerIndex];

            if (purchaseHistories.length > 1) {
                let thirdWinnerIndex;
                do {
                    thirdWinnerIndex = getDateBasedRandomIndex(purchaseHistories.length);
                } while (thirdWinnerIndex === secondWinnerIndex);
                thirdWinner = purchaseHistories[thirdWinnerIndex];
            }
        }

        const randomWinnersAggregation = await PurchaseHistory.aggregate([
            { $match: { lotteryId: lotteryId } },
            { $group: { _id: '$ticketId', userId: { $first: '$userId' } } },
            { $sample: { size: 1000 } }
        ]);

        const randomWinners = randomWinnersAggregation.map(item => ({
            ticketId: item._id,
            userId: item.userId
        }));

        const lotteryDraw = new LotteryDraw({
            lotteryId,
            leaders: leaders.map(leader => ({
                userId: leader._id,
                commission_sent: false,
                amount: null,
            })),
            secondWinner: secondWinner ? {
                userId: secondWinner.userId._id,
                commission_sent: false,
                ticketId: secondWinner.ticketId,
                ticketString: secondWinner.ticketString,
                amount: null
            } : null,
            thirdWinner: thirdWinner ? {
                userId: thirdWinner.userId._id,
                commission_sent: false,
                ticketId: thirdWinner.ticketId,
                ticketString: thirdWinner.ticketString,
                amount: null
            } : null,
            randomWinners: randomWinners.map(winner => ({
                userId: winner.userId,
                commission_sent: false,
                ticketId: winner.ticketId,
                ticketString: winner.ticketString,
                amount: null
            }))
        });

        await lotteryDraw.save();
        await Lottery.updateOne({ lotteryID: lotteryId }, { hasDraw: true });
        await User.updateMany({ payout: { $gt: 0 } }, { payout: 0, totalTickets: 0 });

        return sendResponse(res, 200, 'Lottery draw created successfully', lotteryDraw);
    } catch (error) {
        console.error("Error creating lottery draw:", error);
        sendResponse(res, 500, false, error.message);
    }
}

const getDrawHistory = async (req, res) => {
    try {
        const { lotteryId } = req.params;
        const lottery = await Lottery.findOne({ lotteryID: lotteryId });

        if (!lottery) {
            return sendResponse(res, 404, false, 'Lottery not found');
        }
        if (!lottery.hasDraw) {
            return sendResponse(res, 404, false, 'Lottery has not been drawn yet');
        }

        const drawHistory = await LotteryDraw.findOne({ lotteryId })
            .populate('leaders.userId')
            .populate('secondWinner.userId')
            .populate('thirdWinner.userId')
            .populate('randomWinners.userId');

        return sendResponse(res, 200, true, 'Draw history fetched successfully', {
            drawHistory,
            lottery
        });
    } catch (error) {
        return sendResponse(res, 500, error.message);
    }
}

const updateSecondWinner = async (req, res) => {
    try {
        const { lotteryId, amount, percentage } = req.body;
        const lottery = await LotteryDraw.findOne({ lotteryId });

        if (!lottery) {
            return sendResponse(res, 404, false, 'Lottery draw not found');
        }

        // Assume there's logic to update the second winner's amount and percentage here

    } catch (error) {
        return sendResponse(res, 500, error.message);
    }
}

module.exports = {
    createLotteryDraw,
    getDrawHistory
};
 