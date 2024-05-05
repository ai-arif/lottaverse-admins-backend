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
        const ticketPrice= lottery.ticketPrice;
        console.log('ticketPrice',ticketPrice)
        
        
        const purchaseHistory=await PurchaseHistory.find({lotteryId})
        // calculate amount 5% of the total amount of the lottery
        const totalAmount=purchaseHistory.reduce((acc,curr)=>acc+curr.amount,0)
        console.log('totalAmount',totalAmount)
        const fivePercent=totalAmount*0.05
        const top30Users=await User.find().sort({payout:-1}).limit(30)
        // divide the 5% amount among the top 30 users
        const fivePercentOfTotalPerUser=fivePercent/30
        
        // 
        
        const randomIndex=Math.floor(Math.random()*purchaseHistory.length)
        const secondPrizeWinner=purchaseHistory[randomIndex].userId
        // randomly chose third prize winner between the users who bought the lottery use purchaseHistory
        const randomIndex2=Math.floor(Math.random()*purchaseHistory.length)
        const thirdPrizeWinner=purchaseHistory[randomIndex2].userId
        // randomly chose 1000 users, who bought the lottery
        let randomUsers=[]
        let length=purchaseHistory.length > 1000 ? 1000 : purchaseHistory.length
        for(let i=0;i<length;i++){
            const randomIndex=Math.floor(Math.random()*purchaseHistory.length)
            randomUsers.push(purchaseHistory[randomIndex].userId)
        }
        
        // make random users unique
        randomUsers=Array.from(new Set(randomUsers))

        // get the first prize winner
        const data={
            fivePercentOfTotalPerUser,
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

module.exports={
    drawLottery
}