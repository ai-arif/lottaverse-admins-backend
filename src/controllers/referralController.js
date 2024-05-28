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

function formatAddress(address) {
    // Check if the address is long enough
    if (address.length <= 6) {
      return address; // No need to format if address is too short
    }
  
    // Extract the first 3 and last 3 characters
    const firstPart = address.slice(0, 4);
    const lastPart = address.slice(-4);
  
    // Return the formatted address
    return `${firstPart}***${lastPart}`;
  }
function buildHierarchy(user) {
    
    const hierarchy = {
        name: formatAddress(user.address),
        children: []
    };

    if (user.referredUsers.length > 0) {
        user.referredUsers.forEach(referredUser => {
            hierarchy.children.push(buildHierarchy(referredUser));
        });
    }

    return hierarchy;
}
function calculateReferralData2(user) {
    const maxLevel = 7;
    const referralData = new Array(maxLevel).fill(0).map((_, idx) => ({
        referralLevel: idx + 1,
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0
    }));

    // Recursive function to traverse the referral hierarchy
    function traverse(node, level) {
        if (level > maxLevel) return;

        referralData[level - 1].totalUsers++;

        if (node.expiryDate && new Date(node.expiryDate) > new Date()) {
            referralData[level - 1].activeUsers++;
        } else {
            referralData[level - 1].inactiveUsers++;
        }

        if (node.referredUsers && node.referredUsers.length > 0) {
            node.referredUsers.forEach(referredUser => {
                traverse(referredUser, level + 1);
            });
        }
    }

    traverse(user, 1); // Start traversal from the root user

    return referralData;
}


exports.getReferralLevelCount = async (req, res) => {
    try {
        const userId = req.id;

        // Fetch the user with the referral hierarchy populated
        const user = await User.findById(userId).populate({
            path: 'referredUsers',
            populate: {
                path: 'referredUsers',
                populate: {
                    path: 'referredUsers',
                    populate: {
                        path: 'referredUsers',
                        populate: {
                            path: 'referredUsers',
                            populate: {
                                path: 'referredUsers',
                                populate: {
                                    path: 'referredUsers'
                                }
                            }
                        }
                    }
                }
            }
        });

        // Calculate referral data as an array of objects
        const referralData = calculateReferralData2(user);

        sendResponse(res, 200, true, 'Referral level count fetched successfully', referralData);
    } catch (err) {
        sendResponse(res, 500, false, 'Internal server error', err.message);
    }
};

// get referralLevel group by count, and sort by count, also check how many of them are active, and inactive
// exports.getReferralLevelCount = async (req, res) => {
//     try {
//         const userId = req.id;
//         // Fetch the user with the referral hierarchy populated
//         const user = await User.findById(userId).populate({
//             path: 'referredUsers',
//             populate: {
//                 path: 'referredUsers',
//                 populate: {
//                     path: 'referredUsers'
//                 }
//             }
//         });

//         // Calculate referral data as an array of objects
//         const referralData = calculateReferralData(user);

//         sendResponse(res, 200, true, 'Referral level count fetched successfully', referralData);
//     } catch (err) {
//         sendResponse(res, 500, false, 'Internal server error', err.message);
//     }
// };

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