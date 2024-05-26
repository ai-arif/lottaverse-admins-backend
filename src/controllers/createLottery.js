const Lottery = require("../models/lotterySchema");
const PurchaseHistory = require('../models/puchaseHistorySchema');
const sendResponse = require("../utils/sendResponse");
const moment = require("moment");
const ethers = require("ethers");

const createLottery = async (req, res) => {
  try {
    // api body accept params
    //    {
    // lotteryType: "",
    // expiry: "",
    // firstPrize: "",
    // secondPrize: "",
    // thirdPrize: "",
    // fourthPrize: "",
    // otherPrizes: "",
    // maxTicketCount: "",
    // ticketPrice: "",
    // operatorCommissionPercentage: "",
    // lotteryOperator: address,;
    // transactionHash
    //    }

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

    // Save to MongoDB
    const lottery = new Lottery({
      lotteryOperator,
      ticketPrice: ticketprice,
      maxTickets: maxTicketCount,
      operatorCommissionPercentage,
      expiration: unixEpochTime,
      lotteryID,
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


    
      

    

  
    sendResponse(res, 200, true, "Active lotteries", activeLotteries);
  } catch (error) {
    sendResponse(res, 500, false, error.message, error.message);
  }
};

module.exports = { createLottery, activeLotteries };
