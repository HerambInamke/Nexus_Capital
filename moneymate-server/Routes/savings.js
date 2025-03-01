const express = require('express');
const Savings = require('../Models/SavingsModel');
const User = require('../Models/UserModel');
const router = express.Router();

router.post('/add-savings', async (req, res) => {
    const { email, name, targetAmount, currentAmount, targetDate, description, priority } = req.body;
    if(!email){
        return res.status(400).json({ message: 'Please login first' });
    }

    try {
        const newSavings = new Savings({ 
            name, 
            targetAmount, 
            currentAmount: currentAmount || 0, 
            targetDate, 
            description: description || '', 
            priority: priority || 'medium' 
        });
        const savedSavings = await newSavings.save();

        const user = await User.findOneAndUpdate(
            { email },
            { $push: { savingsIds: savedSavings._id } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found. Cannot save savings goal ID.' });
        }

        res.status(201).json(savedSavings);
    } catch (err) {
        res.status(500).json({ message: 'Error adding savings goal', error: err.message });
    }
});

router.get('/get-savings/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const savingsIds = user.savingsIds;
        if (!savingsIds || savingsIds.length === 0) {
            return res.status(200).json([]);
        }
        const savingsGoals = await Savings.find({
            _id: { $in: savingsIds }
        });
        res.status(200).json(savingsGoals);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching savings goals', error: err.message });
    }
});

router.put('/update-savings/:id', async (req, res) => {
    const { id } = req.params;
    const { name, targetAmount, currentAmount, targetDate, description, priority } = req.body;

    try {
        const updatedSavings = await Savings.findByIdAndUpdate(
            id,
            { name, targetAmount, currentAmount, targetDate, description, priority, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedSavings) {
            return res.status(404).json({ message: 'Savings goal not found.' });
        }

        res.status(200).json(updatedSavings);
    } catch (err) {
        res.status(500).json({ message: 'Error updating savings goal', error: err.message });
    }
});

router.delete('/delete-savings/:id', async (req, res) => {
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
        const deletedSavings = await Savings.findByIdAndDelete(id);

        if (!deletedSavings) {
            return res.status(404).json({ message: 'Savings goal not found.' });
        }
        user.savingsIds = user.savingsIds.filter(savingsId => savingsId.toString() !== id);
        await user.save();

        res.status(200).json({ message: 'Savings goal deleted successfully.', deletedSavings });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting savings goal', error: err.message });
    }
});

module.exports = router;