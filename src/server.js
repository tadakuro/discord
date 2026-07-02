const express = require('express');
const config = require('./config');
const logger = require('./utils/logger');

function startKeepAliveServer(client) {
  const app = express();

  // Root — used by UptimeRobot to ping and keep the Render instance awake
  app.get('/', (req, res) => {
    res.status(200).json({
      status: 'ok',
      bot: client.user ? client.user.tag : 'starting',
      uptime: process.uptime(),
      guilds: client.guilds ? client.guilds.cache.size : 0,
    });
  });

  // Dedicated health check endpoint
  app.get('/health', (req, res) => {
    const ready = client.isReady();
    res.status(ready ? 200 : 503).json({ ready });
  });

  const server = app.listen(config.port, () => {
    logger.info(`Keepalive server listening on port ${config.port}`);
  });

  return server;
}

module.exports = { startKeepAliveServer };
