const router= require('express').Router();
const {getLeaderboard} = require('../controllers/leaderboardController');
const verifyToken = require('../middleware/verifyToken');
const {getUsersDetails,registerUser,getUserDetails} = require('../controllers/registerController');
const {getReferralHierarchy}=require('../controllers/referralController');


router.get('/referral-hierarchy',verifyToken, getReferralHierarchy);
router.get('/leaderboard', getLeaderboard);
router.get('/users',  getUsersDetails);
router.get('/user', getUserDetails);

router.post('/register', registerUser);



module.exports = router;