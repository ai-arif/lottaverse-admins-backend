const router= require('express').Router();
const {getLeaderboard} = require('../controllers/leaderboardController');

router.get('/leaderboard', getLeaderboard);


module.exports = router;