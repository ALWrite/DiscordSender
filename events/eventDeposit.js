const { Events, EmbedBuilder, Collection } = require('discord.js');
const { emoji1, emoji2, emoji3 } = require('../config.json');
const Depo = require('../models/depo');
const { Collection } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (interaction.isButton() && interaction.customId === 'world') {
      const { cooldowns } = client;
      const defaultCooldownDuration = 10; // Cooldown duration in seconds
      const cooldownAmount = defaultCooldownDuration * 1000;
      const now = Date.now();
      
      if (!cooldowns.has('world')) {
        cooldowns.set('world', new Collection());
      }

      const timestamps = cooldowns.get('world');

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

      try {
        const depoInfo = await Depo.findOne();

        if (!depoInfo) {
          return interaction.reply({ content:'Depo information has not been set.', ephemeral: true });
        }

        // Create an embed to display depo information
        const depoEmbed = new EmbedBuilder()
          .setColor('Random')
          .setTitle('Depo Information')
          .setDescription(`${emoji3}  World: **${depoInfo.depoWorld}**
${emoji1}  Owner: **${depoInfo.worldOwner}**
${emoji2}  Bot Name: **${depoInfo.botName}**`);

        return interaction.reply({ embeds: [depoEmbed], ephemeral: true });
      } catch (error) {
        console.error('Error:', error);
        return interaction.reply({ content: 'Something went wrong.', ephemeral: true });
      }
    }
  }
};
