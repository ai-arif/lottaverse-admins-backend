const PurchaseHistory = require('../models/puchaseHistorySchema')
const lotterySchema = require('../models/lotterySchema')
const CommissionHistory = require('../models/commissionHistory')
const User = require('../models/userSchema')
const Ticket = require('../models/ticketsSchema')
const sendResponse = require('../utils/sendResponse')

// user id will be on req.id , write crud
// const purchaseHistorySchema = new mongoose.Schema({
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     ticketId: {
//         type: String,
//         required: true
//     },
//     lotteryId:{
//         type:Number,
//         required:true
//     },
//     ticketQuantity: {
//         type: Number,
//         required: true
//     },
//     transactionHash:{
//         type:String,
//         required:true
//     },
//     amount: {
//         type: Number,
//         required: true
//     }
// }, { timestamps: true });

// write controller for these models

// create purchase history, user id will be req.id

const createPurchaseHistory = async (req, res) => {
    try {
        const { ticketIds, lotteryId, transactionHash } = req.body
        const userId = req.id

        const pipeline = [
            { $match: { _id: userId } },
            {
                $graphLookup: {
                    from: "users",
                    startWith: "$_id",
                    connectFromField: "referredBy",
                    connectToField: "_id",
                    maxDepth: 7,
                    depthField: "level",
                    as: "referrers"
                }
            }
        ];

        const referrerHierarchy = await User.aggregate(pipeline);

        const referrers = referrerHierarchy.length > 0 ? referrerHierarchy[0].referrers : [];
        // get the user whose level is 0    

        const currentUser= referrers.find(referrer => referrer.level === 0)

        const lottery = await lotterySchema.findOne({ "lotteryID": lotteryId })
        // totalPurchased field of lottery will be increased by ticketIds.length
        await lotterySchema.findOneAndUpdate({ "lotteryID": lotteryId }, { $inc: { totalPurchased: ticketIds.length } })

        let totalPaid=lottery?.ticketPrice * ticketIds?.length 
        // also increase the user expiryDate field to next 1 month, and add totalPaid with user payout
        
        await User.findByIdAndUpdate(userId, { $inc: { payout: totalPaid, totalTickets: ticketIds.length }, expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })
        


        if (!lottery) {
            return sendResponse(res, 404, 'Lottery not found')
        }

        let ticketNumbers = ticketIds.map(ids => parseInt(ids.join(''), 10));
        let purchaseHistories = ticketNumbers.map(ticketNumber => {

            return {
                userId,
                ticketId: ticketNumber,
                lotteryId,
                lotteryPackage: lottery.lotteryType,
                ticketQuantity: 1,
                transactionHash,
                amount: lottery.ticketPrice
            }
        });


        const commissionHistories = []

        for (let i = 0; i < referrers.length; i++) {
            if (referrers[i].level == 0) continue
            if (referrers[i].level > 7) break
            for (let j = 0; j < ticketNumbers.length; j++) {
                const percentage = getPercentage(referrers[i].level)
                const commissionAmount = (percentage / 100) * lottery.ticketPrice
                commissionHistories.push({
                    from: userId,
                    to: referrers[i]._id,
                    fromAddress: currentUser.address,
                    toAddress: referrers[i].address,
                    ticketId: ticketNumbers[j],
                    transactionHash,
                    lotteryId,
                    percentage,
                    transactionHash,
                    amount: commissionAmount,
                    level: referrers[i].level
                })
            }
        }
        // insert purchase history, and commission history
        await PurchaseHistory.insertMany(purchaseHistories)
        await CommissionHistory.insertMany(commissionHistories)

        for (let i = 0; i < commissionHistories.length; i++) {
            
            await User.findByIdAndUpdate(
                commissionHistories[i].to,
                { 
                    $inc: { 
                        earnings: commissionHistories[i].amount,
                        commissionEarnings: commissionHistories[i].amount 
                    } 
                }
            );
        }
        


        const data = {
            purchaseHistories,
            commissionHistories
        }

        return sendResponse(res, 200, true, 'Purchase history created successfully', data)

    } catch (error) {
        sendResponse(res, 500, error.message)
    }
}

// Level-1 : 10%
// Level-2 : 5%
// Level-3 : 3%
// Level-4 : 2%
// Level-5 : 1%
// Level-6 : 1%
// Level-7 : 1%
// write a function that will return the percentage based on level

const getPercentage = (level) => {
    if (level === 1) {
        return 10
    } else if (level === 2) {
        return 5
    } else if (level === 3) {
        return 3
    } else if (level === 4) {
        return 2
    } else {
        return 1
    }
}

// get the purchase history of a user
const getPurchaseHistory = async (req, res) => {
    try {
        const userId = req.id
        const purchaseHistories = await PurchaseHistory.find({ userId }).sort({ createdAt: -1 })
        return sendResponse(res, 200, true, 'Purchase history fetched successfully', purchaseHistories)
    } catch (error) {
        sendResponse(res, 500, error.message)
    }
}


module.exports = {
    createPurchaseHistory,
    getPurchaseHistory
}