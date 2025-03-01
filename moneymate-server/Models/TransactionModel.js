const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
    },
    amount:{
        type:Number,
        required: true
    },
    description:{
        type:String,
        required:true
    },
    date: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

const Transaction = mongoose.model('Transactions', TransactionSchema);
module.exports = Transaction;
