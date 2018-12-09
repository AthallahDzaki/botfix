const DiscordUtil = require('./../../util/DiscordUtil');

/**
* Display the Discord profile picture of a member.
* @param {string} msg - A str that need to be a Discord message.
* @param {object} grace Grace object from the class.
*/
module.exports = (msg, grace) => {
  const anotherMember = DiscordUtil.findOneMember(msg, grace);
  if (!anotherMember) return;
  msg.channel.send(`There is!! **${anotherMember.displayName}'s** Discord profile picture:\n
${anotherMember.user.displayAvatarURL({ size: 2048 })}`).catch(() => {});
};
