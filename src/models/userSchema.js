const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    address: {
        type: String,
        unique: true,
        required: true
    },
    totalBalance: {
        type: Number,
        required: true,
        default: 0
    },
    transactions: {
        type: Array,
        required: true,
        default: []
    },
    availableBalance: {
        type: Number,
        required: true,
        default: 0
    },
    payout: {
        type: Number,
        required: true,
        default: 0
    },
    referralId: {
        type: String,
        unique: true
    },
    referralLevel: {
        type: Number,
        required: true,
        default: 0
    },
    referredUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
