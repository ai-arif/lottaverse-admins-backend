const mongoose = require('mongoose');

const purchaseHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ticketId: {
        type: String,
        required: true,
        unique: true
    },
    lotteryId:{
        type:Number,
        required:true
    },
    lotteryPackage:{
        type:String,
    },
    ticketQuantity: {
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
    }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseHistory', purchaseHistorySchema);