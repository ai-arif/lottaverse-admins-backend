const User = require('../models/userSchema');
const PurchaseHistory = require('../models/puchaseHistorySchema');
const sendResponse = require('../utils/sendResponse');

exports.getLeaderboard = async (req, res) => {
    try {
        // Fetch the top 30 users based on payout
        let leaderboard = await User.find()
            .select(['_id', 'address', 'payout', 'createdAt', 'referralId', 'totalTickets'])
            .sort({ payout: -1 })
            .limit(30);

        // Get the last purchasing date of each user in the leaderboard
        const purchaseHistories = await PurchaseHistory.aggregate([
            {
                $match: {
                    userId: { $in: leaderboard.map(user => user._id) }
                }
            },
            {
                $group: {
                    _id: '$userId',
                    lastPurchaseDate: { $last: '$createdAt' }
                }
            }
        ]);

        // Create a lookup object for quick access to last purchase dates
        const lastPurchaseDateMap = purchaseHistories.reduce((acc, item) => {
            acc[item._id] = item.lastPurchaseDate;
            return acc;
        }, {});

        // Map the leaderboard users to include the last purchase date and obfuscate the address
        leaderboard = leaderboard.map(user => ({
            ...user.toObject(),
            address: user.address.substring(0, 4) + '******' + user.address.substring(user.address.length - 4),
            lastPurchaseDate: lastPurchaseDateMap[user._id] || null // Set to null if no purchase date found
        }));

        sendResponse(res, 200, true, 'Leaderboard fetched successfully', leaderboard);
    } catch (err) {
        sendResponse(res, 500, false, 'Internal server error', err.message);
    }
};
