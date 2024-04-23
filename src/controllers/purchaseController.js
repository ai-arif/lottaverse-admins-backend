const PurchaseHistory=require('../models/puchaseHistorySchema')
const sendResponse=require('../utils/sendResponse')

// user id will be on req.id , write crud
const purchaseHistory=async(req,res)=>{
    try{
        const {lotteryID,transactionHash,amount,numberOfTickets}=req.body
        const purchaseHistory=new PurchaseHistory({
            userID:req.id,
            lotteryID,
            transactionHash,
            amount,
            numberOfTickets
        })
        await purchaseHistory.save()
        sendResponse(res,200,'Purchase history saved',{purchaseHistory})
    }
    catch(err){
        sendResponse(res,500,err.message)
    }
}