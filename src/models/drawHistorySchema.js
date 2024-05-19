const mongoose = require('mongoose');

// Define the schema for lottery draw history
const drawHistorySchema = new mongoose.Schema({
    lottery: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lottery'
    },
    lotteryID: {
        type: Number,
        required: true
    },
    winners: {
        firstPrize: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        secondPrize: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        thirdPrize: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        top30Leaders: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        randomUsers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    drawDate: {
        type: Date,
        default: Date.now
    }
});

// Create a Mongoose model for draw history
const DrawHistory = mongoose.model('DrawHistory', drawHistorySchema);

module.exports = DrawHistory;
