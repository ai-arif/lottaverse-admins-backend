const PurchaseHistory=require('../models/puchaseHistorySchema')
const lotterySchema=require('../models/lotterySchema')
const User=require('../models/userSchema')
const Ticket=require('../models/ticketsSchema')
const sendResponse=require('../utils/sendResponse')

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

const createPurchaseHistory=async(req,res)=>{
    try {
        const {ticketIds,lotteryId,transactionHash}=req.body
        const userId=req.id
        console.log(lotteryId)
        const lottery = await lotterySchema.findOne({"lotteryID":lotteryId})
        if(!lottery){
            return sendResponse(res,404,'Lottery not found')
        }
        

        let ticketNumbers = ticketIds.map(ids => parseInt(ids.join(''), 10));

        console.log(ticketNumbers);

        console.log(lottery.ticketPrice)

        return sendResponse(res,200,true,'Purchase history created successfully')

    } catch (error) {
        sendResponse(res,500,error.message)
    }
}

module.exports={
    createPurchaseHistory
}