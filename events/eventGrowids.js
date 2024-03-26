const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const User = require('../models/user');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.customId === 'growid') {
      const username = interaction.user.username;
      const discordId = interaction.user.id;

      // Membuat modal untuk memasukkan GrowID
        try{
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


      }catch (error) {
        console.error('Error showing modal:', error);
        return interaction.reply({ content: 'Something went wrong.', ephemeral: true });
      }
    }

    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'Modal') {
      const growID = interaction.fields.getTextInputValue('growIdInput')
      console.log(growID)

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

        
