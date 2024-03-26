const Product = require('../models/product');
const { prefix } = require('../config.json');
const purchaseEmitter = require('../events/purchaseEmitter');
const config = require('../config.json');

module.exports = {
  name: 'addproduct',
  description: 'Add a new product to the database',
  async execute(message, args) {
    // Check if the user executing the command has the allowed user ID
    if (!config.adminIds.includes(message.author.id)) {
      return message.reply('You do not have permission to use this command.');
    }

    // Check if there are enough arguments
    if (args.length !== 5) {
      return message.reply(`Usage: ${prefix}addproduct <name> <code> <price> <type [yes, no ,df, "yes" if script, "no" if not, and "df" if dirtfarm]> <mention-role>`);
    }

    const [name, code, price, type, roleToadd] = args;

    try {
      // Check if the product code already exists in the database
      const existingProduct = await Product.findOne({ code });

      if (existingProduct) {
        return message.reply('A product with this code already exists.');
      }

      // Create a new product and save it to the database
      const newProduct = new Product({
        name,
        code,
        price: parseFloat(price),
        stock: 0,
        variations: [],
        type,
        roleToadd: roleToadd.replace(/<@&|>/g, ''), // Extract role ID from mention
      });

      await newProduct.save();
      purchaseEmitter.emit('purchase');
      
      return message.reply('Product added successfully.');
    } catch (error) {
      console.error('Error:', error);
      return message.reply('Something went wrong.');
    }
  },
};
