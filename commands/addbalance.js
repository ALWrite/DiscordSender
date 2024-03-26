const { Client } = require('discord.js');
const User = require('../models/user');// Import your User model (adjust the path as needed)
const config = require('../config.json');

module.exports = {
  name: 'addbal',
  description: 'Add balance to a user',
  async execute(message, args) {
    // Check if there's a user mentioned in the message
    const userMention = message.mentions.users.first();

    if (!config.adminIds.includes(message.author.id)) {
      return message.reply('You do not have permission to use this command.');
    }
    
    if (!userMention) {
      return message.reply('Please mention a user to add balance to.');
    }

    // Check if the specified amount to add is a valid number
    if (args.length < 2 || isNaN(args[1])) {
      return message.reply('Please provide a valid amount to add.');
    }

    const amountToAdd = parseFloat(args[1]);

    try {
      // Find the mentioned user in the database by Discord ID
      const user = await User.findOne({ discordId: userMention.id });

      if (!user) {
        return message.reply('User not found in the database.');
      }

      // Add the specified amount to the user's balance
      user.balance += amountToAdd;
      await user.save();

      return message.reply(`Added **${amountToAdd}** to ${userMention.tag}'s balance.\nNew balance: **${user.balance}** ${config.wlEmoji}`);
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
