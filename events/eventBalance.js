const { Events, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, Collection } = require('discord.js');
const { emoji1, emoji2 } = require('../config.json');
const User = require('../models/user');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    // Check if the interaction is a button click
    if (interaction.isButton()) {
      const buttonId = interaction.customId;
      
      // Check for the 'getBalance' button click
      if (buttonId === 'getBalance') {
        const { cooldowns } = client;
        const defaultCooldownDuration = 5; // Cooldown duration in seconds
        const cooldownAmount = defaultCooldownDuration * 1000;
        const now = Date.now();

        if (!cooldowns.has(buttonId)) {
          cooldowns.set(buttonId, new Collection());
        }

        const timestamps = cooldowns.get(buttonId);

        if (timestamps.has(interaction.user.id)) {
          const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

          if (now < expirationTime) {
            const expiredTimestamp = Math.round(expirationTime / 1000);
            return interaction.reply({
              content: `Please wait, you are on a cooldown for this button. You can use it again <t:${expiredTimestamp}:R>.`,
              ephemeral: true
            });
          }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        // Proceed with handling the interaction
        const username = interaction.user.username;
        const discordId = interaction.user.id;

        try {
          const user = await User.findOne({ discordId });

          if (!user) {
            const belum = new EmbedBuilder()
              .setTitle('Warning!!')
              .setDescription('Use this button to set your GrowId');
            
            const button = new ButtonBuilder()
              .setCustomId('growid')
              .setLabel('Set GrowId')
              .setStyle(ButtonStyle.Danger)
              .setEmoji('1219156061727101040');
            
            const row = new ActionRowBuilder().addComponents(button);

            return interaction.reply({
              embeds: [belum],
              components: [row],
              ephemeral: true
            });
          }

          const depoEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Information GrowId')
            .setDescription(`${emoji2} Name: **${user.growId}**
${emoji1} Balance: **${user.balance.toLocaleString('id-ID')}**`);

          return interaction.reply({
            embeds: [depoEmbed],
            ephemeral: true
          });
        } catch (error) {
          console.error('Error:', error);
          return interaction.reply({
            content: 'Something went wrong.',
            ephemeral: true
          });
        }
      }
    }
  }
};
