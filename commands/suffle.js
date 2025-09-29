// commands/shuffle.js
// Queue mein gano ke order ko shuffle karta hai.

module.exports = {
    data: {
        name: 'shuffle',
        description: 'संगीत कतार (queue) में गानों के क्रम को बदलता (shuffle) है।',
        aliases: ['mix']
    },
    
    /**
     * @param {object} context
     * @param {import('discord.js').Message} context.message
     * @param {import('../src/Client')} context.client
     */
    async execute({ message, client }) {
        const player = client.musicPlayers.get(message.guildId);

        if (!player || player.queue.length < 2) {
            return message.reply('❌ Shuffle karne ke liye queue mein kam se kam 2 gaane hone chahiye.');
        }

        player.shuffleQueue();
        
        await message.react('🔀').catch(() => {});
        message.delete().catch(() => {});
    }
};
