// changecode.js

const Product = require('../models/product'); // Import your Product model (adjust the path as needed)
const config = require('../config.json');
const { EmbedBuilder } = require('discord.js');
const purchaseEmitter = require('../events/purchaseEmitter');

module.exports = {
  name: 'changecode',
  description: 'Change the code of a product',
  async execute(message, args) {
    // Check if the user executing the command has the allowed user ID
    if (!config.adminIds.includes(message.author.id)) {
      return message.reply('You do not have permission to use this command.');
    }

    // Check if there are enough arguments
    if (args.length < 2) {
      return message.reply('Please provide the current product code and the new code.');
    }

    const currentCode = args[0];
    const newCode = args[1];

    // Check if the new code is provided
    if (!newCode) {
      return message.reply('Please provide a new code for the product.');
    }

    try {
      // Find the product in the database by the current code
      const product = await Product.findOne({ code: currentCode });

      if (!product) {
        return message.reply('The product with the current code does not exist.');
      }

      // Check if the new code already exists in the database
      const existingProduct = await Product.findOne({ code: newCode });

      if (existingProduct) {
        return message.reply('A product with the new code already exists.');
      }

      // Update the code of the product
      product.code = newCode;
      await product.save();

      purchaseEmitter.emit('purchase');

      return message.reply({
  embeds: [
    new EmbedBuilder()
      .setColor('#0099ff')
      .setDescription(`The code of product **${currentCode}** has been changed to **${newCode}**.`)
  ]
});
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
