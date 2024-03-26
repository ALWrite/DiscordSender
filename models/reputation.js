// models/reputation.js
const mongoose = require('mongoose');

const reputationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  reputation: { type: Number, default: 0 },
});

module.exports = mongoose.model('Reputation', reputationSchema);
