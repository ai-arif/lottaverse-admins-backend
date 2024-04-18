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

module.exports = { createLottery };
