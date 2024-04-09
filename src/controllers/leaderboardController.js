const User=require('../models/userSchema');
const sendResponse=require('../utils/sendResponse');
// get top 30 users with highest payout

exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await User.find().sort({ payout: -1 }).limit(30);
        sendResponse(res, 200, true,'Leaderboard fetched successfully', leaderboard);
    }
    catch (err) {
        sendResponse(res, 500, false,'Internal server error', err.message);
    }
};
