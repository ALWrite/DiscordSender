const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    unique: true,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  variations: {
    type: [String], // An array of product details (text or file names)
    default: [],    // Initialize as an empty array
  },
  type: {
    type: String,
    enum: ['yes', 'no', 'df'], // Add other product types as needed
    required: true,
  },
  roleToadd: {
    type: String, // Store the role ID (mentionable)
    required: true,
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
