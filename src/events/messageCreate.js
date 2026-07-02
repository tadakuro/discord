const { Events } = require('discord.js');
const { handlePotentialViolation } = require('../utils/moderation');
const logger = require('../utils/logger');

module.exports = {
  name: Events.MessageCreate,
  once: false,
  async execute(message) {
    try {
      await handlePotentialViolation(message);
    } catch (err) {
      logger.error('Unhandled error in messageCreate handler:', err);
    }
  },
};