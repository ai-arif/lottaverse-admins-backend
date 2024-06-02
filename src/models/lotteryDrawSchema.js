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
        commission_sent: {
            type: Boolean,
            default: false
        },
        amount: {
            type: Number,
            default: null
        }
    }],
    firstWinner: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        commission_sent: {
            type: Boolean,
            default: false
        },
        ticketId: {
            type: String,
            trim: true
        }, 
        ticketString: {
            type: String,
            trim: true
        },    
        amount: {
            type: Number,
            default: null
        },
    },
    secondWinner: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        commission_sent: {
            type: Boolean,
            default: false
        },
        ticketId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        }, 
        ticketString: {
            type: String,
            // required: true,
            // unique: true,
            trim: true
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
        commission_sent: {
            type: Boolean,
            default: false
        },
        ticketId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        ticketString: {
            type: String,
            // required: true,
            // unique: true,
            trim: true
        },
        amount: {
            type: Number,
            default: null
        }
    },
    randomWinners: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        commission_sent: {
            type: Boolean,
            default: false
        },
        amount: {
            type: Number,
            default: null
        },
        ticketId: {
            type: String,
            // required: true,
            // unique: true,
            trim: true
        },
        ticketString: {
            type: String,
            // required: true,
            // unique: true,
            trim: true
        },
    }]
}, { timestamps: true });

module.exports = mongoose.model('LotteryDraw', lotteryDrawSchema);
