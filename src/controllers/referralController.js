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
// get referralLevel group by count, and sort by count, also check how many of them are active, and inactive
exports.getReferralLevelCount = async (req, res) => {
    try {
        const userId = req.id;
        // Fetch the user with the referral hierarchy populated
        const user = await User.findById(userId).populate({
            path: 'referredUsers',
            populate: {
                path: 'referredUsers',
                populate: {
                    path: 'referredUsers'
                }
            }
        });

        // Calculate referral data as an array of objects
        const referralData = calculateReferralData(user);

        sendResponse(res, 200, true, 'Referral level count fetched successfully', referralData);
    } catch (err) {
        sendResponse(res, 500, false, 'Internal server error', err.message);
    }
};

// Function to calculate referral data
function calculateReferralData(user) {
    const referralData = [];

    // Recursive function to traverse the referral hierarchy
    function traverse(node, level) {
        if (!referralData[level - 1]) {
            referralData[level - 1] = {
                referralLevel: level,
                totalUsers: 0,
                activeUsers: 0,
                inactiveUsers: 0
            };
        }

        referralData[level - 1].totalUsers++;

        if (node.expiryDate && new Date(node.expiryDate) > new Date()) {
            referralData[level - 1].activeUsers++;
        } else {
            referralData[level - 1].inactiveUsers++;
        }

        if (node.referredUsers.length > 0) {
            node.referredUsers.forEach(referredUser => {
                traverse(referredUser, level + 1);
            });
        }
    }

    traverse(user, 1); // Start traversal from the root user

    return referralData;
}