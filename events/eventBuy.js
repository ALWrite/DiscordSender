const Product = require('../models/product');
const User = require('../models/user');
const purchaseEmitter = require('../events/purchaseEmitter');
const fs = require('fs');
const mongoose = require('mongoose'); 
const { imageURL, wlEmoji, emoji1, emoji2, roleToadd } = require('../config.json');
const { buylogChannelId } = require('../config.json'); 
const OrderCount = require('../models/orderCount')
const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
let orderCount = 0;


const getOrderCount = async () => {
  const orderCountDoc = await OrderCount.findOne();
  if (orderCountDoc) {
    return orderCountDoc.count;
  }
  return 0; 
};
module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.customId === 'beli') {
      const username = interaction.user.username;
      const discordId = interaction.user.id;

      // Membuat modal untuk memasukkan GrowID
        try{
      const modal = new ModalBuilder()
        .setCustomId('ModalBeli')
        .setTitle('Buy a product');

      const codeIdInput = new TextInputBuilder()
        .setCustomId('codeIdInput')
        .setLabel('Choice a product code')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Enter product code')
        .setRequired(true);
        
      const quantity = new TextInputBuilder()
        .setCustomId('quantity')
        .setLabel('Quantity of product')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Enter quantity with number')
        .setRequired(true)
        
      const firstActionRow = new ActionRowBuilder().addComponents(codeIdInput);
	  const secondActionRow = new ActionRowBuilder()
	  .addComponents(quantity)
      modal.addComponents(firstActionRow, secondActionRow);

		// Show the modal to the user
		await interaction.showModal(modal);


      }catch (error) {
        console.error('Error showing modal:', error);
        return interaction.reply({ content: 'Something went wrong.', ephemeral: true });
      }
    }

    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'ModalBeli') {
      const codeId = interaction.fields.getTextInputValue('codeIdInput')
      const jumlah = interaction.fields.getTextInputValue('quantity')
      const pass = parseInt(jumlah)
      if (isNaN(pass)) {
    return interaction.reply({ content: 'Quantity must be a number.', ephemeral: true });
}
      const discordId = interaction.user.id
      const logChannel = interaction.guild.channels.cache.get(buylogChannelId);


      try {
        let purchasedAccounts = [];
      // Check if the user already exists in the database
      const user = await User.findOne({ discordId: discordId });

      if (!user) {
        const belum = new EmbedBuilder()
        .setTitle('Warning!!')
        .setDescription('Use this button to set your grow Id');
        const button = new ButtonBuilder()
        .setCustomId('growid')
    	.setLabel('Set GrowId')
	    .setStyle(ButtonStyle.Danger)
        .setEmoji('1219156061727101040');
        
      const row = new ActionRowBuilder()
      .addComponents(button)
     return interaction.reply({ embeds: [belum], components: [row], ephemeral: true });
      }
      
      const produks = await Product.findOne({ code: codeId })
      
      if(!produks){
          return interaction.reply({ content: 'Product does not exists.', ephemeral: true })
      }
      if (!produks.variations || produks.variations.length === 0) {
        return interaction.reply({ content: 'There are no product details available for this product.', ephemeral: true });
      }
      if (produks.stock < pass) {
        return interaction.reply({ content:'There is not enough stock to purchase  this product.', ephemeral: true });
      }
      const totalPrice = produks.price * pass;

      if (user.balance < totalPrice) {
        return interaction.reply({ content: 'You do not have enough balance to purchase this quantity of the product.', ephemeral: true });
      }
      switch (produks.type) {
        
         case 'yes':
  // Handle "yes" type using the asynchronous function
         await handleYesType(user, interaction, produks, pass);
         break;

         case 'no':
  // For "any-product" type, reduce both stock and details
        if (produks.variations.length < pass) {
        return interaction.reply({ content: `There are only **${produks.variations.length} ${produks.name}** available for purchase.`, ephemeral: true });
  }
  purchasedAccounts = [];
  const randomIndexes = [];
  
  for (let i = 0; i < pass; i++) {
    // Generate a random index
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * produks.variations.length);
    } while (randomIndexes.includes(randomIndex)); // Ensure we don't select the same detail twice
    
    randomIndexes.push(randomIndex);
    
    const selectedVariation = produks.variations[randomIndex];
    purchasedAccounts.push(selectedVariation);
  }
  // Remove the purchased details from the product's variations
     produks.variations = produks.variations.filter((_, index) => !purchasedAccounts.includes(produks.variations[index]));
          
  // Update the stock count
     produks.stock -= pass;

  // Save the updated product to the database
     await produks.save();

  // Emit the 'purchaseMade' event to trigger real-time stock update
     purchaseEmitter.emit('purchase');
         
     const detailsMessage = purchasedAccounts.join('\n');
  const fileName = `${user.growId}.txt`;

  // Create the details file
  fs.writeFileSync(fileName, detailsMessage);

  // Send the file to the user via DM
  const embedDM = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Purchase Successful')
    .setDescription(`You have purchased **${jumlah} ${produks.name.replace(/"/g, '')}** worth **${totalPrice}${wlEmoji}**\n**Don't forget to give reps.**\n`)
    .setImage(imageURL)
    .setTimestamp();
  await interaction.user.send({ embeds: [embedDM], files: [fileName], ephemeral: true });

  // Delete the file after sending
  fs.unlinkSync(fileName);
  break;
         case 'df':
          // Handle "df" type to send random details from the database via DM
           if (produks.variations.length < pass) {
    return interaction.reply({ content: `There are only **${produks.variations.length} ${produks.name}** available for purchase.`, ephemeral: true });
  }
  purchasedAccounts = [];
  const randomIndexess = [];
  
  for (let i = 0; i < pass; i++) {
    // Generate a random index
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * produks.variations.length);
    } while (randomIndexess.includes(randomIndex)); // Ensure we don't select the same detail twice
    
    randomIndexess.push(randomIndex);
    
    const selectedVariation = produks.variations[randomIndex];
    purchasedAccounts.push(selectedVariation);
  }
  // Remove the purchased details from the product's variations
  produks.variations = produks.variations.filter((_, index) => !purchasedAccounts.includes(produks.variations[index]));
          
  // Update the stock count
  produks.stock -= pass;

  // Save the updated product to the database
  await produks.save();

  // Emit the 'purchaseMade' event to trigger real-time stock update
  purchaseEmitter.emit('purchase');

  const detailssMessage = purchasedAccounts.join('\n\n\n');
  const fileNames = `${user.growId}.txt`;

  // Create the details file
  fs.writeFileSync(fileNames, detailssMessage);

  // Send the file to the user via DM
  const embedDMs = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Purchase Successful')
    .setDescription(`You have purchased **${pass} ${produks.name.replace(/"/g, '')}** worth **${totalPrice}${wlEmoji}**\n**Don't forget to give reps.**\n`)
    .setImage(imageURL)
    .setTimestamp();
  await interaction.user.send({ embeds: [embedDMs], files: [fileNames], ephemeral: true });

  // Delete the file after sending
  fs.unlinkSync(fileNames);
          break;
          case 'autosend':
          // Handle autosend type (customize as needed)
          // For example, send the purchased product directly here
          await autosendFunction(user, interaction, produks, pass);
          break;
        default:
          return interaction.reply({ content: 'This product type is not supported.', ephemeral: true});
      }

      // Save the updated product to the database
      await produks.save();

      // Deduct the total price from the user's balance
      user.balance -= totalPrice;
      await user.save();

      // Fetch the current orderCount
      orderCount = await getOrderCount();

      // Increment the order count
      orderCount++;

      // Update the order count in the database
      await OrderCount.findOneAndUpdate({}, { count: orderCount }, { upsert: true });

      // Emit the 'purchaseMade' event to trigger real-time stock update
      purchaseEmitter.emit('purchase');

      // Add the role to the user
      const roleToAdd = interaction.guild.roles.cache.get(produks.roleToadd);

      if (roleToAdd) {
        await interaction.member.roles.add(roleToAdd);
      }
      
      const purchaseLogEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Order Number: **${orderCount}**`)
        .setDescription(`${emoji1} Buyer: <@${interaction.user.id}>
