const Withdraw= require('../models/withdrawHistory');
const User = require('../models/userSchema');
const sendResponse = require('../utils/sendResponse');

exports.getWithdrawHistory = async (req, res) => {
    try {
        const userId = req.id;
        const withdrawHistory = await Withdraw.find({ user: userId });
        sendResponse(res, 200, true, 'Withdraw history fetched successfully', withdrawHistory);
    } catch (err) {
        sendResponse(res, 500, false, 'Internal server error', err.message);
    }
}

// add withdraw history and make usrs earnings to 0
exports.withdraw = async (req, res) => {
    try {
        const userId = req.id;
        const {amount}=req.body;
        const user = await User.findById (userId);
        
        user.earnings=0;
        await user.save();
        await Withdraw.create({user:userId,amount});
        sendResponse(res, 200, true, 'Withdraw successful');
    }
    catch (err) {
        sendResponse(res, 500, false, 'Internal server error', err.message);
    }
}