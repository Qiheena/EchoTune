// commands/pause.js
// Gaana bajana rokta hai (Pause/Unpause)

module.exports = {
    data: {
        name: 'pause',
        description: 'वर्तमान में चल रहे गाने को रोकता है या रोके हुए गाने को फिर से शुरू करता है।',
        aliases: ['resume', 'r'] // Aliases added
    },
    
    /**
     * @param {object} context
     * @param {import('discord.js').Message} context.message
     * @param {import('../src/Client')} context.client
     */
    async execute({ message, client }) {
        const player = client.musicPlayers.get(message.guildId);

        if (!player) {
            return message.reply('❌ Is server par koi music player active nahi hai.');
        }
        
        if (!player.current) {
             return message.reply('❌ Koi gaana nahi chal raha hai jise roka jaa sake.');
        }

        player.togglePause();
        
        await message.react('⏯️').catch(() => {});
        message.delete().catch(() => {});
    }
};
