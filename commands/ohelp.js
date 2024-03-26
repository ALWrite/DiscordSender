const { EmbedBuilder } = require('discord.js');
const { emoji1, prefix, imageURL } = require('../config.json');

module.exports = {
  name: 'ohelp',
  description: 'List available commands',
  execute(message, args) {
    const ohelpEmbed = new EmbedBuilder()
      .setColor('Random')
      .setTitle('Available Commands')
      .setDescription(`**Public Commands**
${emoji1} **${prefix}help**
${emoji1} **${prefix}set** <growid>
${emoji1} **${prefix}buy** <code> <amount>
${emoji1} **${prefix}bal**
${emoji1} **${prefix}info**
${emoji1} **${prefix}stock**
${emoji1} **${prefix}depo**
${emoji1} **${prefix}ping**

**Owner Commands**
${emoji1} **${prefix}addbal** <user> <amount>
${emoji1} **${prefix}addproduct** <name> <code> <price> <type ["yes", "no", "df"]> <role>
${emoji1} **${prefix}add** <code> <text or file>
${emoji1} **${prefix}removeproduct** <code>
${emoji1} **${prefix}removebal** <user> <amount>
${emoji1} **${prefix}removeuser** <mention-user>
${emoji1} **${prefix}removestock** <code> <amount>
${emoji1} **${prefix}setdepo** <world> <owner> <botname>
${emoji1} **${prefix}send** <mention user> <code> <amount>
${emoji1} **${prefix}checkbal** <mention user>
${emoji1} **${prefix}changename** <code> <name>
${emoji1} **${prefix}changecode** <code> <codename>
${emoji1} **${prefix}changeprice** <code> <price>
${emoji1} **${prefix}realtime**
${emoji1} **${prefix}setmt**
${emoji1} **${prefix}resetcount**`)
      .setImage(imageURL)
      .setTimestamp(Date.now())
    message.channel.send({ embeds: [ohelpEmbed] });
  },
};
