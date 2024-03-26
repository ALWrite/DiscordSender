// Import necessary libraries
const Product = require('../models/product');
const config = require('../config.json');
const axios = require('axios'); // Import axios to fetch file content
const { AttachmentBuilder } = require('discord.js'); // Import MessageAttachment for file handling
const purchaseEmitter = require('../events/purchaseEmitter');

module.exports = {
  name: 'add',
  description: 'Add product details to the database',
  async execute(message, args) {
    if (!config.adminIds.includes(message.author.id)) {
      return message.reply('You do not have permission to use this command.');
    }


    // Check if there are enough arguments
    if (args.length < 1) {
      return message.reply('Usage: .add <code> [Upload a file or provide text]');
    }

    const code = args[0];

  const product = await Product.findOne({ code });

    if (!product) {
      return message.reply('Product not found.');
    }

    switch (product.type) {
      case 'df':
        return addDFTypeDetails(message, code, args.slice(1));
      case 'yes':
        return addYesTypeDetails(message, code, args.slice(1));
      case 'no':
        return addNoTypeDetails(message, code, args.slice(1));
      default:
        return message.reply('Invalid type. Supported types are df, yes, and no.');
    }
  },
};

// Function to add "df" type details
async function addDFTypeDetails(message, code, details) {
  try {
    // Find the product in the database by code
    const product = await Product.findOne({ code });

    if (!product) {
      return message.reply('Product not found.');
    }

    // Check if there's an attachment (file) in the message
    if (message.attachments.size === 1) {
      // If there's an attachment, fetch its content
      const attachment = message.attachments.first();
      const fileContents = await axios.get(attachment.url).then(response => response.data);

      // Combine file contents into a single string as a variation
      product.variations.push(fileContents);
product.stock++;
      // Save the updated product
      await product.save();
      purchaseEmitter.emit('purchase');
      
      return message.reply('Details added/updated successfully for "df" type.');
    } else {
      // If there's no attachment, assume the user provided text details in the message
      if (details.length === 0) {
        return message.reply('Please provide text details or attach a .txt file for "df" type.');
      }

      // Combine text details into a single string as a variation
      const textDetails = details.join(' ');
      product.variations.push(textDetails);
product.stock++;
      // Save the updated product
      await product.save();
      purchaseEmitter.emit('purchase');
      
      return message.reply('Details added/updated successfully for "df" type.');
    }
  } catch (error) {
    console.error('Error:', error);
    return message.reply('Something went wrong for "df" type.');
  }
}

// Function to add "yes" type details
async function addYesTypeDetails(message, code, details) {
  try {
    // Find the product in the database by code
    const product = await Product.findOne({ code });

    if (!product) {
      return message.reply('Product not found.');
    }

    // Check if there's an attachment (file) in the message
    if (message.attachments.size === 1) {
      // If there's an attachment, fetch its content
      const attachment = message.attachments.first();
      const fileContents = await axios.get(attachment.url).then(response => response.data);

      // Combine file contents into a single string as a variation
      product.variations.push(fileContents);
product.stock++;
      // Save the updated product
      await product.save();
  purchaseEmitter.emit('purchase');
      
      return message.reply('Details added/updated successfully for "script" type.');
    } else {
      // If there's no attachment, assume the user provided text details in the message
      if (details.length === 0) {
        return message.reply('Please provide text details or attach a .txt file for "script" type.');
      }

      // Combine text details into a single string as a variation
      const textDetails = details.join(' ');
      product.variations.push(textDetails);
product.stock++;
      // Save the updated product
      await product.save();
  purchaseEmitter.emit('purchase');
      
      return message.reply('Details added/updated successfully for "script" type.');
    }
  } catch (error) {
    console.error('Error:', error);
    return message.reply('Something went wrong for "script" type.');
  }
}


// Function to add "no" type details
async function addNoTypeDetails(message, code, details) {
  try {
    // Find the product in the database by code
    const product = await Product.findOne({ code });

    if (!product) {
      return message.reply('Product not found.');
    }

    // Check if there's an attachment (file) in the message
    if (message.attachments.size === 1) {
      // If there's an attachment, fetch its content
      const attachment = message.attachments.first();
      const fileContents = await axios.get(attachment.url).then(response => response.data);

      // Split the file contents by lines and push each line as a separate variation
      const lines = fileContents.split('\n');
      product.variations.push(...lines);

      // Update the stock count
      product.stock += lines.length;

      // Save the updated product
      await product.save();
  purchaseEmitter.emit('purchase');
      
      return message.reply(`Added ${lines.length} variations successfully for "no" type.`);
    } else {
      // If there's no attachment, assume the user provided text details in the message
      if (details.length === 0) {
        return message.reply('Please provide text details or attach a .txt file for "df" type.');
      }

      // Split the text details by spaces and push each word as a separate variation
      const words = details.join(' ').split(/\s+/);
      product.variations.push(...words);

      // Update the stock count
      product.stock += words.length;

      // Save the updated product
      await product.save();
      purchaseEmitter.emit('purchase');
      
      return message.reply(`Added ${words.length} variations successfully for "no" type.`);
    }
  } catch (error) {
    console.error('Error:', error);
    return message.reply('Something went wrong for "no" type.');
  }
}