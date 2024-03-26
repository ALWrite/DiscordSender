const User = require('../models/user'); // Import your User model
const { wlEmoji, desiredChannelId, specificUserId } = require('../config.json');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'messageCreate',
  once: false,
  execute: async (message, client) => {
    // Check if the message author is the specific user and in the desired channel
    if (message.author.id === specificUserId && message.channel.id === desiredChannelId) {
      const description = message.embeds[0].description;
      const growIDMatch = description.match(/GrowID: (\w+)/);
      const depositMatch = description.match(/Deposit: (\d+) (.*)/);

      if (growIDMatch && depositMatch) {
        const growID = growIDMatch[1];
        const depositAmount = parseInt(depositMatch[1]);
        const itemName = depositMatch[2]; // This captures the whole item name with spaces

        try {
          const itemValues = {
            "World Lock": 1,
            "Diamond Lock": 100,
            "Blue Gem Lock": 10000,
          };

          // Find the document with the matching GrowID in the database, ignoring case
          let user = await User.findOne({ growId: new RegExp(`^${growID}$`, 'i')});

          if (user) {
            // If the document exists and the item name is recognized, update the balance with the deposit amount
            if (itemValues[itemName]) {
              user.balance += depositAmount * itemValues[itemName];
              await user.save();

              message.reply(`Successfully Adding **${depositAmount}** **${itemName}** to **${growID}**\nYour new balance is **${user.balance}** ${wlEmoji}`);

              console.log(`Sent a success message: Successfully updated ${growID}'s balance by ${depositAmount} ${itemName}.`);
            } else {
              message.reply(`Unknown item name: ${itemName}`);
              console.log('Unknown item name');
            }
          } else {
            message.reply(`You are not registered. Please set your GrowID first.`);
            console.log('Not Registered');
          }
        } catch (error) {
          console.error('Error:', error);
          message.reply('Something went wrong.');
        }
      }
    }
  },
};