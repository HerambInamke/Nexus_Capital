const mongoose = require('mongoose');

const SavingsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    targetAmount: {
        type: Number,
        required: true
    },
    currentAmount: {
        type: Number,
        default: 0
    },
    targetDate: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    }
}, { timestamps: true });

const Savings = mongoose.model('Savings', SavingsSchema);
module.exports = Savings;