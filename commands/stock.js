const { Client, EmbedBuilder } = require('discord.js');
const Product = require('../models/product'); // Import your Product model (adjust the path as needed)
const { stockChannelId } = require('../config.json');

module.exports = {
  name: 'stock',
  description: 'Display product stock information',
  async execute(message, args) {
    try {
      // Find all products in the database
      const products = await Product.find();

      if (products.length === 0) {
        return message.reply('No products found in the database.');
      }

      // Create a MessageEmbed to display product information
      const stockInfoEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setDescription(`You can see the current stock in <#${stockChannelId}> `)

      // Add information about each product to the embed

      // Send the MessageEmbed with product information
      message.reply({ embeds: [stockInfoEmbed] });
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
