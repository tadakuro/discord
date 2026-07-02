# Everyone-Ban Bot

Discord bot that automatically deletes the message and bans any member who
pings `@everyone` or `@here` without having permission to do so.

## Features

- Detects `@everyone` / `@here` mentions from members who lack the
  `Mention Everyone` permission
- Deletes the offending message (and optionally a few more of their recent
  messages in the channel)
- Bans the member immediately
- Respects role hierarchy — will never attempt to ban someone it can't
  (checked via `member.bannable`)
- Optional mod-log embed to a log channel
- Built-in Express keepalive server for Render + UptimeRobot

## Project Structure

```
everyone-ban-bot/
├── src/
│   ├── index.js              # Entrypoint
│   ├── server.js             # Express keepalive server
│   ├── config/
│   │   └── index.js          # Env config loader
│   ├── events/
│   │   ├── ready.js
│   │   └── messageCreate.js
│   └── utils/
│       ├── loadEvents.js     # Auto-registers event files
│       ├── moderation.js     # Core ban/delete logic
│       ├── modLog.js         # Log channel embed helper
│       └── logger.js
├── package.json
├── .env.example
└── .gitignore
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your bot token:
   ```bash
   cp .env.example .env
   ```

3. Required Discord Developer Portal settings:
   - Enable **Message Content Intent** and **Server Members Intent** under
     Bot > Privileged Gateway Intents
   - Invite the bot with these permissions: `Ban Members`, `Manage Messages`,
     `Read Messages/View Channels`, `Read Message History`

4. Run locally:
   ```bash
   npm start
   ```

## Environment Variables

| Variable             | Required | Description                                              |
|----------------------|----------|------------------------------------------------------------|
| `DISCORD_TOKEN`       | Yes      | Your bot token                                            |
| `PORT`                | No       | Port for keepalive server (Render sets this automatically) |
| `LOG_CHANNEL_ID`      | No       | Channel ID to post ban logs to                             |
| `MESSAGES_TO_DELETE`  | No       | How many recent messages of the offender to delete (default 1) |

## Deploying on Render

1. Push this project to a GitHub repo.
2. On Render, create a new **Web Service** from that repo.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add your environment variables (`DISCORD_TOKEN`, etc.) in the Render dashboard.
6. Once deployed, Render gives you a URL like `https://your-bot.onrender.com`.

### Keeping it alive with UptimeRobot

Render's free tier spins down web services after inactivity. To prevent that:

1. Create a free monitor at https://uptimerobot.com
2. Monitor type: **HTTP(s)**
3. URL: `https://your-bot.onrender.com/` (the root endpoint returns bot status as JSON)
4. Interval: every 5 minutes

The bot exposes:
- `GET /` — status JSON (bot tag, uptime, guild count)
- `GET /health` — returns `200` if the Discord client is ready, `503` otherwise

## How It Works

1. `messageCreate` fires on every message.
2. `moderation.js` checks `message.mentions.everyone` — true only if the
   message actually pinged `@everyone`/`@here` (not just typed the text).
3. If the author lacks `MentionEveryone` permission, the bot checks it can
   act (`member.bannable`), deletes the message(s), then bans the member.
4. If a log channel is set, an embed with the details is posted there.

## Notes

- Since discord.js v14 distinguishes real mentions from plain text, someone
  typing "@everyone" without it actually pinging (e.g. in a code block, or
  if they lack ping permission entirely at the channel level) won't always
  trigger `mentions.everyone` — Discord itself only registers the mention
  server-side when it actually pings people, so this is reliable.
- The bot will silently skip action if it lacks `Ban Members` permission or
  if the target has a higher/equal role — check logs if it's not banning
  someone you expect it to.
