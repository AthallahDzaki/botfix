const { MessageEmbed } = require('discord.js');
const DiscordUtil = require('./../../util/DiscordUtil');
const Music = require('./../../util/Music');

/**
* Add a youtube song to a user playlist. Redis client must be connected.
* This function only make use of the Youtube API to search videos.
* @param {string} msg - A Discord message.
* @param {object} grace Grace object from the class.
*/
module.exports = async (msg, grace) => {
  const { youtubeAPI } = grace.getConfig();
  if (!youtubeAPI) return;

  const singleArgument = DiscordUtil.getSingleArg(msg);
  const youtubeLinkPos = msg.content.indexOf('youtube.com/watch?v=');

  const search = (youtubeLinkPos === -1)
    ? singleArgument : msg.content.substring(youtubeLinkPos + 20, youtubeLinkPos + 31);
  if (!search || search.length < 5 || search.length > 75) {
    msg.reply('please tell me a valid youtube link or song name! *grrr*').catch(() => {});
    return;
  }

  const searchResults = await Music.searchYoutubeSong(msg, youtubeAPI, search);
  if (!searchResults) {
    msg.reply('song not found or the duration is not short.').catch(() => {});
    return;
  }

  const [songId, songTitle] = searchResults;

  if (!songTitle || !songId) {
    msg.reply('couldn\'t get the song title or id.').catch(() => {});
    return;
  }

  if (songTitle.indexOf('!ST') !== -1 || songTitle.indexOf('!SID') !== -1) {
    msg.reply('that song can\'t be added to the playlist.').catch(() => {});
    return;
  }

  let userPlaylist = await grace.getRedisClient().hget(`user:${msg.author.id}`, 'userPlaylist');
  if (!userPlaylist) userPlaylist = '';
  if (userPlaylist.indexOf(songId) !== -1) {
    msg.reply('this song is already in your playlist! :p').catch(() => {});
    return;
  }

  if (userPlaylist.length >= 270) {
    const playlistLength = Music.getPlaylistLength(userPlaylist);
    if (playlistLength > 14) {
      msg.reply('you reached the maximum amount of songs in your playlist, please remove some or clear it :3')
        .catch(() => {});
      return;
    }
  }

  grace.getRedisClient().hset(`user:${msg.author.id}`, 'userPlaylist', `${userPlaylist + songTitle}!ST${songId}!SID`);

  const embed = new MessageEmbed()
    .setTitle(songTitle)
    .setURL(`https://www.youtube.com/watch?v=${songId}`)
    .setColor(11529967)
    .setThumbnail(`https://img.youtube.com/vi/${songId}/hqdefault.jpg`)
    .setAuthor('Song playing now');
  msg.channel.send('Song added to your playlist!', { embed }).catch(() => {});
};
