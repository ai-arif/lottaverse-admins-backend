const User = require('../models/userSchema');
const sendResponse = require('../utils/sendResponse');

exports.getReferralHierarchy = async (req, res) => {
    try {
        const userId = req.id; // Assuming you have userId available in req
        const user = await User.findById(userId).populate({
            path: 'referredUsers',
            populate: {
                path: 'referredUsers',
                populate: {
                    path: 'referredUsers'
                    // Continue nesting if you expect more levels
                }
            }
        });

        const referralHierarchy = buildHierarchy(user);

        sendResponse(res, 200, true, 'Referral hierarchy fetched successfully', referralHierarchy);
    } catch (err) {
        sendResponse(res, 500, false, 'Internal server error', err.message);
    }
};

function buildHierarchy(user) {
    
    const hierarchy = {
        name: user.referralId, // Assuming you want to use user's address as the name
        children: []
    };

    if (user.referredUsers.length > 0) {
        user.referredUsers.forEach(referredUser => {
            hierarchy.children.push(buildHierarchy(referredUser));
        });
    }

    return hierarchy;
}
