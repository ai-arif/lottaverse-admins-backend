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
        const {lotteryID}=req.body
        // get top 30 maximum payout users
        const top30Users=await User.find().sort({payout:-1}).limit(30)
        // randomly chose second prize winner between the users who bought the lottery use purchaseHistory
        const purchaseHistory=await PurchaseHistory.find({lotteryID})
        const randomIndex=Math.floor(Math.random()*purchaseHistory.length)
        const secondPrizeWinner=purchaseHistory[randomIndex].userID
        // randomly chose third prize winner between the users who bought the lottery use purchaseHistory
        const randomIndex2=Math.floor(Math.random()*purchaseHistory.length)
        const thirdPrizeWinner=purchaseHistory[randomIndex2].userID
        // randomly chose 1000 users, who bought the lottery
        const randomUsers=[]
        for(let i=0;i<1000;i++){
            const randomIndex=Math.floor(Math.random()*purchaseHistory.length)
            randomUsers.push(purchaseHistory[randomIndex].userID)
        }
        // which fields we are working on in the lottery schema

    } catch (error) {
        
    }
}