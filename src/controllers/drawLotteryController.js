const LotteryDraw = require('../models/lotteryDrawSchema');
const User = require('../models/userSchema');
const PurchaseHistory = require('../models/puchaseHistorySchema');
const Lottery = require('../models/lotterySchema');
const sendResponse = require('../utils/sendResponse');

function getDateBasedRandomIndex(max) {
    const now = new Date();
    return now.getMilliseconds() % max;
}

async function createLotteryDraw(lotteryId) {
    try {
        // Check if the lottery exists and is active
        const lottery = await Lottery.findOne({ lotteryID: lotteryId });
        if (!lottery) {
            throw new Error("Lottery not found.");
        }
        if (!lottery.isActive) {
            throw new Error("Lottery is not active.");
        }

        // Check if the lottery has already been drawn
        const existingDraw = await LotteryDraw.findOne({ lotteryId });
       
        if (existingDraw) {
            throw new Error("Lottery has already been drawn.");
        }

        // Find top 30 leaders based on payout
        const leaders = await User.find().sort({ payout: -1 }).limit(30);

        // Find all purchase histories for the specified lottery
        const purchaseHistories = await PurchaseHistory.find({ lotteryId }).populate('userId');

        // Choose second and third winners randomly from the purchaseHistories using date-based random index
        let secondWinner = null;
        let thirdWinner = null;
        if (purchaseHistories.length > 0) {
            const secondWinnerIndex = getDateBasedRandomIndex(purchaseHistories.length);
            secondWinner = purchaseHistories[secondWinnerIndex].userId;

            if (purchaseHistories.length > 1) {
                let thirdWinnerIndex;
                do {
                    thirdWinnerIndex = getDateBasedRandomIndex(purchaseHistories.length);
                } while (thirdWinnerIndex === secondWinnerIndex);
                thirdWinner = purchaseHistories[thirdWinnerIndex].userId;
            }
        }

        // Find premium users
        const premiumUsers = await User.find({ userType: 'premium' });

        // Find 1000 unique users who have bought at least one ticket for the lottery
        const randomWinnersAggregation = await PurchaseHistory.aggregate([
            { $match: { lotteryId: mongoose.Types.ObjectId(lotteryId) } },
            { $group: { _id: '$userId' } },
            { $sample: { size: 1000 } }
        ]);

        const randomWinners = randomWinnersAggregation.map(item => item._id);

        // Create a new lottery draw document
        const lotteryDraw = new LotteryDraw({
            lotteryId,
            leaders: leaders.map(leader => ({
                userId: leader._id,
                payout: leader.payout,
                percentage: null,
                amount: null
            })),
            secondWinner: secondWinner ? {
                userId: secondWinner._id,
                percentage: null,
                amount: null
            } : null,
            thirdWinner: thirdWinner ? {
                userId: thirdWinner._id,
                percentage: null,
                amount: null
            } : null,
            premiumUsers: premiumUsers.map(user => ({
                userId: user._id,
                percentage: null,
                amount: null
            })),
            randomWinners: randomWinners.map(userId => ({
                userId: userId,
                percentage: null,
                amount: null
            }))
        });

        await lotteryDraw.save();
        return lotteryDraw;
    } catch (error) {
        console.error("Error creating lottery draw:", error);
        throw error;
    }
}

const getDrawHistory = async (req, res) => {
    try {
        const { lotteryId } = req.params;
        // check if the lottery exists, and hasDraw is true
        const lottery = await Lottery.findOne({ lotteryId });
        if (!lottery) {
            return sendResponse(res, 404, 'Lottery not found');
        }
        if (!lottery.hasDraw) {
            return sendResponse(res, 404, 'Lottery has not been drawn yet');
        }
        const drawHistory = await LotteryDraw.find({ lotteryId }).populate('leaders.userId').populate('secondWinner.userId').populate('thirdWinner.userId').populate('premiumUsers.userId').populate('randomWinners.userId');
        return sendResponse(res, 200, 'Draw history fetched successfully', drawHistory);
    }
    catch (error) {
        return sendResponse(res, 500, error.message);
    }
}

module.exports = {
    createLotteryDraw,
    getDrawHistory
};
