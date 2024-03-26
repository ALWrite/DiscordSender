const { Client, EmbedBuilder } = require('discord.js');
const User = require('../models/user'); // Import your User model (adjust the path as needed)
const { wlEmoji } = require('../config.json');

module.exports = {
  name: 'checkbal',
  description: 'Check the balance of a user',
  async execute(message, args) {
    // Check if there's a user mentioned in the message
    const userMention = message.mentions.users.first();

    if (!userMention) {
      return message.reply('Please mention a user to check their balance.');
    }

    try {
      // Find the mentioned user in the database by Discord ID
      const user = await User.findOne({ discordId: userMention.id });

      if (!user) {
        return message.reply('User not found in the database.');
      }

      return message.reply({
  embeds: [
    new EmbedBuilder()
      .setColor('#0099ff')
    .setTitle(`${userMention.tag}'s balance in this erver`)
      .setDescription(`**${userMention.tag}** has **${user.balance}** World lock ${wlEmoji}`)
  ]
});
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
