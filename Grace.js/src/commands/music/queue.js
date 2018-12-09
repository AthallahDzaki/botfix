const { MessageEmbed } = require('discord.js');
const DiscordUtil = require('./../../util/DiscordUtil');
const GuildQueues = require('./models/guildQueues');

/**
* Show the guild song queue.
* @param {string} msg - A Discord message.
*/
module.exports = async (msg) => {
  const guildQueue = GuildQueues.getQueue(msg.guild.id);
  const singleArgument = DiscordUtil.getSingleArg(msg);

  if (!guildQueue) {
    msg.reply('the guild playlist is empty!! owo').catch(() => {});
    return;
  }

  if (singleArgument && singleArgument === 'clear' && msg.member.hasPermission('MANAGE_MESSAGES')) {
    GuildQueues.clearQueue(msg.guild.id);
    msg.reply('the guild queue is now empty! :3').catch(() => {});
    return;
  }

  let formatedSongs = '';
  for (let i = 0; i < guildQueue.length; i += 1) {
    const songTitle = guildQueue[i].substring(11);
    if (songTitle) formatedSongs += `**[${i + 1}]** ${songTitle}\n`;
  }

  const embed = new MessageEmbed()
    .setTitle(`${msg.guild.name}'s song queue:`)
    .setDescription(formatedSongs.substring(0, 1500))
    .setColor(11529967)
    .setThumbnail(msg.guild.iconURL({ size: 64 }));
  msg.channel.send({ embed }).catch(() => {});
};
