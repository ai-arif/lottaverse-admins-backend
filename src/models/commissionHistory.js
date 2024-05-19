const mongoose = require('mongoose');

const commissionHistory = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fromAddress: {
        type: String,
        required: true
    },
    toAddress: {
        type: String,
        required: true
    },
    ticketId: {
        type: String,
        required: true,
    },
    lotteryId:{
        type:Number,
        required:true
    },
    percentage: {
        type: Number,
        required: true
    },
    transactionHash:{
        type:String,
        required:false
    },
    amount: {
        type: Number,
        required: true
    },
    level:{
        type:Number,
        required:true
    }
}, { timestamps: true });

module.exports = mongoose.model('CommissionHistory', commissionHistory);