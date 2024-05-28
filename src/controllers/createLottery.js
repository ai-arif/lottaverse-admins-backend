const Lottery = require("../models/lotterySchema");
const PurchaseHistory = require('../models/puchaseHistorySchema');
const LotteryDraw = require('../models/lotteryDrawSchema');
const sendResponse = require("../utils/sendResponse");
const moment = require("moment");
const ethers = require("ethers");

function formatAddress(address) {
  // Check if the address is long enough
  if (address.length <= 6) {
    return address; // No need to format if address is too short
  }

  // Extract the first 3 and last 3 characters
  const firstPart = address.slice(0, 4);
  const lastPart = address.slice(-4);

  // Return the formatted address
  return `${firstPart}***${lastPart}`;
}
const createLottery = async (req, res) => {
  try {
    
    const {
      lotteryOperator,
      ticketPrice,
      maxTicketCount,
      operatorCommissionPercentage,
      expiry,
      lotteryID,
      lotteryType,
      firstPrize,
      secondPrize,
      thirdPrize,
      // fourthPrize,
      otherPrizes,
      transactionHash,
    } = req.body;

    const unixEpochTime = moment(expiry).unix();

    const ticketprice = Number(ethers.parseUnits(ticketPrice.toString(), 6));
    const firstprize = Number(ethers.parseUnits(firstPrize.toString(), 6));
    const secondprize = Number(ethers.parseUnits(secondPrize.toString(), 6));
    const thirdprize = Number(ethers.parseUnits(thirdPrize.toString(), 6));
    // const fourthprize = Number(ethers.parseUnits(fourthPrize.toString(), 6));
    const otherprize = Number(ethers.parseUnits(otherPrizes.toString(), 6));
    console.log("THis is ticket prize", ticketprice);
    const prizes = {
      firstPrize: firstprize,
      secondPrize: secondprize,
      thirdPrize: thirdprize,
      // fourthPrize: fourthprize,
      otherPrizes: otherprize,
    };

    // Calling the smart contract functions
    // const accounts = await web3.eth.getAccounts();
    // await contract.methods
    //   .createLottery(
    //     lotteryOperator,
    //     ticketPrice,
    //     maxTickets,
    //     operatorCommissionPercentage,
    //     expiration,
    //     lotteryId
    //   )
    //   .send({ from: accounts[0] });
    const lotteryExists = await Lottery.findOne({lotteryType})
    let round=1;
    if(lotteryExists){
      round=lotteryExists.round+1;
    }
    // Save to MongoDB
    const lottery = new Lottery({
      lotteryOperator,
      ticketPrice: ticketprice,
      maxTickets: maxTicketCount,
      operatorCommissionPercentage,
      expiration: unixEpochTime,
      lotteryID,
      round,
      lotteryType,
      prizes,
      transactionHash,
      isActive: true,
      hasDraw: false,
    });
    console.log(lottery);
    // console.log("HH", JSON.stringify(lottery));
    const result = await lottery.save();
    console.log(result);
    sendResponse(res, 200, true, "Lottery created successfully", result);

    // res.send("Lottery created successfully!");
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, false, "Internal server error", error.message);
    // res.status(500).send(error.toString());
  }
};

