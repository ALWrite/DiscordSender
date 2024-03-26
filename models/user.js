const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  discordId: String,
  discordTag: String,
  growId: String,
  createdAt: Date,
  balance: Number // You can add any other fields you need
});

module.exports = mongoose.model('User', userSchema);