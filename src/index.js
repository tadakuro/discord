const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config');
const logger = require('./utils/logger');
const { loadEvents } = require('./utils/loadEvents');
const { startKeepAliveServer } = require('./server');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel],
});

loadEvents(client);

// Start the HTTP keepalive server (for Render + UptimeRobot) regardless of
// Discord connection state, so health checks succeed even during reconnects.
startKeepAliveServer(client);

client.login(config.token).catch((err) => {
  logger.error('Failed to log in to Discord:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled promise rejection:', err);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully.');
  client.destroy();
  process.exit(0);
});
