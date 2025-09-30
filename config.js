// File: config.js
const { GatewayIntentBits } = require('discord.js');

module.exports = {
    // -------------------------------------------------------------------------
    // General Bot Configuration
    // -------------------------------------------------------------------------
    DEFAULT_PREFIX: '!',
    FIREBASE_DB_URL: 'YOUR_FIREBASE_DB_URL_HERE', // Replace with your actual database URL

    // -------------------------------------------------------------------------
    // Discord Client Options
    // -------------------------------------------------------------------------
    CLIENT_OPTIONS: {
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent, // CRITICAL for command text reading
        ],
    },

    // Visual Settings
    EMBED_COLOR: 0x0099ff,

    // Music Bot Settings
    MUSIC: {
        DEFAULTVOLUME: 0.5,              // Default volume level (between 0 and 1)
        MAXQUEUESIZE: 50,                // Max number of songs in the queue
        INACTIVITYTIMEOUTMS: 300000,    // 5 minutes inactivity timeout in milliseconds
    },

    // Custom Button IDs for music controls if any (example)
    CUSTOMIDS: {
        PREVIOUS: 'previous',
        PLAYPAUSE: 'playpause',
        SKIP: 'skip',
        QUEUE: 'queue',
        STOP: 'stop',
    },
};
