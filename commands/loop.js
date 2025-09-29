// commands/loop.js
// Music playback loop mode (none, song, queue) ko set karta hai.

module.exports = {
    data: {
        name: 'loop',
        description: 'Loop mode set करता है: `none`, `song` (gaana) या `queue` (katar)।',
        aliases: ['repeat']
    },
    
    /**
     * @param {object} context
     * @param {import('discord.js').Message} context.message
     * @param {string[]} context.args
     * @param {import('../src/Client')} context.client
     */
    async execute({ message, args, client, prefix }) {
        const player = client.musicPlayers.get(message.guildId);

        if (!player) {
            return message.reply('❌ Is server par koi music player active nahi hai.');
        }
        
        const mode = args[0] ? args[0].toLowerCase() : null;
        const validModes = ['none', 'song', 'queue'];

        if (!mode) {
            return message.reply(`ℹ️ Current Loop Mode: **${player.loopMode.toUpperCase()}**.\nUse: \`${prefix}loop <${validModes.join('|')}>\``);
        }

        if (!validModes.includes(mode)) {
            return message.reply(`❌ Invalid mode. Kripya use karein: \`none\`, \`song\`, ya \`queue\``);
        }

        player.setLoopMode(mode);
        
        message.delete().catch(() => {});
    }
};
