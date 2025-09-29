// config.js
// Bot ke liye Global Settings

const { ActivityType } = require('discord.js');

module.exports = {
    // BOT CONFIGURATION
    TOKEN: process.env.DISCORD_TOKEN,
    DEFAULT_PREFIX: '!',
    PRESENCE: {
        activities: [{ name: 'YouTube Music', type: ActivityType.Listening }],
        status: 'online',
    },

    // PATHS
    COMMANDS_PATH: './commands',
    COGS_PATH: './cogs', // Button/Interaction Handlers

    // MUSIC CONFIGURATION
    MUSIC: {
        MAX_QUEUE_SIZE: 50,
        DEFAULT_VOLUME: 0.8, // 80% volume (0.0 to 1.0)
        INACTIVITY_TIMEOUT_MS: 300000, // 5 minutes
    },

    // CUSTOM BUTTON IDs (Cogs) - Inko cogs/ folder mein handle kiya jaata hai
    CUSTOM_IDS: {
        PLAY_PAUSE: 'music_play_pause',
        SKIP: 'music_skip',
        PREVIOUS: 'music_previous', // Naya ID
        STOP: 'music_stop',
        QUEUE: 'music_show_queue',
        // Loop buttons (Optional: Can be added later)
    },
};
