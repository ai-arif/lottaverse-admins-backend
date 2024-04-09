const User = require('../models/userSchema');
const jwt = require('jsonwebtoken');
const sendResponse = require('../utils/sendResponse');

exports.registerUser = async (req, res) => {
    try {
        const { address, referralLink } = req.body;

        // Extract parent referral ID from the referral link
        let parentReferralId = null;
        if (referralLink) {
            const match = referralLink.match(/ref=([^&]+)/);
            if (match) {
                parentReferralId = match[1];
            }
        }

        // Check if the address is already registered
        let user = await User.findOne({ address });

        // Generate referral ID and reference URL for the new user
        const referralId = generateReferralId();
        const referenceUrl = parentReferralId || referralId;

        // If the address is not registered, create a new user
        if (!user) {
            user = await User.create({ address, referralId });

            // If a parent referral ID is provided, update the referral information
            if (parentReferralId) {
                const referredUser = await User.findOne({ referralId: parentReferralId });
                if (referredUser) {
                    user.referralId = parentReferralId;
                    user.referralLevel = referredUser.referralLevel + 1;
                    await user.save();

                    // Add the user to the referred users list of the referred user
                    referredUser.referredUsers.push(user);
                    await referredUser.save();
                }
            }
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        sendResponse(res, 200, true, 'User registered successfully', { token });
    } catch (err) {
        sendResponse(res, 500, false, 'Internal server error', err.message);
    }
};

// Function to generate referral ID
function generateReferralId() {
    return 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Function to generate reference URL
function generateReferenceUrl(referralId) {
    return `${process.env.APP_URL}/register?ref=${referralId}`;
}

// Function to validate the address
function validateAddress(address) {
    return /^(0x)?[0-9a-fA-F]{40}$/.test(address);
}
// get users details
exports.getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.id).populate('referredUsers');
        sendResponse(res, 200, true, 'User details fetched successfully', user);
    } catch (err) {
        sendResponse(res, 500, false, 'Internal server error', err.message);
    }
};



