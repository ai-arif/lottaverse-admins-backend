const mongoose = require("mongoose");

const lotterySchema = new mongoose.Schema(
  {
    lotteryOperator: String,
    ticketPrice: Number,
    maxTickets: Number,
    operatorCommissionPercentage: Number,
    expiration: Number,
    round:{
      type: Number,
      required: true,
      default: 1,
      min: 0
    },
    image: String,
    lotteryID: {
      type: Number,
      required: true,
      unique: true
    },
    totalPurchased: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    round: {
      type: Number,
      required: true,
      default: 1,
      min: 0
    },
    lotteryType: String,
    prizes: {
      firstPrize: Number,
      secondPrize: Number,
      thirdPrize: Number,
      // fourthPrize: Number,
      otherPrizes: Number,
    },
    transactionHash: String,
    isActive: Boolean,
    hasDraw: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lottery", lotterySchema);
