const LotteryDraw = require('../../models/lotteryDrawSchema');
const User = require('../../models/userSchema');
const Lottery = require('../../models/lotterySchema');
const sendResponse = require('../../utils/sendResponse');

// 
const sendSecondWinnerCommission = async (req, res) => {
    try {
      const { lotteryId } = req.params;
  
      const lotteryDraw = await LotteryDraw.findOne({ lotteryId });
  
      if (!lotteryDraw || !lotteryDraw.secondWinner) {
        return sendResponse(res, 404, false, 'Second winner not found or commission already sent');
      }
  
      const secondWinner = lotteryDraw.secondWinner;
  
      if (secondWinner.commission_sent) {
        return sendResponse(res, 400, false, 'Commission already sent to the second winner');
      }
  
      // Logic to send commission
      // Example: await sendCommissionToUser(secondWinner.userId, secondWinner.amount);
  
      secondWinner.commission_sent = true;

      await lotteryDraw.save();
    //   userId increment the userId's jackpotEarnings by the amount of the secondWinner, and then save the user, get the amount from Lottery schema ,lottery.prizes.secondPrize
        const lottery = await Lottery.findOne({ lotteryId });
      const user = await User.findById(secondWinner.userId);
        user.jackpotEarnings += lottery.prizes.secondPrize;
        await user.save();
  
      sendResponse(res, 200, true, 'Commission sent to second winner', secondWinner);
    } catch (error) {
      sendResponse(res, 500, false, error.message, error.message);
    }
  };
  

  const sendThirdWinnerCommission = async (req, res) => {
    try {
      const { lotteryId } = req.params;
  
      const lotteryDraw = await LotteryDraw.findOne({ lotteryId });
  
      if (!lotteryDraw || !lotteryDraw.thirdWinner) {
        return sendResponse(res, 404, false, 'Third winner not found or commission already sent');
      }
  
      const thirdWinner = lotteryDraw.thirdWinner;
  
      if (thirdWinner.commission_sent) {
        return sendResponse(res, 400, false, 'Commission already sent to the third winner');
      }
  
      // Logic to send commission
      // Example: await sendCommissionToUser(thirdWinner.userId, thirdWinner.amount);
  
      thirdWinner.commission_sent = true;
      await lotteryDraw.save();

        const lottery = await Lottery.findOne({ lotteryId });
        const user = await User.findById(thirdWinner.userId);
        user.jackpotEarnings += lottery.prizes.thirdPrize;
        await user.save();

  
      sendResponse(res, 200, true, 'Commission sent to third winner', thirdWinner);
    } catch (error) {
      sendResponse(res, 500, false, error.message, error.message);
    }
  };

  const sendRandomWinnersCommission = async (req, res) => {
    try {
      const { lotteryId } = req.params;
      const { addresses } = req.body; // Array of addresses
  
      const lotteryDraw = await LotteryDraw.findOne({ lotteryId }).populate('randomWinners.userId');
  
      if (!lotteryDraw || !lotteryDraw.randomWinners || lotteryDraw.randomWinners.length === 0) {
        return sendResponse(res, 404, false, 'Random winners not found or commission already sent');
      }
  
      const winnersToUpdate = lotteryDraw.randomWinners.filter(winner =>
        addresses.includes(winner.userId.address) && !winner.commission_sent
      );
  
      if (winnersToUpdate.length === 0) {
        return sendResponse(res, 400, false, 'No random winners to update or commission already sent');
      }
  
      for (const winner of winnersToUpdate) {
        winner.commission_sent = true;
      }
      
      await lotteryDraw.save();
      sendResponse(res, 200, true, 'Commission sent to random winners', winnersToUpdate);
    } catch (error) {
      sendResponse(res, 500, false, error.message, error.message);
    }
  };

    module.exports = {
        sendSecondWinnerCommission,
        sendThirdWinnerCommission,
        sendRandomWinnersCommission
    };