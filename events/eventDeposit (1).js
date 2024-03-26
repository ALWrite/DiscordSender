const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const { thumbnailURL, imageURL, wlEmoji, emoji1, emoji2, emoji3, StoreName } = require('../config.json');
const Depo = require('../models/depo');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.customId === 'world') {
      
      try {
       const depoInfo = await Depo.findOne();

      if (!depoInfo) {
        return interaction.reply('Depo information has not been set.');
      }

      // Create an embed to display depo information
      const depoEmbed = new EmbedBuilder()
        .setColor('Random')
        .setTitle('Depo Information')
        .setDescription(`${emoji3}  World: **${depoInfo.depoWorld}**
${emoji1}  Owner: **${depoInfo.worldOwner}**
${emoji2}  Bot Name: **${depoInfo.botName}**`)

      return interaction.reply({ embeds: [depoEmbed], ephemeral: true });
      } catch (error) {
        console.error('Error:', error);
        return interaction.reply({ content: 'Something went wrong.', ephemeral: true });
      }
    }
  }
};

        