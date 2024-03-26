const Product = require('../models/product'); // Import your Product model (adjust the path as needed);
const config = require('../config.json');
const purchaseEmitter = require('../events/purchaseEmitter');

module.exports = {
  name: 'removestock',
  description: 'Remove stock to an existing product',
  async execute(message, args) {
    // Check if the user executing the command has the allowed user ID
    if (!config.adminIds.includes(message.author.id)) {
      return message.reply('You do not have permission to use this command.');
    }

    // Check if there are enough arguments
    if (args.length < 2) {
      return message.reply('Please provide the product code and the quantity of stock to add.');
    }

    const code = args[0];
    const quantityToAdd = parseInt(args[1]);

    if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
      return message.reply('Please provide a valid quantity greater than 0.');
    }

    try {
      // Find the product in the database by code
      const product = await Product.findOne({ code });

      if (!product) {
        return message.reply('Product not found. Make sure to provide the correct product code.');
      }

      // Increment the stock by the specified quantity
      product.stock -= quantityToAdd;

      await product.save();

      purchaseEmitter.emit('purchase');

      return message.reply(`Stock Removed successfully.`);
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
