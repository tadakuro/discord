const { PermissionsBitField } = require('discord.js');
const config = require('../config');
const logger = require('./logger');
const { logBanAction } = require('./modLog');

/**
 * Checks whether a message contains an unauthorized @everyone/@here mention
 * and, if so, deletes the user's recent message(s) and bans them.
 * @param {import('discord.js').Message} message
 */
async function handlePotentialViolation(message) {
  // Ignore bots, system messages, and DMs
  if (message.author.bot || !message.guild || !message.member) return;

  // Only act if the message actually pings @everyone or @here
  if (!message.mentions.everyone) return;

  const member = message.member;
  const guild = message.guild;

  // If the member legitimately has permission to mention everyone, skip
  if (member.permissions.has(PermissionsBitField.Flags.MentionEveryone)) {
    return;
  }

  const me = guild.members.me;
  if (!me) return;

  // Make sure the bot itself can ban
  if (!me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
    logger.warn(`Missing Ban Members permission in guild ${guild.id}`);
    return;
  }

  // Role hierarchy safety checks — never attempt to act on someone we can't touch
  if (!member.bannable) {
    logger.warn(
      `Cannot ban ${member.user.tag} in guild ${guild.id} — insufficient role hierarchy or is owner.`,
    );
    return;
  }

  const messageContent = message.content;
  let deletedCount = 0;

  // Delete the triggering message plus their recent messages in this channel
  try {
    if (message.deletable) {
      await message.delete();
      deletedCount++;
    }
  } catch (err) {
    logger.error(`Failed to delete triggering message: ${err.message}`);
  }

  // Optionally clean up a few more of their recent messages in the same channel
  const extraToDelete = Math.max(config.messagesToDelete - 1, 0);
  if (extraToDelete > 0) {
    try {
      const recent = await message.channel.messages.fetch({ limit: 50 });
      const theirMessages = recent
        .filter((m) => m.author.id === member.id && m.deletable)
        .first(extraToDelete);

      for (const msg of theirMessages) {
        try {
          await msg.delete();
          deletedCount++;
        } catch (err) {
          logger.error(`Failed to delete extra message: ${err.message}`);
        }
      }
    } catch (err) {
      logger.error(`Failed to fetch recent messages for cleanup: ${err.message}`);
    }
  }

  // Ban the member
  const reason = 'Unauthorized @everyone/@here mention (automated action)';
  try {
    await member.ban({ reason });
    logger.info(`Banned ${member.user.tag} (${member.id}) in guild ${guild.id} — ${reason}`);

    await logBanAction(guild, {
      user: member.user,
      reason,
      deletedCount,
      messageContent,
    });
  } catch (err) {
    logger.error(`Failed to ban ${member.user.tag}: ${err.message}`);
  }
}

module.exports = { handlePotentialViolation };
