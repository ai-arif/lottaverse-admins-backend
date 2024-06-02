const PurchaseHistory = require('../../models/puchaseHistorySchema');
const LotteryDraw = require('../../models/lotteryDrawSchema');
const User = require('../../models/userSchema');
const sendResponse = require('../../utils/sendResponse');

// i will send a lotteryid, address, and index, get all the purchaseHistory for that lotteryId, get the user from the userId, get the address from the user, get the ticketId from the purchaseHistory, get the ticketId from the randomWinners, if they match, send the commission to the user
const getFirstWinnerPurchaseByIndex = async (req, res) => {
    try {
        const { lotteryId, address, index } = req.body;

        // Step 1: Find the user by address
        const user = await User.findOne({ address });

        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }

        // Step 2: Get all purchases of that user for the specified lotteryId
        const purchaseHistories = await PurchaseHistory.find({ userId: user._id, lotteryId });

        if (!purchaseHistories || purchaseHistories.length === 0) {
            return sendResponse(res, 404, false, 'No purchase histories found for this lottery');
        }

        // Step 3: Get the purchase by index
        
        if (index < 0 || index > purchaseHistories.length) {
            return sendResponse(res, 400, false, 'Invalid index');
        }

        const purchase = purchaseHistories[parseInt(index)-1];
        const { ticketId, ticketString } = purchase;
        console.log(ticketId);
        console.log(ticketString);
        // Step 4: Get the lottery draw
        const lotteryDraw = await LotteryDraw.findOne({ lotteryId });

// firstWinner: {
//         userId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'User',
//         },
//         commission_sent: {
//             type: Boolean,
//             default: false
//         },
//         ticketId: {
//             type: String,
//             trim: true
//         }, 
//         ticketString: {
//             type: String,
//             trim: true
//         },    
//         amount: {
//             type: Number,
//             default: null
//         },
//     },
        // add the firstwinner to the lotteryDraw if it is not already there
        if (!lotteryDraw.firstWinner) {
            lotteryDraw.firstWinner = {
                userId: user._id,
                ticketId,
                ticketString,
                amount: 0,
                commission_sent: false
            };
            await lotteryDraw.save();
            console.log('First winner added to the lottery draw');
            
        }
        // Send the response with ticket information
        sendResponse(res, 200, true, 'Ticket information retrieved successfully', { ticketId, ticketString });
    } catch (error) {
        sendResponse(res, 500, false, 'Internal server error', error.message);
    }
};

module.exports = {
    getFirstWinnerPurchaseByIndex,
    // Other controllers...
};