const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  transactionIds: {type: Array, default: []},
  budgetIds: {type: Array, default: []},
  savingsIds: {type: Array, default: []},
  accountIds: {type: Array, default: []}
});
const User = mongoose.model('User', UserSchema);
module.exports = User;