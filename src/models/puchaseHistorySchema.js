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
        unique: true,
        trim: true
    },
    ticketString:{
        type:String,
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
        required: true,
        min: 1,
        default: 1
    },
    transactionHash:{
        type:String,
        required:false
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseHistory', purchaseHistorySchema);