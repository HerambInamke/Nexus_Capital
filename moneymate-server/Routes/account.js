const express = require('express');
const Account = require('../Models/AccountModel');
const User = require('../Models/UserModel');
const router = express.Router();

router.post('/add-account', async (req, res) => {
    const { 
        email, name, type, balance, currency, isDebt, 
        interestRate, dueDate, minimumPayment, creditLimit 
    } = req.body;
    
    if(!email){
        return res.status(400).json({ message: 'Please login first' });
    }

    try {
        const newAccount = new Account({ 
            name, type, balance, currency, isDebt,
            interestRate, dueDate, minimumPayment, creditLimit
        });
        const savedAccount = await newAccount.save();

        const user = await User.findOneAndUpdate(
            { email },
            { $push: { accountIds: savedAccount._id } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found. Cannot save account ID.' });
        }

        res.status(201).json(savedAccount);
    } catch (err) {
        res.status(500).json({ message: 'Error adding account', error: err.message });
    }
});

router.get('/get-accounts/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const accountIds = user.accountIds;
        if (!accountIds || accountIds.length === 0) {
            return res.status(200).json([]);
        }
        const accounts = await Account.find({
            _id: { $in: accountIds }
        });
        res.status(200).json(accounts);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching accounts', error: err.message });
    }
});

router.put('/update-account/:id', async (req, res) => {
    const { id } = req.params;
    const { 
        name, type, balance, currency, isDebt, 
        interestRate, dueDate, minimumPayment, creditLimit 
    } = req.body;

    try {
        const updatedAccount = await Account.findByIdAndUpdate(
            id,
            { 
                name, type, balance, currency, isDebt,
                interestRate, dueDate, minimumPayment, creditLimit,
                updatedAt: Date.now() 
            },
            { new: true }
        );

        if (!updatedAccount) {
            return res.status(404).json({ message: 'Account not found.' });
        }

        res.status(200).json(updatedAccount);
    } catch (err) {
        res.status(500).json({ message: 'Error updating account', error: err.message });
    }
});

router.delete('/delete-account/:id', async (req, res) => {
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
        const deletedAccount = await Account.findByIdAndDelete(id);

        if (!deletedAccount) {
            return res.status(404).json({ message: 'Account not found.' });
        }
        user.accountIds = user.accountIds.filter(accountId => accountId.toString() !== id);
        await user.save();

        res.status(200).json({ message: 'Account deleted successfully.', deletedAccount });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting account', error: err.message });
    }
});

module.exports = router;