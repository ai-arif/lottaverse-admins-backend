const CommissionHistory=require('../models/commissionHistory');
const sendResponse = require('../utils/sendResponse');

exports.getCommissionHistory = async (req, res) => {
    try {
        const userId = req.id;
        const commissionHistory = await CommissionHistory.find({ to: userId});
        sendResponse(res, 200, true, 'Commission history fetched successfully', commissionHistory);
    } catch (err) {
        sendResponse(res, 500, false, 'Internal server error', err.message);
    }
}