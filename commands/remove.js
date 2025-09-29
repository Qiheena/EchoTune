// commands/remove.js
// Queue se ek specific gaana hatata hai.

module.exports = {
    data: {
        name: 'remove',
        description: 'Queue से एक निश्चित नंबर का गाना हटाता है।',
        aliases: ['rm']
    },
    
    /**
     * @param {object} context
     * @param {import('discord.js').Message} context.message
     * @param {string[]} context.args
     * @param {import('../src/Client')} context.client
     */
    async execute({ message, args, client, prefix }) {
        const player = client.musicPlayers.get(message.guildId);

        if (!player || player.queue.length === 0) {
            return message.reply('❌ Queue mein koi gaana nahi hai jise hataya jaa sake.');
        }

        const index = parseInt(args[0]);
        
        if (isNaN(index) || index < 1 || index > player.queue.length) {
            return message.reply(`❌ Invalid index. Kripya 1 aur ${player.queue.length} ke beech ki sankhya dein.\nExample: \`${prefix}remove 3\``);
        }

        player.removeTrack(index);
        
        message.delete().catch(() => {});
    }
};
