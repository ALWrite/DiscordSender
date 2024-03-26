const { EmbedBuilder } = require('discord.js');
const Product = require('../models/product');
const { thumbnailURL, imageURL, wlEmoji, emoji1, emoji2, StoreName } = require('../config.json');

const sendStockMessage = async (message) => {
  try {
    const products = await Product.find();

    if (products.length === 0) {
      return message.reply('No products found in the database.');
    }

    const stockInfoEmbed = new EmbedBuilder()
      .setColor('#36393e')
      .setTitle('<a:emoji_8:1167736203865493504> REALTIME STOCK <a:emoji_8:1167736203865493504>\n<a:pin:1167740388220604478> Updated every purchase <a:pin:1167740388220604478>')
      .setImage(imageURL)
      .setTimestamp()
    .setFooter({ text: `${StoreName}` });

    products.forEach((product) => {
      stockInfoEmbed.addFields(
        {
          name: `<a:PayyKing02:1167742137924845690> ${product.name.replace(/"/g, '')} <a:PayyKing02:1167742137924845690>`,
          value: `${emoji1}  Code: **${product.code}**\n${emoji1}  Stock: **${product.stock}**\n${emoji1}  Price: **${product.price}** ${wlEmoji}\n<a:emoji_9:1167737560005623849><a:emoji_9:1167737560005623849><a:emoji_9:1167737560005623849><a:emoji_9:1167737560005623849><a:emoji_9:1167737560005623849><a:emoji_9:1167737560005623849><a:emoji_9:1167737560005623849><a:emoji_9:1167737560005623849><a:emoji_9:1167737560005623849><a:emoji_9:1167737560005623849><a:emoji_9:1167737560005623849><a:emoji_9:1167737560005623849>\n`,
          inline: false,
        }
      );
    });

    let sentMessage;

    if (!message._editedMessage) {
      // Send the initial stock message
      sentMessage = await message.channel.send({ embeds: [stockInfoEmbed] });
      message._editedMessage = sentMessage; // Store the initial message for editing
    } else {
      // Edit the existing message to update stock information
      sentMessage = await message._editedMessage.edit({ embeds: [stockInfoEmbed] });
    }

    return sentMessage; // Return the sent message object
  } catch (error) {
    console.error('Error:', error);
    return null; // Return null in case of an error
  }
};

module.exports = { sendStockMessage };
