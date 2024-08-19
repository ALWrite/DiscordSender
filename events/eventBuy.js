const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { imageURL, wlEmoji, emoji1, emoji2, emoji3, roleToadd, buylogChannelId } = require('../config.json');
const Product = require('../models/product');
const User = require('../models/user');
const OrderCount = require('../models/orderCount');
const purchaseEmitter = require('../events/purchaseEmitter');
const fs = require('fs');
const mongoose = require('mongoose');
const { Collection } = require('discord.js');

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
  async execute(interaction, client) {
    // Cooldown management
    const { cooldowns } = client;
    const cooldownDuration = 15; // Cooldown duration in seconds
    const cooldownAmount = cooldownDuration * 1000; // Convert to milliseconds
    const now = Date.now();

    if (!cooldowns.has('beli')) {
      cooldowns.set('beli', new Collection());
    }

    const timestamps = cooldowns.get('beli');

    if (interaction.isButton() && interaction.customId === 'beli') {
      if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
        if (now < expirationTime) {
          const expiredTimestamp = Math.round(expirationTime / 1000);
          return interaction.reply({
            content: `Please wait, you are on a cooldown for this button. You can use it again <t:${expiredTimestamp}:R>.`,
            ephemeral: true
          });
        }
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

      // Show the modal
      try {
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
          .setRequired(true);
        
        const firstActionRow = new ActionRowBuilder().addComponents(codeIdInput);
        const secondActionRow = new ActionRowBuilder().addComponents(quantity);
        modal.addComponents(firstActionRow, secondActionRow);

        await interaction.showModal(modal);

      } catch (error) {
        console.error('Error showing modal:', error);
        return interaction.reply({ content: 'Something went wrong.', ephemeral: true });
      }
    }

    if (interaction.isModalSubmit() && interaction.customId === 'ModalBeli') {
      // Cooldown already applied for the button; no need to add it here again.
      const codeId = interaction.fields.getTextInputValue('codeIdInput');
      const jumlah = interaction.fields.getTextInputValue('quantity');
      const pass = parseInt(jumlah);
      if (isNaN(pass)) {
        return interaction.reply({ content: 'Quantity must be a number.', ephemeral: true });
      }

      const discordId = interaction.user.id;
      const logChannel = interaction.guild.channels.cache.get(buylogChannelId);

      try {
        let purchasedAccounts = [];
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
          
          const row = new ActionRowBuilder().addComponents(button);
          return interaction.reply({ embeds: [belum], components: [row], ephemeral: true });
        }
        
        const produks = await Product.findOne({ code: codeId });
        
        if (!produks) {
          return interaction.reply({ content: 'Product does not exist.', ephemeral: true });
        }
        if (!produks.variations || produks.variations.length === 0) {
          return interaction.reply({ content: 'There are no product details available for this product.', ephemeral: true });
        }
        if (produks.stock < pass) {
          return interaction.reply({ content: 'There is not enough stock to purchase this product.', ephemeral: true });
        }
        const totalPrice = produks.price * pass;

        if (user.balance < totalPrice) {
          return interaction.reply({ content: 'You do not have enough balance to purchase this quantity of the product.', ephemeral: true });
        }
        switch (produks.type) {
          case 'yes':
            await handleYesType(user, interaction, produks, pass);
            break;
          case 'no':
            if (produks.variations.length < pass) {
              return interaction.reply({ content: `There are only **${produks.variations.length} ${produks.name}** available for purchase.`, ephemeral: true });
            }
            purchasedAccounts = [];
            const randomIndexes = [];
            
            for (let i = 0; i < pass; i++) {
              let randomIndex;
              do {
                randomIndex = Math.floor(Math.random() * produks.variations.length);
              } while (randomIndexes.includes(randomIndex));
              
              randomIndexes.push(randomIndex);
              
              const selectedVariation = produks.variations[randomIndex];
              purchasedAccounts.push(selectedVariation);
            }
            produks.variations = produks.variations.filter((_, index) => !purchasedAccounts.includes(produks.variations[index]));
            produks.stock -= pass;

            await produks.save();
            purchaseEmitter.emit('purchase');
            
            const detailsMessage = purchasedAccounts.join('\n');
            const fileName = `${user.growId}.txt`;

            fs.writeFileSync(fileName, detailsMessage);

            const embedDM = new EmbedBuilder()
              .setColor('#0099ff')
              .setTitle('Purchase Successful')
              .setDescription(`You have purchased **${jumlah} ${produks.name.replace(/"/g, '')}** worth **${totalPrice}${wlEmoji}**\n**Don't forget to give reps.**\n`)
              .setImage(imageURL)
              .setTimestamp();
            await interaction.user.send({ embeds: [embedDM], files: [fileName] });
            fs.unlinkSync(fileName);
            break;
          case 'df':
            if (produks.variations.length < pass) {
              return interaction.reply({ content: `There are only **${produks.variations.length} ${produks.name}** available for purchase.`, ephemeral: true });
            }
            purchasedAccounts = [];
            const randomIndexess = [];
            
            for (let i = 0; i < pass; i++) {
              let randomIndex;
              do {
                randomIndex = Math.floor(Math.random() * produks.variations.length);
              } while (randomIndexess.includes(randomIndex));
              
              randomIndexess.push(randomIndex);
              
              const selectedVariation = produks.variations[randomIndex];
              purchasedAccounts.push(selectedVariation);
            }
            produks.variations = produks.variations.filter((_, index) => !purchasedAccounts.includes(produks.variations[index]));
            produks.stock -= pass;

            await produks.save();
            purchaseEmitter.emit('purchase');

            const detailssMessage = purchasedAccounts.join('\n\n\n');
            const fileNames = `${user.growId}.txt`;

            fs.writeFileSync(fileNames, detailssMessage);

            const embedDMs = new EmbedBuilder()
              .setColor('#0099ff')
              .setTitle('Purchase Successful')
              .setDescription(`You have purchased **${pass} ${produks.name.replace(/"/g, '')}** worth **${totalPrice}${wlEmoji}**\n**Don't forget to give reps.**\n`)
              .setImage(imageURL)
              .setTimestamp();
            await interaction.user.send({ embeds: [embedDMs], files: [fileNames] });
            fs.unlinkSync(fileNames);
            break;
          case 'autosend':
            await autosendFunction(user, interaction, produks, pass);
            break;
          default:
            return interaction.reply({ content: 'This product type is not supported.', ephemeral: true });
        }

        await produks.save();
        user.balance -= totalPrice;
        await user.save();

        orderCount = await getOrderCount();
        orderCount++;
        await OrderCount.findOneAndUpdate({}, { count: orderCount }, { upsert: true });

        purchaseEmitter.emit('purchase');

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

        if (logChannel) {
          logChannel.send({ embeds: [purchaseLogEmbed] });
        }

        const purchaseConfirmationEmbed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('Purchase Successful')
          .setDescription(`You have successfully purchased **${pass} ${produks.name}.** Please check your DM!`)
          .setTimestamp();

        interaction.reply({ embeds: [purchaseConfirmationEmbed], ephemeral: true });
        
      } catch (error) {
        console.error('Error:', error);
        return interaction.reply({ content: 'Something went wrong.', ephemeral: true });
      }
    }
  }
};

async function autosendFunction(user, interaction, produks, pass) {
  // Customize this function to handle autosend products
}

async function handleYesType(user, interaction, produks, pass) {
  const totalPrice = produks.price * pass;
  const randomDetails = [];
  
  for (let i = 0; i < pass; i++) {
    const randomIndex = Math.floor(Math.random() * produks.variations.length);
    randomDetails.push(produks.variations[randomIndex]);
  }

  produks.stock -= pass;
  await produks.save();
  purchaseEmitter.emit('purchase');

  const detailsMessages = randomDetails.join('\n');
  const fileNames = `${user.growId}.txt`;

  fs.writeFileSync(fileNames, detailsMessages);

  const embedDMs = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Purchase Successful')
    .setDescription(`You have purchased **${pass} ${produks.name.replace(/"/g, '')}** worth **${totalPrice}${wlEmoji}**\n**Don't forget to give reps.**\n`)
    .setImage(imageURL)
    .setTimestamp();
  await interaction.user.send({ embeds: [embedDMs], files: [fileNames] });

  fs.unlinkSync(fileNames);
}
