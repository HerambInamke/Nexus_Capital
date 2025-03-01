const express = require('express');
const Transaction = require('../Models/TransactionModel');
const User = require('../Models/UserModel'); 
const router = express.Router();

router.post('/add-transaction', async (req, res) => {
    const { email, category, amount, description, date } = req.body;
    if(!email){
        return res.status(400).json({ message: 'Please login first' });
    }

    try {
        const newEntry = new Transaction({ category, amount, description, date });
        const savedEntry = await newEntry.save();

        const user = await User.findOneAndUpdate(
            { email },
            { $push: { transactionIds: savedEntry._id } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found. Cannot save entry ID.' });
        }

        res.status(201).json(savedEntry);
    } catch (err) {
        res.status(500).json({ message: 'Error adding entry', error: err.message });
    }
});

router.get('/get-transactions/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const transactionIds = user.transactionIds;
        if (!transactionIds || transactionIds.length === 0) {
            return res.status(200).json([]);
        }
        const transactions = await Transaction.find({
            _id: { $in: transactionIds }
        });
        res.status(200).json(transactions);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching transaction entries', error: err.message });
    }
});

router.put('/edit-transaction/:id', async (req, res) => {
    const { id } = req.params;
    const { category, amount, description, date } = req.body;

    if (!category || !amount || !description) {
        return res.status(400).json({ message: 'All fields are required to update the transaction.' });
    }

    try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            id,
            { category, amount, description, date, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedTransaction) {
            return res.status(404).json({ message: 'Transaction not found.' });
        }

        res.status(200).json(updatedTransaction);
    } catch (err) {
        res.status(500).json({ message: 'Error updating transaction', error: err.message });
    }
});

router.delete('/delete-transaction/:id', async (req, res) => {
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
        const deletedTransaction = await Transaction.findByIdAndDelete(id);

        if (!deletedTransaction) {
            return res.status(404).json({ message: 'Transaction not found.' });
        }
        user.transactionIds = user.transactionIds.filter(transactionId => transactionId.toString() !== id);
        await user.save();

        res.status(200).json({ message: 'Transaction deleted successfully.', deletedTransaction });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting transaction', error: err.message });
    }
});

module.exports = router;