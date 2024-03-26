// depo.js

const { EmbedBuilder } = require('discord.js');
const Depo = require('../models/depo');
const { emoji2, emoji3, emoji1 } = require('../config.json')


module.exports = {
  name: 'depo',
  description: 'Retrieve and display depo information',
  async execute(message, args) {
    try {
      // Retrieve depo information from the database
      const depoInfo = await Depo.findOne();

      if (!depoInfo) {
        return message.reply('Depo information has not been set.');
      }

      // Create an embed to display depo information
      const depoEmbed = new EmbedBuilder()
        .setColor('Random')
        .setTitle('Depo Information')
        .setDescription(`${emoji3}  World: **${depoInfo.depoWorld}**
${emoji1}  Owner: **${depoInfo.worldOwner}**
${emoji2}  Bot Name: **${depoInfo.botName}**`)

      return message.reply({ embeds: [depoEmbed] });
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
