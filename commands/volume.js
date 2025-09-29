// commands/volume.js
// Music ka volume set karta hai.

module.exports = {
    data: {
        name: 'volume',
        description: 'संगीत का वॉल्यूम सेट करता है (0-200)।',
        aliases: ['v']
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

        const volumeArg = args[0];
        if (!volumeArg) {
            const currentVolume = Math.round(player.volume * 100);
            return message.reply(`ℹ️ Current Volume: **${currentVolume}%**.\nUse: \`${prefix}volume <0-200>\``);
        }

        const newVolume = parseInt(volumeArg);
        if (isNaN(newVolume) || newVolume < 0 || newVolume > 200) {
            return message.reply('❌ Invalid volume. Kripya 0 se 200 ke beech ek sankhya (number) dein.');
        }
        
        player.setVolume(newVolume);
        
        message.delete().catch(() => {});
    }
};
