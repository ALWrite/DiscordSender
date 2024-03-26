const { EmbedBuilder } = require('discord.js');
const { imageURL, emoji1, prefix } = require('../config.json');

module.exports = {
  name: 'help',
  description: 'List available commands',
  execute(message, args) {
    const ohelpEmbed = new EmbedBuilder()
      .setColor('Random')
      .setTitle('Available Commands')
      .addFields({ name: 'Public Commands', value: `${emoji1} **${prefix}help**
${emoji1} **${prefix}set** <GrowID>
${emoji1} **${prefix}buy** <code> <amount>
${emoji1} **${prefix}bal**
${emoji1} **${prefix}info**
${emoji1} **${prefix}stock**
${emoji1} **${prefix}depo**`, inline: true })
      .setImage(imageURL)
      .setTimestamp(Date.now())
    message.reply({ embeds: [ohelpEmbed] });
  },
};
