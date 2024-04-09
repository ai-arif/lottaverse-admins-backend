const User = require('../models/userSchema');
const jwt = require('jsonwebtoken');
const sendResponse = require('../utils/sendResponse');

exports.registerUser = async (req, res) => {
    try {
        const { address, referralLink } = req.body;

        let parentReferralId = null;
        if (referralLink) {
            const match = referralLink.match(/ref=([^&]+)/);
            if (match) {
                parentReferralId = match[1];
            }
        }

        const referralId = generateReferralId();
        const referralLinkForUser = generateReferralLink(referralId);


        let user = await User.findOne({ address });

        if (!user) {
            if (parentReferralId) {
                const referredBy = await User.findOne({ referralId: parentReferralId });
                if (referredBy) {
                    user = await User.create({
                        address,
                        referralId,
                        referralLevel: referredBy.referralLevel + 1,
                        referredBy: referredBy._id,
                        referralLink: referralLinkForUser
                    });
                    console.log('created user', user);
                    referredBy.referredUsers.push(user);
                    await referredBy.save();
                }
            } else {
                user = await User.create({ address, referralId, referralLink: referralLinkForUser });
            }
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        sendResponse(res, 200, true, 'User registered successfully', { token });
    } catch (err) {
        sendResponse(res, 500, false, 'Internal server error', err.message);
    }
};

// getUsersDetails
exports.getUsersDetails = async (req, res) => {
    try {
        const users = await User.find().populate('referredUsers');
        sendResponse(res, 200, true, 'Users details fetched successfully', users);
    } catch (err) {
        sendResponse(res, 500, false, 'Internal server error', err.message);
    }
};



function generateReferralId() {
    return 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateReferralLink(referralId) {
    return `${process.env.APP_URL}/register?ref=${referralId}`;
}
