const User = require('../models/userSchema');
const sendResponse = require('../utils/sendResponse');

exports.getLeaderboard = async (req, res) => {
    try {
        let leaderboard = await User.find().select(['_id','address','payout','createdAt','referralId','totalTickets']).sort({ payout: -1 }).limit(30);
        leaderboard = leaderboard.map(user => ({
            ...user.toObject(),
            address: user.address.substring(0, 4) + '******' + user.address.substring(user.address.length - 4)
        }));

        sendResponse(res, 200, true, 'Leaderboard fetched successfully', leaderboard);
    } catch (err) {
        sendResponse(res, 500, false, 'Internal server error', err.message);
    }
};
