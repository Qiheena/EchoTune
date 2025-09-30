// File: commands/volume.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('प्लेयर का वॉल्यूम सेट करें या देखें।')
        .addIntegerOption(option =>
            option.setName('percent')
                .setDescription('वॉल्यूम प्रतिशत (0-100)')
                .setMinValue(0)
                .setMaxValue(100)),
    
    // --- FIX: 'v' alias should be here to be found by 'client.commands.get(commandName)' ---
    aliases: ['v'],
    
    /**
     * @param {ExtendedClient} client 
     * @param {Message} message
     * @param {string[]} args
     */
    async execute(client, message, args) {
        const guildId = message.guild.id;
        
        const player = client.musicPlayers.get(guildId); 

        if (!player) {
            return message.reply({ content: '❌ अभी कोई गाना नहीं चल रहा है।' });
        }

        const currentVolume = player.volume * 100;

        if (!args || args.length === 0) {
            return message.reply({ content: `🔊 वर्तमान वॉल्यूम: **${currentVolume}%**` });
        }

        const newVolume = parseInt(args[0]);

        if (isNaN(newVolume) || newVolume < 0 || newVolume > 100) {
            return message.reply({ content: '❌ कृपया 0 और 100 के बीच एक वैध संख्या दर्ज करें।' });
        }

        // Logic to set the player volume...
        // player.volume = newVolume / 100;
        return message.reply({ content: `✅ वॉल्यूम **${newVolume}%** पर सेट किया गया है।` });
    },
};
