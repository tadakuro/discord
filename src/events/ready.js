const { Events } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    logger.info(`Logged in as ${client.user.tag}`);
    client.user.setActivity('for unauthorized @everyone pings', { type: 3 }); // Watching
  },
};
