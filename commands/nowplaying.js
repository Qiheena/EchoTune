// commands/nowplaying.js
// Vartmaan mein chal rahe gaane ki jaankari deta hai.

const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'nowplaying',
        description: 'वर्तमान में चल रहे गाने की विस्तृत जानकारी दिखाता है।',
        aliases: ['np', 'current']
    },
    
    /**
     * @param {object} context
     * @param {import('discord.js').Message} context.message
     * @param {import('../src/Client')} context.client
     */
    async execute({ message, client }) {
        const player = client.musicPlayers.get(message.guildId);

        if (!player || !player.current) {
            return message.reply('❌ Abhi koi gaana nahi chal raha hai.');
        }
        
        // MusicPlayer ke updated message logic ka upyog karein
        const { embeds } = player.getPlaybackMessageContent();

        // Thoda extra detail jodein
        const npEmbed = new EmbedBuilder(embeds[0].toJSON()) // Existing embed ko copy karein
            .setTitle(`🎵 Ab Chal Raha Hai: ${player.current.title}`)
            .setDescription(`URL: ${player.current.url}`)
            .setFooter({ text: `Loop Mode: ${player.loopMode.toUpperCase()} | Queue Size: ${player.queue.length}` });

        await message.reply({ embeds: [npEmbed] });
        message.delete().catch(() => {});
    }
};
