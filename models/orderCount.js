const mongoose = require('mongoose');

const orderCountSchema = new mongoose.Schema({
  count: Number,
});

module.exports = mongoose.model('OrderCount', orderCountSchema);
