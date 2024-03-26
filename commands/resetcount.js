const OrderCount = require('../models/orderCount'); // Import the OrderCount mode
const config = require('../config.json');
const { ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'resetcount',
  description: 'Reset the order count',
  async execute(message, args) {
    if (!message.guild) {
      return message.reply('This command can only be used in a guild.');
    }

if (!config.adminIds.includes(message.author.id)) {
      return message.reply('You do not have permission to use this command.');
}

try {
  // Create a row of buttons for confirmation
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('confirm')
        .setLabel('Confirm Ban')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary),
    );

  // Send a message with the buttons and wait for an interaction
  const confirmationMessage = await message.reply({
    content: `Are you sure you want to reset the order count?`,
    components: [row],
  });

  // Create a filter to only accept interactions from the message author
  const filter = (interaction) => interaction.user.id === message.author.id;

  // Await a button interaction within 10 seconds
  const buttonInteraction = await confirmationMessage.awaitMessageComponent({
    filter,
    time: 10000,
  });

  // Handle the button interaction
  if (buttonInteraction.customId === 'confirm') {
    // Find and reset the order count in the database
    await OrderCount.findOneAndUpdate({}, { count: 0 }, { upsert: true });

    // Update the confirmation message
    await buttonInteraction.update({
      content: 'Order count has been reset to 0.',
      components: [],
    });
  } else if (buttonInteraction.customId === 'cancel') {
    // Update the confirmation message
    await buttonInteraction.update({
      content: 'Order count reset has been canceled.',
      components: [],
    });
  }
} catch (error) {
  console.error('Error:', error);
  return message.reply('Something went wrong while resetting the order count.');
}
},
};