const activeLotteries = async (req, res) => {
  try {


    // const activeLotteries = await Lottery.aggregate([
    //   { $match: { isActive: true } }, 
    //   { $sort: { createdAt: -1 } }, 
    //   { $group: { _id: "$lotteryType", count: { $sum: 1 } } },
    //   { $limit: 2 },
    // ]);
    const recentActiveLotteries = await Lottery.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(2)
      .lean(); // .lean() to get plain JavaScript objects

    if (recentActiveLotteries.length === 0) {
      return res.status(200).json({ message: 'No active lotteries found.' });
    }

    // Extract the lottery types from the retrieved documents
    const lotteryTypes = recentActiveLotteries.map(lottery => lottery.lotteryType);

    // Step 2: Group and count the rounds based on the lotteryType of the retrieved lotteries
    const roundCounts = await Lottery.aggregate([
      { $match: { lotteryType: { $in: lotteryTypes } } },
      { $group: { _id: "$lotteryType", count: { $sum: 1 } } }
    ]);

    // Combine the round counts with the lottery information
    const activeLotteries = recentActiveLotteries.map(lottery => {
      const roundCount = roundCounts.find(count => count._id === lottery.lotteryType);
      return {
        ...lottery,
        roundCount: roundCount ? roundCount.count : 0
      };
    });
    // get number of users who have bought tickets for the lottery
    const lotteryIds = activeLotteries.map(lottery => lottery.lotteryID);
    // userId  count the unique number of users who have bought tickets for the lottery
    const userCounts = await PurchaseHistory.aggregate([
      { $match: { lotteryId: { $in: lotteryIds } } },
      { $group: { _id: { lotteryId: "$lotteryId", userId: "$userId" } } }, // Group by both lotteryId and userId to ensure uniqueness
      { $group: { _id: "$_id.lotteryId", count: { $sum: 1 } } } // Count unique users per lottery
    ]);

    // Combine the user counts with the lottery information
    activeLotteries.forEach(lottery => {
      const userCount = userCounts.find(count => count._id === lottery.lotteryID);
      lottery.userCount = userCount ? userCount.count : 0;
    });
    // hasDraw check if the lottery has been drawn, then get the second, third and first one from the random winners
    const lotteryDraws = await LotteryDraw.find({ lotteryId: { $in: lotteryIds } })
      .populate({
        path: 'secondWinner.userId',
        select: 'address'
      })
      .populate({
        path: 'thirdWinner.userId',
        select: 'address'
      })
      .populate({
        path: 'randomWinners.userId',
        select: 'address',
        options: { limit: 1 } // Limit to the first random winner
      });

    activeLotteries.forEach(lottery => {
      const lotteryDraw = lotteryDraws.find(draw => draw.lotteryId === lottery.lotteryID);
      if (lotteryDraw) {
        lottery.hasDraw = true;

        // Ensure ticketId is handled properly for second and third winners
        lottery.secondWinner = lotteryDraw.secondWinner ? {
          ticketId: lotteryDraw.secondWinner.ticketId || null,
          address: formatAddress(lotteryDraw.secondWinner.userId.address)
        } : null;

        lottery.thirdWinner = lotteryDraw.thirdWinner ? {
          ticketId: lotteryDraw.thirdWinner.ticketId || null,
          address: formatAddress(lotteryDraw.thirdWinner.userId.address)
        } : null;

        // Handle random winner properly
        if (lotteryDraw.randomWinners && lotteryDraw.randomWinners.length > 0) {
          lottery.randomWinner = {
            ticketId: lotteryDraw.randomWinners[0].ticketId || null,
            address: formatAddress(lotteryDraw.randomWinners[0].userId.address)
          };
        } else {
          lottery.randomWinner = null;
        }
      } else {
        lottery.hasDraw = false;
        lottery.firstWinner = null;
        lottery.secondWinner = null;
        lottery.thirdWinner = null;
        lottery.randomWinner = null;
      }
    });
    sendResponse(res, 200, true, "Active lotteries", activeLotteries);
  } catch (error) {
    sendResponse(res, 500, false, error.message, error.message);
  }
};

const getRoundAndTypeWiseHistory=async(req,res)=>{
  try{
    const {lotteryType, round}=req.body;
    // there are multiple lotteries with the same type, so we need to get the lotteryId of the lottery
    const lotteries=await Lottery.find({lotteryType:lotteryType});
  }
  catch{
    sendResponse(res, 500, false, error.message, error.message);
  }
}

// get type wise lottery
const getTypeWiseLottery=async(req,res)=>{
  try{
    const {lotteryType}=req.params;
    const lotteries=await Lottery.find({lotteryType:lotteryType});
    sendResponse(res, 200, true, "Lotteries", lotteries);
  }
  catch{
    sendResponse(res, 500, false, error.message, error.message);
  }
}
// get round wise lottery
const getLotteryResult=async(req,res)=>{
  try{
    const {id}=req.params;
    const lottery=await Lottery.findOne({_id:id});
    const lotteryDraw=await LotteryDraw.findOne({lotteryId:lottery.lotteryID});
    // sendResponse(res, 200, true, "Lottery Draw", lotteryDraw);
    // if not drawn, return error message
    if(!lotteryDraw){
      sendResponse(res, 200, true, "Lottery Draw", "Lottery not drawn yet");
    }
    // get all the winners in an array
    let winners=[];
    // secondWinner, thirdWinner, randomWinners
    if(lotteryDraw.secondWinner){
      winners.push(lotteryDraw.secondWinner);
    }
    if(lotteryDraw.thirdWinner){
      winners.push(lotteryDraw.thirdWinner);
    }
    if(lotteryDraw.randomWinners){
      winners.push(...lotteryDraw.randomWinners);
    }
    sendResponse(res, 200, true, "Lottery Draw", winners);


  }
  catch{
    sendResponse(res, 500, false, error.message, error.message);
  }
}


module.exports = { createLottery, activeLotteries,getTypeWiseLottery,getLotteryResult };
