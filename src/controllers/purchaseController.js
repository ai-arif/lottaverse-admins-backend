const PurchaseHistory = require('../models/puchaseHistorySchema')
const lotterySchema = require('../models/lotterySchema')
const LotteryDraw =require('../models/lotteryDrawSchema')
const CommissionHistory = require('../models/commissionHistory')
const User = require('../models/userSchema')
const Ticket = require('../models/ticketsSchema')
const sendResponse = require('../utils/sendResponse')


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

        const currentUser = referrers.find(referrer => referrer.level === 0)

        const lottery = await lotterySchema.findOne({ "lotteryID": lotteryId })
        // totalPurchased field of lottery will be increased by ticketIds.length
        await lotterySchema.findOneAndUpdate({ "lotteryID": lotteryId }, { $inc: { totalPurchased: ticketIds.length } })
        const premiumUsers = await User.find({ userType: 'premium' });
        let totalPaid = lottery?.ticketPrice * ticketIds?.length
        // calculate 10% of the total ticket price and divide it with the number of premium users
        const commissionAmount = (totalPaid * 0.1) / premiumUsers.length
        // update the premium users earnings field by adding the commission amount, earnings field will be increased by commissionAmount, also increase the commissionEarnings
        const userIds = premiumUsers.map(user => user._id);
        await User.updateMany(
            { _id: { $in: userIds } },
            {
                $inc: { earnings: commissionAmount, commissionEarnings: commissionAmount }
            }
        );
        console.log("totalPaid", totalPaid)
        console.log("ticket id length", ticketIds.length)
        // await User.findByIdAndUpdate(userId, { $inc: { payout: totalPaid, totalTickets: ticketIds.length }, expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })
        await User.findByIdAndUpdate(
            userId,
            {
                $inc: { payout: totalPaid, totalTickets: ticketIds.length },
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            }
        );

        if (!lottery) {
            return sendResponse(res, 404, 'Lottery not found')
        }
        const ticketStrings = ticketIds.map(ids => ids.join(' '));
        let ticketNumbers = ticketIds.map(ids => parseInt(ids.join(''), 10));
        const purchaseHistories = ticketNumbers.map((ticketNumber, index) => ({
            userId,
            ticketId: ticketNumber.toString(),
            ticketString: ticketStrings[index],
            lotteryId,
            lotteryPackage: lottery.lotteryType,
            ticketQuantity: 1,
            transactionHash,
            amount:lottery.ticketPrice
        }));


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
// const getPurchaseHistory = async (req, res) => {
//     try {
//         const userId = req.id
//         const purchaseHistories = await PurchaseHistory.find({ userId }).sort({ createdAt: -1 })
//         return sendResponse(res, 200, true, 'Purchase history fetched successfully', purchaseHistories)
//     } catch (error) {
//         sendResponse(res, 500, error.message)
//     }
// }

const getPurchaseHistory = async (req, res) => {
    try {
        const userId = req.id;

        // Fetch the user's purchase history
        const purchaseHistories = await PurchaseHistory.find({ userId }).sort({ createdAt: -1 });

        // Add winner and draw information to each purchase history entry
        const enhancedHistories = await Promise.all(purchaseHistories.map(async (purchase) => {
            const lotteryDraw = await LotteryDraw.findOne({ lotteryId: purchase.lotteryId });

            if (lotteryDraw) {
                const isWinner = {
                    leader: lotteryDraw.leaders.some(leader => leader.userId.toString() === userId.toString()),
                    secondPrize: lotteryDraw.secondWinner.userId.toString() === userId.toString() && lotteryDraw.secondWinner.ticketId === purchase.ticketId,
                    thirdPrize: lotteryDraw.thirdWinner.userId.toString() === userId.toString() && lotteryDraw.thirdWinner.ticketId === purchase.ticketId,
                    randomWinner: lotteryDraw.randomWinners.some(winner => winner.userId.toString() === userId.toString() && winner.ticketId === purchase.ticketId)
                };

                return {
                    ...purchase.toObject(),
                    isWinner,
                    isDrawn: true
                };
            } else {
                return {
                    ...purchase.toObject(),
                    isWinner: null, // Lottery has not been drawn yet
                    isDrawn: false
                };
            }
        }));

        return sendResponse(res, 200, true, 'Purchase history fetched successfully', enhancedHistories);
    } catch (error) {
        sendResponse(res, 500, false, 'Internal server error', error.message);
    }
}

const prePurchase = async (req, res) => {
    const { ticketIds, lotteryId, transactionHash } = req.body
    const userId = req.id
    const premiumUsers = await User.find({ userType: 'premium' }).select('address');
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


    const lottery = await lotterySchema.findOne({ "lotteryID": lotteryId })
    // calculate 10% of the total ticket price
    const totalPaid = lottery?.ticketPrice * ticketIds?.length
    // calculate 10% of the total ticket price and divide it with the number of premium users
    const commissionAmount = (totalPaid * 0.1) / premiumUsers.length


    if (!lottery) {
        return sendResponse(res, 404, 'Lottery not found')
    }

    let ticketNumbers = ticketIds.map(ids => parseInt(ids.join(''), 10));

    const referAddress = []
    const amount = []

    for (let i = 0; i < referrers.length; i++) {
        if (referrers[i].level == 0) continue
        if (referrers[i].level > 7) break
        for (let j = 0; j < ticketNumbers.length; j++) {
            const percentage = getPercentage(referrers[i].level)
            const commissionAmount = (percentage / 100) * lottery.ticketPrice
            referAddress.push(referrers[i].address)
            amount.push(commissionAmount)

        }
    }

    for (let i = 0; i < premiumUsers.length; i++) {
        referAddress.push(premiumUsers[i].address)
        amount.push(commissionAmount)
    }
    const addressAmountMap = {};
    for (let i = 0; i < referAddress.length; i++) {
        const address = referAddress[i];
        const amt = amount[i];
        if (addressAmountMap[address]) {
            addressAmountMap[address] += amt;
        } else {
            addressAmountMap[address] = amt;
        }
    }

    // Convert the map back to arrays
    const combinedReferAddress = [];
    const combinedAmount = [];

    for (const [address, amt] of Object.entries(addressAmountMap)) {
        combinedReferAddress.push(address);
        combinedAmount.push(amt);
    }



    return sendResponse(res, 200, true, 'Purchase history created successfully', { "referAddress": combinedReferAddress, "amount": combinedAmount })


}






module.exports = {
    createPurchaseHistory,
    getPurchaseHistory,
    prePurchase
}