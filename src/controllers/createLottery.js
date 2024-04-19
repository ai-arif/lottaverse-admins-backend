const Lottery = require("../models/lotterySchema");
const sendResponse = require("../utils/sendResponse");
const moment = require("moment");

// const contract = require("./lotteryContract");
// const web3 = require("./web3Config");

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
      lotteryType,
      firstPrize,
      secondPrize,
      thirdPrize,
      fourthPrize,
      otherPrizes,
      transactionHash,
    } = req.body;

    const unixEpochTime = moment(expiry).unix();

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
      ticketPrice,
      maxTickets: maxTicketCount,
      operatorCommissionPercentage,
      expiration: unixEpochTime,
      lotteryId: lotteryType,
      prizes: {
        firstPrize,
        secondPrize,
        thirdPrize,
        fourthPrize,
        otherPrizes,
      },
      transactionHash,
      isActive: true,
      hasDraw: false,
    });
    console.log(lottery);
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
    // Get active lotteries with different lotteryId, last 3 
    const activeLotteries = await Lottery.find({
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .limit(3);

    // Count lotteries for each round
    const roundZero = await Lottery.countDocuments({
      lotteryId: { $mod: [3, 0] },
    });

    const roundOne = await Lottery.countDocuments({
      lotteryId: { $mod: [3, 1] },
    });

    const roundTwo = await Lottery.countDocuments({
      lotteryId: { $mod: [3, 2] },
    });

    // Map through activeLotteries to add round numbers to each lottery
    const lotteriesWithRound = activeLotteries.map((lottery) => {
      if (lottery.lotteryId % 3 === 0) {
        return { ...lottery.toObject(), round: roundZero };
      } else if (lottery.lotteryId % 3 === 1) {
        return { ...lottery.toObject(), round: roundOne };
      } else {
        return { ...lottery.toObject(), round: roundTwo };
      }
    });

    

    // Send response with lotteries including round numbers
    sendResponse(res, 200, true, "Active lotteries", lotteriesWithRound);
  } catch (error) {
    sendResponse(res, 500, false, error.message, error.message);
  }
};


module.exports = { createLottery,activeLotteries };
