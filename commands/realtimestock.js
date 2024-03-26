const { sendStockMessage } = require('../models/shared');
const purchaseEmitter = require('../events/purchaseEmitter');
const config = require('../config.json');
const mongoose = require('mongoose'); // Import Mongoose

// Define a schema for storing the previousMessageId
const PreviousMessageIdSchema = new mongoose.Schema({
  messageId: String,
});

// Create a model for the PreviousMessageId schema
const PreviousMessageId = mongoose.model('PreviousMessageId', PreviousMessageIdSchema);

module.exports = {
  name: 'realtime',
  description: 'Display real-time product stock information',
  async execute(message, args) {
    if (!config.adminIds.includes(message.author.id) && message.author.id !== config.yourBotId) {
      return message.reply('You do not have permission to use this command.');
    }

    // Check if there's a previous message ID to delete
    let previousMessageId = null;
    try {
      const record = await PreviousMessageId.findOne();
      if (record) {
        previousMessageId = record.messageId;
        await message.channel.messages.fetch(previousMessageId).then(msg => {
          msg.delete();
          console.log('Previous stock message deleted.');
        });
      }
    } catch (error) {
      console.error('Error deleting previous message:', error);
    }

    // Send the new stock message
    try {
      const sentMessage = await sendStockMessage(message);
      if (sentMessage) {
        previousMessageId = sentMessage.id;

        // Save the new message ID to the database
        try {
          await PreviousMessageId.findOneAndUpdate({}, { messageId: previousMessageId }, { upsert: true });
          console.log('Saved new message ID to database:', previousMessageId);
        } catch (error) {
          console.error('Error saving new message ID to database:', error);
        }
      } else {
        console.log('No products found in the database.');
      }
    } catch (error) {
      console.error('Error sending stock message:', error);
    }

    purchaseEmitter.on('purchase', () => {
      // Send the new stock message when a purchase occurs
      try {
        sendStockMessage(message).then(async sentMessage => {
          if (sentMessage) {
            previousMessageId = sentMessage.id;

            // Save the new message ID to the database
            try {
              await PreviousMessageId.findOneAndUpdate({}, { messageId: previousMessageId }, { upsert: true });
              console.log('Saved new message ID to database:', previousMessageId);
            } catch (error) {
              console.error('Error saving new message ID to database:', error);
            }
          } else {
            console.log('No products found in the database.');
          }
        });
      } catch (error) {
        console.error('Error sending stock message:', error);
      }
    });
  },
};
