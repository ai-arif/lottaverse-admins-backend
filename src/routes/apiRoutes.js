const router= require('express').Router();
const {getLeaderboard} = require('../controllers/leaderboardController');
const {verifyToken} = require('../middleware/verifyToken');
const {getUsersDetails,registerUser} = require('../controllers/registerController');
const {getReferralHierarchy}=require('../controllers/referralController');

router.get('/referral-hierarchy', getReferralHierarchy);
router.get('/leaderboard', getLeaderboard);
router.get('/users',  getUsersDetails);
router.post('/register', registerUser);



module.exports = router;