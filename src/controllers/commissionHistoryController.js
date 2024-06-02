const CommissionHistory=require('../models/commissionHistory');
const sendResponse = require('../utils/sendResponse');

function formatAddress(address) {
    
    if (address.length <= 6) {
      return address;
    }
    const firstPart = address.slice(0, 4);
    const lastPart = address.slice(-4);
  return `${firstPart}***${lastPart}`;
  }
exports.getCommissionHistory = async (req, res) => {
    try {
        const userId = req.id;
        const commissionHistory = await CommissionHistory.find({ to: userId}).populate('from');
        // formAddress field modify it to formatAddress
        commissionHistory.forEach(history => {
            history.fromAddress = formatAddress(history.from.address);
        });
        sendResponse(res, 200, true, 'Commission history fetched successfully', commissionHistory);
    } catch (err) {
        sendResponse(res, 500, false, 'Internal server error', err.message);
    }
}