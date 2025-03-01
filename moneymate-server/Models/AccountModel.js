const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['bank', 'cash', 'credit', 'digital'],
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    isDebt: {
        type: Boolean,
        default: false
    },
    interestRate: {
        type: Number
    },
    dueDate: {
        type: Date
    },
    minimumPayment: {
        type: Number
    },
    creditLimit: {
        type: Number
    }
}, { timestamps: true });

const Account = mongoose.model('Accounts', AccountSchema);
module.exports = Account;