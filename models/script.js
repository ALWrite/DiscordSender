const mongoose = require('mongoose');

const scriptSchema = new mongoose.Schema({ 
 name: String,
  code: String,
  price: Number,
  stock: Number,
  type: String, // Add the type field to the schema
  variations: [String], // For storing script details or account variations
});

module.exports = mongoose.model('Script', scriptSchema);