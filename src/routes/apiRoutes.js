const router= require('express').Router();
const {getLeaderboard} = require('../controllers/leaderboardController');
// const {verifyToken} = require('../middleware/verifyToken');
const {getUserDetails,registerUser} = require('../controllers/registerController');

router.get('/leaderboard', getLeaderboard);
router.get('/user',  getUserDetails);
router.post('/register', registerUser);



module.exports = router;