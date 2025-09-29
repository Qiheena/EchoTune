// commands/next.js
// वर्तमान गाने को skip करके queue में अगले गाने पर जाता है।

module.exports = {
    data: {
        name: 'next',
        description: 'वर्तमान गाने को स्किप करके कतार (queue) में अगले गाने पर जाता है।',
        aliases: ['skip', 's'] // Aliases added
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
        
        if (player.queue.length === 0 && player.loopMode !== 'queue') {
             return message.reply('❌ Queue mein aur koi gaana nahi hai jise chalaaya jaa sake.');
        }

        player.skip();
        
        await message.react('⏭️').catch(() => {});
        message.delete().catch(() => {});
    }
};
