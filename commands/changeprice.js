// changeprice.js

const Product = require('../models/product'); // Import your Product model (adjust the path as needed)
const config = require('../config.json');
const purchaseEmitter = require('../events/purchaseEmitter');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'changeprice',
  description: 'Change the price of a product',
  async execute(message, args) {
    // Check if the user executing the command has the allowed user ID
    if (!config.adminIds.includes(message.author.id)) {
      return message.reply('You do not have permission to use this command.');
    }

    // Check if there are enough arguments
    if (args.length < 2) {
      return message.reply('Please provide a product code and the new price.');
    }

    const code = args[0];
    const newPrice = parseFloat(args[1]);

    // Check if the new price is a valid number and greater than 0
    if (isNaN(newPrice) || newPrice <= 0) {
      return message.reply('Please provide a valid price greater than 0.');
    }

    try {
      // Find the product in the database by code
      const product = await Product.findOne({ code });

      if (!product) {
        return message.reply('This product does not exist.');
      }

      // Update the price of the product
      product.price = newPrice;
      await product.save();

      purchaseEmitter.emit('purchase');

      return message.reply({
  embeds: [
    new EmbedBuilder()
      .setColor('#0099ff')
      .setDescription(`The price of product **${code}** has been changed to **${newPrice}**.`)
  ]
});
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
