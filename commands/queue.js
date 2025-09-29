// commands/queue.js
// Queue mein sabhi gano ki list dikhata hai.

const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'queue',
        description: 'संगीत कतार (queue) में अगले गाने दिखाता है।',
        aliases: ['q', 'list'] // Aliases added
    },
    
    /**
     * @param {object} context
     * @param {import('discord.js').Message} context.message
     * @param {import('../src/Client')} context.client
     */
    async execute({ message, client }) {
        const player = client.musicPlayers.get(message.guildId);

        if (!player || !player.current) {
            return message.reply('❌ Abhi koi gaana nahi chal raha hai aur na hi queue mein koi item hai.');
        }
        
        const currentTrack = player.current;
        const queue = player.queue;
        const queueLength = queue.length;
        
        let description = `▶️ **Ab Chal Raha Hai:** [${currentTrack.title}](${currentTrack.url})\n\n`;

        if (queueLength === 0) {
            description += '📜 **Queue Khali Hai**। Agla gaana nahi hai.';
        } else {
            const queueList = queue.slice(0, 10).map((track, index) => 
                `**${index + 1}.** [${track.title}](${track.url})`
            ).join('\n');
            
            description += `📜 **Queue (${queueLength} items):**\n${queueList}`;
            
            if (queueLength > 10) {
                description += `\n...Aur ${queueLength - 10} gaane line mein hain.`;
            }
        }

        const queueEmbed = new EmbedBuilder()
            .setColor(0x2ECC71) // Green
            .setTitle(`🎶 ${message.guild.name} की संगीत कतार`)
            .setDescription(description)
            .setFooter({ text: `Loop Mode: ${player.loopMode.toUpperCase()} | Total Songs: ${queueLength + 1}` });

        await message.reply({ embeds: [queueEmbed] });
    }
};
