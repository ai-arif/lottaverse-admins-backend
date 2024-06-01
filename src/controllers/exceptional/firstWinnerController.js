const PurchaseHistory = require('../../models/purchaseHistory');
const LotteryDraw = require('../../models/lotteryDrawSchema');
const sendResponse = require('../../utils/sendResponse');

// i will send a lotteryid, address, and index, get all the purchaseHistory for that lotteryId, get the user from the userId, get the address from the user, get the ticketId from the purchaseHistory, get the ticketId from the randomWinners, if they match, send the commission to the user
const generateFirstWinner = async (req, res) => {
    try {
        const { lotteryId, address, index } = req.body;

        const purchaseHistories = await PurchaseHistory.find({ lotteryId }).populate('userId');
        const randomWinners = await LotteryDraw.findOne({ lotteryId });

        const winner = randomWinners.randomWinners[index];

        if (!winner) {
            return sendResponse(res, 404, false, 'Winner not found');
        }

        const purchaseHistory = purchaseHistories.find(history => history.ticketId === winner.ticketId);

        if (!purchaseHistory) {
            return sendResponse(res, 404, false, 'Purchase history not found');
        }

        const user = purchaseHistory.userId;

        if (user.address !== address) {
            return sendResponse(res, 400, false, 'Address does not match');
        }

        if (purchaseHistory.commission_sent) {
            return sendResponse(res, 400, false, 'Commission already sent');
        }

        // Logic to send commission
        // Example: await sendCommissionToUser(user._id, winner.amount);

        purchaseHistory.commission_sent = true;

        await purchaseHistory.save();

        sendResponse(res, 200, true, 'Commission sent to winner', purchaseHistory);
    } catch (error) {
        sendResponse(res, 500, false, error.message);
    }
}