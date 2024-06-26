const mongoose=require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    }
},{timestamps:true});

module.exports = mongoose.model('Transaction', transactionSchema);