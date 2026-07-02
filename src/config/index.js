require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

module.exports = {
  token: required('DISCORD_TOKEN'),
  port: process.env.PORT || 3000,
  logChannelId: process.env.LOG_CHANNEL_ID || null,
  messagesToDelete: parseInt(process.env.MESSAGES_TO_DELETE, 10) || 1,
};