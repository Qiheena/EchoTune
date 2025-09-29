// commands/help.js
// बॉट के सभी उपलब्ध कमांड्स को दिखाता है, aliases ke saath.

const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'help',
        description: 'सभी उपलब्ध म्यूजिक और यूटिलिटी कमांड्स दिखाता है।',
        aliases: ['h', 'commands'] // Help ke liye aliases
    },
    
    /**
     * @param {object} context
     * @param {import('discord.js').Message} context.message
     * @param {import('../src/Client')} context.client
     * @param {string} context.prefix - Dynamically fetched prefix.
     */
    async execute({ message, client, prefix }) {
        // Command list banane ke liye mukhya names ka ek set banayein
        const uniqueCommands = new Map();
        
        // Commands ko iterate karein aur mukhya naam se group karein
        client.commands.forEach(command => {
            if (!uniqueCommands.has(command.data.name)) {
                uniqueCommands.set(command.data.name, command);
            }
        });

        const commandFields = Array.from(uniqueCommands.values()).map(command => {
            const name = command.data.name;
            const aliases = command.data.aliases || [];
            
            // Aliases string banao
            const aliasStr = aliases.length > 0 ? ` (Aliases: ${aliases.map(a => `${prefix}${a}`).join(', ')})` : '';

            return {
                name: `${prefix}${name}${aliasStr}`,
                value: command.data.description,
                inline: false,
            };
        });

        const helpEmbed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle('🎶 Discord Music Bot Commands')
            .setDescription(`वर्तमान सर्वर prefix है: \`${prefix}\`\n\nसभी कमांड्स नीचे सूचीबद्ध हैं:`)
            .setFields(commandFields)
            .setFooter({ text: 'संगीत चलाने के लिए !play <URL/Search>' });

        await message.reply({ embeds: [helpEmbed] });
    }
};
