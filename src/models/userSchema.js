const mongoose=require('mongoose');
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
    }
},{timestamps:true});

module.exports = mongoose.model('User', userSchema);