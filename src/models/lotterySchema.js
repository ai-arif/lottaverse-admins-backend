const mongoose = require("mongoose");

const lotterySchema = new mongoose.Schema({
  lotteryOperator: String,
  ticketPrice: Number,
  maxTickets: Number,
  operatorCommissionPercentage: String,
  expiration: Number,
  lotteryId: Number,
  prizes: {
    firstPrize: Number,
    secondPrize: Number,
    thirdPrize: Number,
    fourthPrize: Number,
    otherPrizes: Number,
  },
  transactionHash: String,
  isActive: Boolean,
  hasDraw: Boolean,
});

module.exports = mongoose.model("Lottery", lotterySchema);
