const Lottery = require('../../models/lotterySchema');
const sendResponse = require('../../utils/sendResponse');


const activeLotteriesController = async (req, res) => {
    
    const activeLotteries = await Lottery.find({ isActive: true }).sort({ createdAt: -1 });
    sendResponse(res, 200,true,"Lottery Fetched Successfully", activeLotteries);
}

module.exports = activeLotteriesController;