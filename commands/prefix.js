// commands/prefix.js
// Server ka custom prefix set karta hai aur use database mein save karta hai.

const { setGuildSettings } = require('../utility/Database');
const config = require('../config');

module.exports = {
    data: {
        name: 'prefix',
        description: 'सर्वर के लिए एक नया कस्टम कमांड prefix सेट करता है।',
        aliases: ['setprefix', 'setp'] // Aliases added
    },
    
    /**
     * @param {object} context
     * @param {import('discord.js').Message} context.message
     * @param {string[]} context.args
     * @param {string} context.prefix - Current prefix.
     */
    async execute({ message, args, prefix }) {
        // 1. Permission Check
        if (!message.member.permissions.has('MANAGE_GUILD')) {
            return message.reply('❌ आपको इस कमांड का उपयोग करने के लिए `Manage Server` (सर्वर प्रबंधित करें) की अनुमति चाहिए।');
        }

        const newPrefix = args[0];

        if (!newPrefix) {
            return message.reply(`ℹ️ वर्तमान prefix है: \`${prefix}\`। नया prefix सेट करने के लिए उपयोग करें: \`${prefix}prefix <नया_prefix>\``);
        }

        if (newPrefix.length > 5) {
            return message.reply('❌ Prefix 5 अक्षरों से अधिक लंबा नहीं होना चाहिए।');
        }
        
        if (newPrefix === prefix) {
            return message.reply(`✅ Prefix पहले से ही \`${newPrefix}\` सेट है।`);
        }

        // 2. Save to Database
        await setGuildSettings(message.guildId, { prefix: newPrefix });

        // 3. Confirmation
        await message.reply(`✅ नया prefix सफलतापूर्वक सेट किया गया है: \`${newPrefix}\`। अब से मेरे कमांड्स \`${newPrefix}help\` से शुरू होंगे।`);
    }
};
