const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true
    },
    spent: {
        type: Number,
        default: 0
    },
    period: {
        type: String,
        enum: ['weekly', 'monthly', 'yearly'],
        default: 'monthly'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    alerts: {
        type: Boolean,
        default: true
    },
    alertThreshold: {
        type: Number,
        default: 80
    }
}, { timestamps: true });

const Budget = mongoose.model('Budgets', BudgetSchema);
module.exports = Budget;