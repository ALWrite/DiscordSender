const Product = require('../models/product'); // Import your Product model (adjust the path as needed)
const config = require('../config.json');
const purchaseEmitter = require('../events/purchaseEmitter');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'removeproduct',
  description: 'Remove a product and its stock',
  async execute(message, args) {
    if (!config.adminIds.includes(message.author.id)) {
      return message.reply('You do not have permission to use this command.');
    }
    // Check if there are enough arguments
    if (args.length < 1) {
      return message.reply('Please provide the product code to remove.');
    }

    const productCode = args[0];

    try {
      // Find the product in the database by code
      const product = await Product.findOne({ code: productCode });

      if (!product) {
        return message.reply('This product does not exist.');
      }

      // Get the product name for reference
      const productName = product.name;

      // Remove the product (including name, code, stock, and accounts) from the database
      await Product.deleteOne({ code: productCode });

      // Check if there are any products left in the database
      const remainingProducts = await Product.countDocuments();

      if (remainingProducts === 0) {
        // If there are no products left, emit a "noProductsLeft" event or take appropriate action
        purchaseEmitter.emit('noProductsLeft');
      } else {
        // Otherwise, emit the "purchase" event
        purchaseEmitter.emit('purchase');
      }

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#0099ff')
            .setDescription(`Successfully removed the product **${productName}** from the database.`),
        ],
      });
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
