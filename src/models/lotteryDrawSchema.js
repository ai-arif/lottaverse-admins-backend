const mongoose = require('mongoose');

const lotteryDrawSchema = new mongoose.Schema({
    lottery: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lottery',
    },
    lotteryId: {
        type: Number,
        required: true
    },
    drawDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    leaders: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        payout: {
            type: Number,
            required: true
        },
        percentage: {
            type: Number,
            default: null
        },
        amount: {
            type: Number,
            default: null
        }
    }],
    secondWinner: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        percentage: {
            type: Number,
            default: null
        },
        amount: {
            type: Number,
            default: null
        }
    },
    thirdWinner: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        percentage: {
            type: Number,
            default: null
        },
        amount: {
            type: Number,
            default: null
        }
    },
    premiumUsers: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        percentage: {
            type: Number,
            default: null
        },
        amount: {
            type: Number,
            default: null
        }
    }],
    randomWinners: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        percentage: {
            type: Number,
            default: null
        },
        amount: {
            type: Number,
            default: null
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('LotteryDraw', lotteryDrawSchema);
