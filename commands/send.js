const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Product = require('../models/product');
const User = require('../models/user');
const OrderCount = require('../models/orderCount'); // Import the OrderCount model
const purchaseEmitter = require('../events/purchaseEmitter');
const fs = require('fs');
const mongoose = require('mongoose'); // Import Mongoose
const { imageURL, wlEmoji, emoji1, emoji2, roleToAdd, buylogChannelId, prefix } = require('../config.json');
const config = require('../config.json');

// Function to get the order count from the database
const getOrderCount = async () => {
  const orderCountDoc = await OrderCount.findOne();
  if (orderCountDoc) {
    return orderCountDoc.count;
  }
  return 0; // Return 0 if no orderCount document found
};

module.exports = {
  name: 'send',
  description: 'Send product details to a user',
  async execute(message, args) {
    if (!message.guild) {
      return message.reply('This command can only be used in a guild.');
    }

    if (!config.adminIds.includes(message.author.id)) {
      return message.reply('You do not have permission to use this command.');
    }

    if (args.length < 3) {
      return message.reply(`Usage: ${prefix}send <user mention> <code> <amount>`);
    }

    const userMention = message.mentions.users.first();
    const productCode = args[1];
    const quantity = parseInt(args[2]);

    if (!userMention) {
      return message.reply('Please provide a valid user mention.');
    }

    if (isNaN(quantity) || quantity <= 0) {
      return message.reply('Please provide a valid quantity greater than 0.');
    }

      try {
        // Find the product in the database by code
        const product = await Product.findOne({ code: productCode });

        if (!product) {
          return message.reply('This product does not exist.');
        }

        // Check if there are variations (account details) available
        if (!product.variations || product.variations.length === 0) {
          return message.reply('There are no account details available for this product.');
        }

        // Check if there's enough stock to send
        if (product.stock < quantity) {
          return message.reply(`There is not enough stock to send ${quantity} of this product.`);
        }

        const totalPrice = product.price * quantity;

        if (product.type === 'yes') {
          // Handle "yes" type to send details from the database without reducing product details
          const randomDetails = [];
  for (let i = 0; i < quantity; i++) {
    const randomIndex = Math.floor(Math.random() * product.variations.length);
    randomDetails.push(product.variations[randomIndex]);
  }



  // Update the stock count accordingly
  product.stock -= quantity;

  // Save the updated product to the database
  await product.save();

  // Emit the 'purchaseMade' event to trigger real-time stock update
  purchaseEmitter.emit('purchase');

  const detailsMessages = randomDetails.join('\n');
  const fileNames = `${product.name.replace(/ /g, '_')}_details.txt`;

  // Create the details file
  fs.writeFileSync(fileNames, detailsMessages);

          const embedDM = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Purchase Successful')
            .setDescription(`You have received **${quantity} ${product.name.replace(/"/g, '')}** worth **${totalPrice} ${wlEmoji}** from **${message.author.tag}**\n\n**Don't forget to give reps.**\n`)
            .setImage(imageURL)
            .setTimestamp();

          await userMention.send({ embeds: [embedDM], files: [fileNames] });

          // Delete the unique file after sending
          fs.unlinkSync(fileNames);
        } else if (product.type === 'no') {
          // For "no" or "df" type, select random product details from the database
          const selectedDetails = [];
          for (let i = 0; i < quantity; i++) {
            const randomIndex = Math.floor(Math.random() * product.variations.length);
            const selectedVariation = product.variations.splice(randomIndex, 1)[0]; // Remove the selected variation from the array
            selectedDetails.push(selectedVariation);
          }

          // Create a .txt file with the selected details
          const detailsMessage = selectedDetails.join('\n');
          const fileName = `details.txt`;
          fs.writeFileSync(fileName, detailsMessage);

          // Reduce the stock of the product
          product.stock -= quantity;

          // Save the updated product stock to the database
          await product.save();

          const embedDM = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Purchase Successful')
            .setDescription(`You have received **${quantity} ${product.name.replace(/"/g, '')}** worth **${totalPrice} ${wlEmoji}** from **${message.author.tag}**\n\n**Don't forget to give reps.**`)
            .setImage(imageURL)
            .setTimestamp();

          await userMention.send({ embeds: [embedDM], files: [fileName] });

          // Delete the unique file after sending
          fs.unlinkSync(fileName);
} else if (product.type === 'df') {
        const selectedVariations = [];
  for (let i = 0; i < quantity; i++) {
    const randomIndex = Math.floor(Math.random() * product.variations.length);
    selectedVariations.push(product.variations[randomIndex]);
  }

  // Remove the purchased details from the product's variations
  product.variations = product.variations.filter((_, index) => !selectedVariations.includes(product.variations[index]));

  // Combine selected variations into a single string
  const combinedDetails = selectedVariations.join('\n\n\n');
  const fileName = `${product.name.replace(/ /g, '_')}_details.txt`;

  // Create the details file
  fs.writeFileSync(fileName, combinedDetails);

  // Update the stock count accordingly
  product.stock -= quantity;

  // Save the updated product to the database
  await product.save();

  // Emit the 'purchaseMade' event to trigger real-time stock update
  purchaseEmitter.emit('purchase');

  // Send the file to the user via direct message
  const embedDM = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Purchase Successful')
    .setDescription(`You have purchased **${quantity} ${product.name.replace(/"/g, '')}** worth **${totalPrice}${wlEmoji}**\n\n**Don't forget to give reps.**\n`)
    .setImage(imageURL)
    .setTimestamp();
  await message.author.send({ embeds: [embedDM], files: [fileName] });

  // Delete the file after sending
  fs.unlinkSync(fileName);
        }

        // Fetch the current orderCount
        const orderCount = await getOrderCount();

        // Increment the order count
        await OrderCount.findOneAndUpdate({}, { count: orderCount + 1 }, { upsert: true });

        purchaseEmitter.emit('purchase');

        // Add the role to the mentioned user
        const role = message.guild.roles.cache.get(product.roleToAdd);
        if (role) {
          await message.guild.members.cache.get(userMention.id).roles.add(role);
        }

        // Create the purchase log embed
        const purchaseLogEmbed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle(`Order Number: **${orderCount + 1}**`)
          .setDescription(`${emoji1} Buyer: ${userMention}\n${emoji1} Sender: <@${message.author.id}>\n${emoji1} Product: **${product.name.replace(/"/g, '')}**\n${emoji1} Code: **${product.code}**\n${emoji1} Total Price: **${totalPrice}** ${wlEmoji}\n\n**Thanks For Purchasing Our Product(s)**`)
          .setTimestamp();

        // Send the purchase log to a log channel (update 'logChannelId' with your log channel ID)
        const logChannel = message.guild.channels.cache.get(buylogChannelId);
        if (logChannel) {
          logChannel.send({ embeds: [purchaseLogEmbed] });
        }

        return message.reply(`Successfully sent ${quantity} **${product.name}** to ${userMention}.`);
      } catch (error) {
        console.error('Error:', error);
        return message.reply('Something went wrong.');
      }
    },
  };