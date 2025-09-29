// commands/stop.js
// Music player ko band karta hai aur bot ko voice channel se hata deta hai.

module.exports = {
    data: {
        name: 'stop',
        description: 'संगीत बजाना बंद करता है और बॉट को वॉयस चैनल से हटा देता है।',
        aliases: ['leave', 'end']
    },
    
    /**
     * @param {object} context
     * @param {import('discord.js').Message} context.message
     * @param {import('../src/Client')} context.client
     */
    async execute({ message, client }) {
        const player = client.musicPlayers.get(message.guildId);

        if (!player) {
            return message.reply('❌ Is server par koi music player active nahi hai jise roka jaa sake.');
        }
        
        // Check if user is in the same channel as bot
        if (message.member.voice.channelId !== player.voiceConnection.joinConfig.channelId) {
             return message.reply('❌ Stop karne ke liye aapko bot ke channel mein hona zaroori hai.');
        }

        player.destroy('User initiated stop command');
        
        await message.reply('👋 Playback band kar diya gaya hai. Main channel chhod raha hoon.');
    }
};
