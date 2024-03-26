const { Client } = require('discord.js');
const User = require('../models/user');
const { EmbedBuilder } = require('discord.js');
const { prefix } = require('../config.json');

module.exports = {
  name: 'set',
  description: 'Set your GrowID.',
  execute(message, args) {
    // Check if there's a GrowID provided in the command
    if (args.length < 1) {
      return message.reply(`**Please provide your GrowID after the** **__${prefix}set__** **command.**`)
    } else {
      const growID = args[0]; // Extract the provided GrowID from args
      const discordId = message.author.id; // Get the user's Discord ID

      // Check if the user already exists in the database
      User.findOne({ discordId })
        .then((user) => {
          if (user) {
            // If the user exists, update their GrowID
            user.growId = growID;
            user.save();
            message.reply(`Successfully updating your GrowID to ${growID}.`);
          } else {
            // If the user does not exist, create a new user
            const newUser = new User({
              discordId,
              discordTag: message.author.tag,
              growId: growID,
              balance: 0, // You can set an initial balance here
            });
            newUser.save();
            const depoEmbed = new EmbedBuilder()
        .setColor('Random')
        .setDescription(`*_Welcome! Your GrowID is now set to_* **${growID}**`)

   message.reply({ embeds: [depoEmbed] });
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          message.reply('Something went wrong.');
        });
    }
  },
};
