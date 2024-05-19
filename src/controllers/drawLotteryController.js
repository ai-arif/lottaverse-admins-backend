const LotterySchema=require('../models/lotterySchema')
const PurchaseHistory = require('../models/puchaseHistorySchema')
const sendResponse = require('../utils/sendResponse')
const User = require('../models/userSchema')
const Ticket = require('../models/ticketsSchema')
const CommissionHistory = require('../models/commissionHistory')

// top 30 leaders of the leader
// first prize winner ke msg dibo
// 2nd prize winner ke
// 3rd prize winner ke
// 1000 random users 
const drawLottery=async(req,res)=>{
    try {
        const {lotteryId}=req.body
        
        const lottery=await LotterySchema.findOne({lotteryID:lotteryId})
        if(!lottery){
            return sendResponse(res,404,false,'Lottery not found',null)
        }
        if(lottery.hasDraw){
            return sendResponse(res,400,false,'Lottery already drawn',null)
        }
        const expiration=lottery.expiration
        const currentTime=new Date().getTime()
        if(currentTime > expiration){
            return sendResponse(res,400,false,'Lottery expired',null)
        }


        const ticketPrice= lottery.ticketPrice;
        const premiumUsers=await User.find({userType:"premium"})
        const purchaseHistory=await PurchaseHistory.find({lotteryId}).populate('userId')
        if (!purchaseHistory || purchaseHistory.length === 0) {
            return sendResponse(res, 404, false, 'No purchase history found for this lottery', null);
        }
        const totalAmount=purchaseHistory.reduce((acc,curr)=>acc+curr.amount,0)        
        const fivePercent=totalAmount*0.05
        const fivePercentPerPremiumUser=fivePercent/premiumUsers.length
        const top30Users=await User.find().sort({payout:-1}).limit(30)
        const fivePercentOfTotalPerUser=fivePercent/30
        
        
        
        const randomIndex=Math.floor(Math.random()*purchaseHistory.length)
        
        const secondPrizeWinner=purchaseHistory[randomIndex].userId?.address
        
        const randomIndex2=Math.floor(Math.random()*purchaseHistory.length)
        const thirdPrizeWinner=purchaseHistory[randomIndex2].userId?.address
        
        let randomUsers=[]
        let length=purchaseHistory.length > 1000 ? 1000 : purchaseHistory.length
        for(let i=0;i<length;i++){
            const randomIndex=Math.floor(Math.random()*purchaseHistory.length)
            randomUsers.push(purchaseHistory[randomIndex]?.userId?.address)
        }
        
        // make random users unique
        randomUsers=Array.from(new Set(randomUsers))
        // get the second winner amount
        const secondWinnerAmount=getSecondWinnerAmount(lottery.lotteryType)
        const thirdWinnerAmount=getThirdWinnerAmount(lottery.lotteryType)
        const randomWinnerAmount=getRandomWinnerAmount(lottery.lotteryType)

        const data={
            fivePercentOfTotalPerUser,
            secondWinnerAmount,
            thirdWinnerAmount,
            randomWinnerAmount,
            fivePercentPerPremiumUser,
            premiumUsers,
            top30Users,
            firstPrizeWinner:top30Users[0],
            secondPrizeWinner,
            thirdPrizeWinner,
            randomUsers,
            
        }

        // send the data to the users
        sendResponse(res,200,true,'Lottery drawn successfully',data)

    } catch (error) {
        sendResponse(res,500,false,error.message, error.message)
        
    }
}

const performDraw=async(req,res)=>{
    const {lotteryId}=req.body
    try {
        const lottery=await LotterySchema.findOne({lotteryID:lotteryId})
        if(!lottery){
            return sendResponse(res,404,false,'Lottery not found',null)
        }
        if(lottery.hasDraw){
            return sendResponse(res,400,false,'Lottery already drawn',null)
        }
        // use 
    }
    catch (error) {
        sendResponse(res,500,false,error.message, error.message)
    }
}

// write a function that will take package name and return the second winner amount in wei
// package name is a string
const getSecondWinnerAmount=(packageName)=>{
    const packageAmount={
        'easy':322732,
        'super':484098,
        'superx':968197
    }
    return packageAmount[packageName]
}

const getThirdWinnerAmount=(packageName)=>{
    const packageAmount={
        'easy':96820,
        'super':161366,
        'superx':322732
    }
    return packageAmount[packageName]
}

const getRandomWinnerAmount=(packageName)=>{
    const packageAmount={
        'easy':3227.16,
        'super':4840.74,
        'superx':9681.48
    }
    return packageAmount[packageName]
}

module.exports={
    drawLottery
}