${emoji1} Product: **${produks.name.replace(/"/g, '')}**
${emoji1} Code: **${produks.code}**
${emoji1} Total Price: **${totalPrice}** ${wlEmoji}\n\n**Thanks For Purchasing Our Product(s)**`)
        .setImage(imageURL)
        .setTimestamp();

      // Send the purchase log to the log channel
      if (logChannel) {
        logChannel.send({ embeds: [purchaseLogEmbed] });
      }

      // Send the purchase confirmation message to the user
      const purchaseConfirmationEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Purchase Successful')
        .setDescription(`You have successfully purchased **${pass} ${produks.name}.** Please Check your DM!`)
        .setTimestamp();

      interaction.reply({ embeds: [purchaseConfirmationEmbed], ephemeral: true })
        


      } catch (error) {
        console.error('Error:', error);
        return interaction.reply({ content: 'Something went wrong.', ephemeral: true });
      }
    }
  }
};

async function autosendFunction(user, interaction, produks, pass) {
  // Customize this function to handle autosend products
  // For example, send the purchased product directly to the user here
}

// Define an asynchronous function to handle the "yes" type
async function handleYesType(user, interaction, produks, pass) {
  // Check if there's enough stock to buy
    const totalPrice = produks.price * pass;

  const randomDetails = [];
  for (let i = 0; i < pass; i++) {
    const randomIndex = Math.floor(Math.random() * produks.variations.length);
    randomDetails.push(produks.variations[randomIndex]);
  }



  // Update the stock count accordingly
  produks.stock -= pass;

  // Save the updated product to the database
  await produks.save();

  // Emit the 'purchaseMade' event to trigger real-time stock update
  purchaseEmitter.emit('purchase');

  const detailsMessages = randomDetails.join('\n');
  const fileNames = `${user.growId}.txt`;

  // Create the details file
  fs.writeFileSync(fileNames, detailsMessages);

  // Send the file to the user
  const embedDMs = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Purchase Successful')
    .setDescription(`You have purchased **${pass} ${produks.name.replace(/"/g, '')}** worth **${totalPrice}${wlEmoji}**\n**Don't forget to give reps.**\n`)
    .setImage(imageURL)
    .setTimestamp();
  await interaction.user.send({ embeds: [embedDMs], files: [fileNames] });

  // Delete the file after sending
  fs.unlinkSync(fileNames);
}
