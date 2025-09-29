// commands/back.js
// Pichle gaane par wapas jaata hai.

module.exports = {
    data: {
        name: 'back',
        description: 'पिछले गाने पर वापस जाता है।',
        aliases: ['previous', 'b']
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
        
        if (player.previous.length === 0) {
            return message.reply('❌ Pichhle gaane ka koi history nahi hai.');
        }

        player.previousTrack();
        
        await message.react('⏪').catch(() => {});
        message.delete().catch(() => {});
    }
};
