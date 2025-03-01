const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const authRoutes = require("./Routes/auth");
const transactionRoutes = require("./Routes/transaction");
const budgetRoutes = require("./Routes/budget");
const savingsRoutes = require("./Routes/savings");
const accountRoutes = require("./Routes/account");
const connectDB = require('./Configs/db');
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json())
app.use('/api/auth', authRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/account', accountRoutes);
app.get('/', (req, res) => {
  res.send('Welcome to the MoneyMate API!');
});
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});