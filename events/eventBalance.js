const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { thumbnailURL, imageURL, wlEmoji, emoji1, emoji2, StoreName } = require('../config.json');
const User = require('../models/user');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.customId === 'getBalance') {
      const username = interaction.user.username;
      const discordId = interaction.user.id;
     

      try {
        

        const user = await User.findOne({ discordId });

      if (!user) {
        const belum = new EmbedBuilder()
        .setTitle('Warning!!')
        .setDescription('Use this button to set your grow Id');
        const button = new ButtonBuilder()
        .setCustomId('growid')
    	.setLabel('Set GrowId')
	    .setStyle(ButtonStyle.Danger)
        .setEmoji('1219156061727101040');
        
      const row = new ActionRowBuilder()
      .addComponents(button)
     return interaction.reply({ embeds: [belum], components: [row], ephemeral: true });
      }

      // Send the user's GrowID and formatted balance information
      const depoEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Information GrowId')
        .setDescription(`${emoji2}  Name: **${user.growId}**
${emoji1}  Balance: **${user.balance.toLocaleString('id-ID')}**`)

      return interaction.reply({ embeds: [depoEmbed], ephemeral: true }); 
      } catch (error) {
        console.error('Error:', error);
        return interaction.reply({ content: 'Something went wrong.', ephemeral: true });
      }
    }
  }
};

        
