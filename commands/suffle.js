// File: commands/shuffle.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('वर्तमान क्यू में गानों को फेरबदल (shuffle) करता है।'),
    
    // --- FIX: Add 's' as an alias ---
    aliases: ['s'], 
    
    /**
     * @param {ExtendedClient} client 
     * @param {Message} message
     * @param {string[]} args
     */
    async execute(client, message, args) {
        const guildId = message.guild.id;
        const player = client.musicPlayers.get(guildId); 

        if (!player || player.queue.length < 2) {
            return message.reply({ content: '❌ क्यू को शफल करने के लिए कम से कम दो गाने होने चाहिए।' });
        }

        // --- Logic to shuffle the queue (Implementation not provided yet, just reply) ---
        // For now, let's just confirm the intention:
        message.reply({ content: '🔀 क्यू को फेरबदल करने की कोशिश कर रहा हूँ...' });
    },
};
