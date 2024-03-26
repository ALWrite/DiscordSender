const { Client } = require('discord.js');
const User = require('../models/user'); // Import your User model (adjust the path as needed)
const config = require('../config.json');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'removebal',
  description: 'Remove balance from a user',
  async execute(message, args) {
    // Check if there's a user mentioned in the message
    const userMention = message.mentions.users.first();

    // Check if the user executing the command has permission to add balance (e.g., admins)
    if (!config.adminIds.includes(message.author.id)) {
      return message.reply('You do not have permission to use this command.');
    }

    if (!userMention) {
      return message.reply('Please mention a user to remove balance from.');
    }

    // Check if the specified amount to remove is a valid number
    if (args.length < 2 || isNaN(args[1])) {
      return message.reply('Please provide a valid amount to remove.');
    }

    const amountToRemove = parseFloat(args[1]);

    try {
      // Find the mentioned user in the database by Discord ID
      const user = await User.findOne({ discordId: userMention.id });

      if (!user) {
        return message.reply('User not found in the database.');
      }

      // Check if the user has enough balance to remove
      if (user.balance < amountToRemove) {
        return message.reply(`User ${userMention.tag} does not have enough balance to remove ${amountToRemove}.`);
      }

      // Remove the specified amount from the user's balance
      user.balance -= amountToRemove;
      await user.save();

    return message.reply({
  embeds: [
    new EmbedBuilder()
      .setColor('#0099ff')
      .setDescription(`Removed **${amountToRemove}**${config.wlEmoji} from ${userMention.tag}'s balance.\nNew balance: **${user.balance}** ${config.wlEmoji}`)
  ]
});
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
      