// File: commands/help.js

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('सभी उपलब्ध कमांड्स की सूची प्रदान करता है।'),
    
    // --- FIX: Add 'h' as an alias ---
    aliases: ['h', 'commands'], 
    
    /**
     * @param {ExtendedClient} client 
     * @param {Message} message
     * @param {string[]} args
     */
    async execute(client, message, args) {
        const commands = client.commands; // client.commands is a Collection
        const uniqueCommands = new Map();

        // Filter out duplicate aliases and only keep the main command entry
        commands.forEach((cmd, name) => {
            if (!uniqueCommands.has(cmd.data.name)) {
                uniqueCommands.set(cmd.data.name, cmd);
            }
        });

        // Map the unique commands to a string list
        const commandList = Array.from(uniqueCommands.values())
            .map(cmd => {
                const prefix = client.config.DEFAULT_PREFIX;
                const name = cmd.data.name;
                const description = cmd.data.description;
                return `\`${prefix}${name}\`: ${description}`;
            })
            .join('\n');

        const embed = new EmbedBuilder()
            .setColor(client.config.EMBED_COLOR || 0x0099ff)
            .setTitle('EchoTune संगीत बॉट कमांड्स')
            .setDescription(`उपलब्ध कमांड्स की सूची:\n\n${commandList}`)
            .setFooter({ text: `उपयोग के लिए अपने मैसेज से पहले '${client.config.DEFAULT_PREFIX}' लगाएं।` });

        message.reply({ embeds: [embed] });
    },
};
