const router = require("express").Router();
const { getLeaderboard } = require("../controllers/leaderboardController");
const verifyToken = require("../middleware/verifyToken");
const {
  getUsersDetails,
  registerUser,
  getUserDetails,
  
} = require("../controllers/registerController");
const {
  getReferralHierarchy,
  getReferralLevelCount,
} = require("../controllers/referralController");
const { createLottery,activeLotteries } = require("../controllers/createLottery");

router.get("/referral-hierarchy", verifyToken, getReferralHierarchy);
router.get("/referral-level-count", verifyToken, getReferralLevelCount);
router.get("/leaderboard", getLeaderboard);
router.get("/users", getUsersDetails);
router.get("/user", verifyToken, getUserDetails);

router.post("/register", registerUser);
router.post("/createlottery", createLottery);
router.get("/activelotteries", activeLotteries);

module.exports = router;
