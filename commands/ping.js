const os = require('os');
const { Client, EmbedBuilder } = require('discord.js');
const { ownerid } = require('../config.json');

module.exports = {
  name: 'ping',
  description: 'Display ping, uptime, and CPU load',
  async execute(message, args, client) {

    const pingMessage = await sendPingMessage(message, client);

    message.channel.send({ embeds: [pingMessage] });
  },
};

async function sendPingMessage(message, client) {
  const uptime = formatUptime(client.uptime);
  const ping = client.ws.ping;
  const cpuLoad = os.loadavg()[0]; // CPU load average for 1 minute

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Ping, Uptime, and CPU Load')
    .addFields(
      { name: 'Ping', value: `${ping}ms` },
      { name: 'Uptime', value: uptime, inline: true },
      { name: 'CPU Load', value: `${cpuLoad.toFixed(2)}`, inline: true },
    )
    .setTimestamp();

  return embed;
}

function formatUptime(uptime) {
  const seconds = Math.floor((uptime / 1000) % 60);
  const minutes = Math.floor((uptime / (1000 * 60)) % 60);
  const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
  const days = Math.floor(uptime / (1000 * 60 * 60 * 24));

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
