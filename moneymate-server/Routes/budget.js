const express = require('express');
const Budget = require('../Models/BudgetModel');
const User = require('../Models/UserModel');
const router = express.Router();

router.post('/add-budget', async (req, res) => {
    const { email, category, amount, spent, period, startDate, endDate, alerts, alertThreshold } = req.body;
    if(!email){
        return res.status(400).json({ message: 'Please login first' });
    }

    try {
        const newBudget = new Budget({ 
            category, 
            amount, 
            spent: spent || 0, 
            period, 
            startDate, 
            endDate, 
            alerts, 
            alertThreshold 
        });
        const savedBudget = await newBudget.save();

        const user = await User.findOneAndUpdate(
            { email },
            { $push: { budgetIds: savedBudget._id } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found. Cannot save budget ID.' });
        }

        res.status(201).json(savedBudget);
    } catch (err) {
        res.status(500).json({ message: 'Error adding budget', error: err.message });
    }
});

router.get('/get-budgets/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const budgetIds = user.budgetIds;
        if (!budgetIds || budgetIds.length === 0) {
            return res.status(200).json([]);
        }
        const budgets = await Budget.find({
            _id: { $in: budgetIds }
        });
        res.status(200).json(budgets);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching budgets', error: err.message });
    }
});

router.put('/update-budget/:id', async (req, res) => {
    const { id } = req.params;
    const { category, amount, spent, period, startDate, endDate, alerts, alertThreshold } = req.body;

    try {
        const updatedBudget = await Budget.findByIdAndUpdate(
            id,
            { category, amount, spent, period, startDate, endDate, alerts, alertThreshold, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedBudget) {
            return res.status(404).json({ message: 'Budget not found.' });
        }

        res.status(200).json(updatedBudget);
    } catch (err) {
        res.status(500).json({ message: 'Error updating budget', error: err.message });
    }
});

router.delete('/delete-budget/:id', async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required to verify the user.' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const deletedBudget = await Budget.findByIdAndDelete(id);

        if (!deletedBudget) {
            return res.status(404).json({ message: 'Budget not found.' });
        }
        user.budgetIds = user.budgetIds.filter(budgetId => budgetId.toString() !== id);
        await user.save();

        res.status(200).json({ message: 'Budget deleted successfully.', deletedBudget });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting budget', error: err.message });
    }
});

module.exports = router;