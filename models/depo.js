// depoSchema.js

const mongoose = require('mongoose');

const depoSchema = new mongoose.Schema({
  depoWorld: String,
  botName: String,
  worldOwner: String,
});

module.exports = mongoose.model('Depo', depoSchema);
