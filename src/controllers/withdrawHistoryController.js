const Withdraw= require('../models/withdrawHistory');

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

exports.getWithdrawHistory = async (req, res) => {
    try {
        const userId = req.id;
        const withdrawHistory = await Withdraw.find({ user: userId });
        sendResponse(res, 200, true, 'Withdraw history fetched successfully', withdrawHistory);
    } catch (err) {
        sendResponse(res, 500, false, 'Internal server error', err.message);
    }
}