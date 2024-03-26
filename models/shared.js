const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonStyle } = require('discord.js');
const Product = require('../models/product');
const { thumbnailURL, imageURL, wlEmoji, emoji1, emoji2, StoreName } = require('../config.json');

const sendStockMessage = async (message) => {
  try {
    const products = await Product.find();

    if (products.length === 0) {
      return message.reply('No products found in the database.');
    }

    const currentTime = Math.floor(Date.now() / 1000); // Waktu saat ini dalam detik

    const stockInfoEmbed = new EmbedBuilder()
      .setColor('#00ffff')
       .setTitle(`REALTIME STOCK\nUpdated: <t:${currentTime}:R>`)
      
      .setImage(imageURL)
      .setTimestamp()
      .setFooter({ text: `${StoreName}` });

    products.forEach((product) => {
      stockInfoEmbed.addFields(
        {
          name: ` ${emoji1} ${product.name.replace(/"/g, '')}`,
          value: `${emoji1}  Code: **${product.code}**\n${emoji1}  Stock: **${product.stock}**\n${emoji1}  Price: **Rp ${product.price.toLocaleString('id-ID')}**\n========================`,
          inline: false,
        }
      );
    });

    // Create modal for setting GrowID
    const button = new ButtonBuilder()
	.setCustomId('growid')
	.setLabel('Set GrowID')
	.setStyle(ButtonStyle.Success)
    .setEmoji('1219156061727101040');
      
    const chekBal = new ButtonBuilder()
      .setCustomId('getBalance')
      .setLabel('Balance')
      .setStyle(ButtonStyle.Success)
      .setEmoji('🏦');
      
    const beliAnj = new ButtonBuilder()
      .setCustomId('beli')
      .setLabel('Buy')
      .setStyle(ButtonStyle.Success)
      .setEmoji('🛒');
      
    const deposit = new ButtonBuilder()
      .setCustomId('world')
      .setLabel('Deposit')
      .setStyle(ButtonStyle.Success)
      .setEmoji('🌎');
      
    const buttonss = new ButtonBuilder()
	.setCustomId('gift')
	.setLabel('Gift Product')
	.setStyle(ButtonStyle.Success)
    .setEmoji('🎁');
      
    const row = new ActionRowBuilder()
    .addComponents(button, chekBal,  deposit, beliAnj, buttonss)
	
    // Send the initial stock message with modal button
    let sentMessage;
    if (!message._editedMessage) {
      sentMessage = await message.channel.send({ embeds: [stockInfoEmbed], components: [row] });
      message._editedMessage = sentMessage;
    } else {
      sentMessage = await message._editedMessage.edit({ embeds: [stockInfoEmbed], components: [row]});
    }

    return sentMessage; // Return the sent message object
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

module.exports = { sendStockMessage };
