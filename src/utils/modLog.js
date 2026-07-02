const { EmbedBuilder } = require('discord.js');
const config = require('../config');
const logger = require('./logger');

/**
 * Sends a moderation action embed to the configured log channel, if set.
 * @param {import('discord.js').Guild} guild
 * @param {object} details
 */
async function logBanAction(guild, { user, reason, deletedCount, messageContent }) {
  if (!config.logChannelId) return;

  try {
    const channel = await guild.channels.fetch(config.logChannelId);
    if (!channel || !channel.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setTitle('Auto-Ban: Unauthorized @everyone/@here Mention')
      .setColor(0xed4245)
      .addFields(
        { name: 'User', value: `${user.tag} (${user.id})`, inline: false },
        { name: 'Reason', value: reason, inline: false },
        { name: 'Messages Deleted', value: String(deletedCount), inline: true },
      )
      .setTimestamp();

    if (messageContent) {
      embed.addFields({
        name: 'Message Content',
        value: messageContent.slice(0, 1000) || '*(empty)*',
      });
    }

    await channel.send({ embeds: [embed] });
  } catch (err) {
    logger.error('Failed to send mod log:', err.message);
  }
}

module.exports = { logBanAction };
