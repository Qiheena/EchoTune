// File: config.js
const { GatewayIntentBits } = require('discord.js');

module.exports = {
    // -------------------------------------------------------------------------
    // General Bot Configuration
    // -------------------------------------------------------------------------
    PREFIX: '!', // Changed from DEFAULT_PREFIX to PREFIX (what your code expects)
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

    // Custom Button IDs for music controls - FIXED STRUCTURE
    // Your code expects CUSTOM_IDS (with underscore) not CUSTOMIDS
    CUSTOM_IDS: {
        PREVIOUS: 'previous',
        PAUSE_RESUME: 'pause_resume',    // Your code expects PAUSE_RESUME, not PLAYPAUSE
        STOP: 'stop',
        NEXT: 'next',                    // Your code expects NEXT, not SKIP
        QUEUE: 'queue'
    }
};