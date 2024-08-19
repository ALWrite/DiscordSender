const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, Collection } = require('discord.js');
const User = require('../models/user');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    // Cooldown management
    const { cooldowns } = client;
    const cooldownDuration = 30; // Cooldown duration in seconds
    const cooldownAmount = cooldownDuration * 1000; // Convert to milliseconds
    const now = Date.now();

    if (!cooldowns.has('growid')) {
      cooldowns.set('growid', new Collection());
    }

    const timestamps = cooldowns.get('growid');

    if (interaction.isButton() && interaction.customId === 'growid') {
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

      // Membuat modal untuk memasukkan GrowID
      try {
        const modal = new ModalBuilder()
          .setCustomId('Modal')
          .setTitle('Set Grow ID');

        const growIdInput = new TextInputBuilder()
          .setCustomId('growIdInput')
          .setLabel("What's your Grow ID?")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Enter your Grow ID')
          .setRequired(true);

        const firstActionRow = new ActionRowBuilder().addComponents(growIdInput);
        modal.addComponents(firstActionRow);

        // Show the modal to the user
        await interaction.showModal(modal);

      } catch (error) {
        console.error('Error showing modal:', error);
        return interaction.reply({ content: 'Something went wrong.', ephemeral: true });
      }
    }

    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'Modal') {
      const growID = interaction.fields.getTextInputValue('growIdInput');
      console.log(growID);

      try {
        const existingUser = await User.findOne({ growId: growID });
        if (existingUser) {
          return interaction.reply({ content: `GrowID ${growID} has already been taken.`, ephemeral: true });
        }

        const user = await User.findOne({ discordId: interaction.user.id });
        if (user) {
          user.growId = growID;
          await user.save();
          return interaction.reply({ content: `Successfully updating your Grow ID to ${growID}.`, ephemeral: true });
        }

        const newUser = new User({
          discordId: interaction.user.id,
          discordTag: interaction.user.tag,
          growId: growID,
          balance: 0
        });
        await newUser.save();

        return interaction.reply({ content: `Welcome! Your Grow ID is now set to ${growID}.`, ephemeral: true });
      } catch (error) {
        console.error('Error:', error);
        return interaction.reply({ content: 'Something went wrong.', ephemeral: true });
      }
    }
  }
};
