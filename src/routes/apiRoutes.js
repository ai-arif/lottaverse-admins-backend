const router = require("express").Router();
const { getLeaderboard } = require("../controllers/leaderboardController");
const verifyToken = require("../middleware/verifyToken");
const {createLotteryDraw,getDrawHistory} = require("../controllers/drawLotteryController");
const {getCommissionHistory} = require('../controllers/commissionHistoryController');
const {
  getUsersDetails,
  registerUser,
  getUserDetails,
  
} = require("../controllers/registerController");
const {
  getReferralHierarchy,
  getReferralLevelCount,
} = require("../controllers/referralController");
const {
  createPurchaseHistory,
  getPurchaseHistory,
  prePurchase
} = require('../controllers/purchaseController')

const {withdraw, getWithdrawHistory} = require('../controllers/withdrawHistoryController')
const { createLottery,activeLotteries,getTypeWiseLottery,getLotteryResult } = require("../controllers/createLottery");

router.get("/referral-hierarchy", verifyToken, getReferralHierarchy);
router.get("/referral-level-count", verifyToken, getReferralLevelCount);
router.get("/leaderboard", getLeaderboard);
router.get("/users", getUsersDetails);
router.get("/user", verifyToken, getUserDetails);

router.post("/register", registerUser);
router.post("/createlottery", createLottery);
router.get("/lottery-type/:lotteryType", getTypeWiseLottery);
router.get("/lottery-winner/:id", getLotteryResult);
router.get("/activelotteries", activeLotteries);

router.post("/createpurchasehistory",verifyToken,createPurchaseHistory)
router.get("/purchasehistory",verifyToken,getPurchaseHistory)
router.post("/prepurchase",verifyToken,prePurchase)
router.get("/commissionhistory",verifyToken,getCommissionHistory)

router.post("/drawlottery",createLotteryDraw)
router.get("/drawhistory/:lotteryId",getDrawHistory)

router.post("/withdraw",verifyToken,withdraw)
router.get("/withdrawhistory",verifyToken,getWithdrawHistory)

module.exports = router; 
