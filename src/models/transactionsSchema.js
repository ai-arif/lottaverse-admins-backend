const mongoose=require('mongoose');
// type: 'debit',
// amount: totalAmount,
// description: 'Ticket purchase'
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