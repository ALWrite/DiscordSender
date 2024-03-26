const { EmbedBuilder } = require('discord.js');
const Product = require('../models/product'); // Import your Product model (adjust the path as needed)
const config = require('../config.json');
const purchaseEmitter = require('../events/purchaseEmitter');

module.exports = {
  name: 'changename',
  description: 'Change the name of a product',
  async execute(message, args) {
    // Check if the user executing the command has the allowed user ID
    if (!config.adminIds.includes(message.author.id)) {
      return message.reply('You do not have permission to use this command.');
    }

    // Check if there are enough arguments
    if (args.length < 2) {
      return message.reply('Please provide a product code and the new name.');
    }

    const code = args[0];
    const newName = args.slice(1).join(' '); // Combine all arguments beyond the product code

    // Check if the new name is provided
    if (!newName) {
      return message.reply('Please provide a new name for the product.');
    }

    try {
      // Find the product in the database by code
      const product = await Product.findOne({ code });

      if (!product) {
        return message.reply('This product does not exist.');
      }

      // Update the name of the product
      product.name = newName;
      await product.save();

      purchaseEmitter.emit('purchase');

      return message.reply({
  embeds: [
    new EmbedBuilder()
      .setColor('#0099ff')
      .setDescription(`The name of product **${code}** has been changed to **${newName}**.`)
  ]
});
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
