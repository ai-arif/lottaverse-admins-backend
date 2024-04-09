const User=require('../models/userSchema');
const Ticket=require('../models/ticketsSchema');
const sendResponse=require('../utils/sendResponse');

// owner: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
// },
// ticketId: {
//     type: String,
//     required: true
// },
// ticketType: {
//     type: String,
//     required: true
// },
// ticketPrice: {
//     type: Number,
//     required: true
// },
// ticketQuantity: {
//     type: Number,
//     required: true
// },
// write code for buy ticket, where, ticketIds array will be passed in the request body, use multiple input validation techniques to validate the request body
exports.buyTicket = async (req, res) => {
    try {
        const { ticketIds,packageType,ticketPrice } = req.body;
        if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
            return sendResponse(res, 400, false, 'Invalid request body');
        }
        const tickets = await Ticket.find({ _id: { $in: ticketIds } });
        if (tickets.length !== ticketIds.length) {
            return sendResponse(res, 400, false, 'Invalid ticket ids');
        }
        const user = await User.findById(req.id);
        let totalAmount = 0;
        for (const ticket of tickets) {
            totalAmount += ticket.ticketPrice;
        }
        if (user.availableBalance < totalAmount) {
            return sendResponse(res, 400, false, 'Insufficient balance');
        }
        user.availableBalance -= totalAmount;
        user.transactions.push({
            type: 'debit',
            amount: totalAmount,
            description: 'Ticket purchase'
        });
        await user.save();
        sendResponse(res, 200, true, 'Tickets purchased successfully');
    }
    catch (err) {
        sendResponse(res, 500, false, 'Internal server error', err.message);
    }
}