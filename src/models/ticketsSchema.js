const mongoose = require('mongoose');
const ticketSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ticketId: {
        type: String,
        required: true
    },
    ticketType: {
        type: String,
        required: true
    },
    ticketPrice: {
        type: Number,
        required: true
    },
    ticketQuantity: {
        type: Number,
        required: true
    },
},{timestamps:true});

module.exports = mongoose.model('Ticket', ticketSchema);