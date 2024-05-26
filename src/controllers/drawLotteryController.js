const LotteryDraw = require('../models/lotteryDrawSchema');
const User = require('../models/userSchema');
const PurchaseHistory = require('../models/puchaseHistorySchema');
const Lottery = require('../models/lotterySchema');
const sendResponse = require('../utils/sendResponse');

function getDateBasedRandomIndex(max) {
    const now = new Date();
    return now.getMilliseconds() % max;
}

const createLotteryDraw=async(req,res)=> {
    try {
        // Check if the lottery exists and is active
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

        // Check if the lottery has already been drawn
        const existingDraw = await LotteryDraw.findOne({ lotteryId });
        
        
        if (existingDraw) {
            throw new Error("Lottery has already been drawn.");
        }

        // Find top 30 leaders based on payout
        const leaders = await User.find({ payout: { $gt: 0 } }).sort({ payout: -1 }).limit(30);

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
            { $match: { lotteryId: lotteryId } },  // Use lotteryId directly since it's a number
            { $group: { _id: '$userId' } },
            { $sample: { size: 1000 } }
        ]);

        const randomWinners = randomWinnersAggregation.map(item => item._id);

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
        await Lottery.updateOne({ lotteryID: lotteryId }, { hasDraw: true });
        return sendResponse(res, 200, 'Lottery draw created successfully', lotteryDraw);
    } catch (error) {
        console.error("Error creating lottery draw:", error);
        sendResponse(res, 500,false, error.message);
    }
}

const getDrawHistory = async (req, res) => {
    try {
        const { lotteryId } = req.params;
        const lottery = await Lottery.findOne({ lotteryID: lotteryId});
        if (!lottery) {
            return sendResponse(res, 404,false, 'Lottery not found');
        }
        if (!lottery.hasDraw) {
            return sendResponse(res, 404,false, 'Lottery has not been drawn yet');
        }
        const drawHistory = await LotteryDraw.findOne({ lotteryId }).populate('leaders.userId').populate('secondWinner.userId').populate('thirdWinner.userId').populate('premiumUsers.userId').populate('randomWinners.userId');
        return sendResponse(res, 200,true, 'Draw history fetched successfully', {
            drawHistory,
            lottery
        });
    }
    catch (error) {
        return sendResponse(res, 500, error.message);
    }
}

// update the second user amount and percentage, only take lotteryId amount and percentage
const updateSecondWinner = async (req,res) => {
    try {
        const { lotteryId, amount, percentage } = req.body;
        const lottery = await LotteryDraw.findOne({ lotteryId });
        if (!lottery) {
            return sendResponse(res, 404,false, 'Lottery draw not found');
        }
    }
    catch(e){
        return sendResponse(res, 500, e.message);
    }
}
        
    

module.exports = {
    createLotteryDraw,
    getDrawHistory
};
