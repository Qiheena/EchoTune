// cogs/interactionHandler.js
// Yeh file Discord Buttons (Interactions) ko handle karti hai.
// Har customId ke liye ek 'cog' (handler) define kiya gaya hai.

const { CUSTOM_IDS } = require('../config');

// === PREVIOUS BUTTON HANDLER ===
module.exports[CUSTOM_IDS.PREVIOUS] = {
    // Custom ID, jo MusicPlayer ke buttons mein set kiya gaya hai
    name: CUSTOM_IDS.PREVIOUS, 
    
    /**
     * Pichhle gaane par jaane ke liye
     * @param {object} context
     * @param {import('discord.js').ButtonInteraction} context.interaction
     * @param {import('../utility/MusicPlayer')} context.player
     */
    async execute({ interaction, player }) {
        if (!player.previousTrack()) {
            return interaction.reply({ 
                content: '❌ Pichhle gaane par nahi jaa sakte, history khali hai!', 
                ephemeral: true 
            });
        }
        // Interaction ko acknowledge karein taaki "is thinking" message chala jaaye
        await interaction.deferUpdate(); 
    }
};

// === PLAY/PAUSE BUTTON HANDLER ===
module.exports[CUSTOM_IDS.PLAY_PAUSE] = {
    name: CUSTOM_IDS.PLAY_PAUSE,
    
    /**
     * Gaane ko rokne aur fir se chalaane ke liye
     * @param {object} context
     * @param {import('discord.js').ButtonInteraction} context.interaction
     * @param {import('../utility/MusicPlayer')} context.player
     */
    async execute({ interaction, player }) {
        if (!player.current) {
             return interaction.reply({ 
                content: '❌ Koi gaana nahi chal raha hai jise roka ya shuru kiya jaa sake.', 
                ephemeral: true 
            });
        }
        player.togglePause();
        await interaction.deferUpdate();
    }
};

// === SKIP BUTTON HANDLER ===
module.exports[CUSTOM_IDS.SKIP] = {
    name: CUSTOM_IDS.SKIP,
    
    /**
     * Agle gaane par jaane ke liye
     * @param {object} context
     * @param {import('discord.js').ButtonInteraction} context.interaction
     * @param {import('../utility/MusicPlayer')} context.player
     */
    async execute({ interaction, player }) {
        if (player.queue.length === 0 && player.loopMode !== 'queue') {
            return interaction.reply({ 
                content: '❌ Queue mein aur koi gaana nahi hai jise chalaaya jaa sake.', 
                ephemeral: true 
            });
        }
        player.skip();
        await interaction.deferUpdate();
    }
};

// === STOP BUTTON HANDLER ===
module.exports[CUSTOM_IDS.STOP] = {
    name: CUSTOM_IDS.STOP,
    
    /**
     * Bot ko band karke channel se hataane ke liye
     * @param {object} context
     * @param {import('discord.js').ButtonInteraction} context.interaction
     * @param {import('../utility/MusicPlayer')} context.player
     */
    async execute({ interaction, player }) {
        player.destroy('User stopped via button');
        
        // Button ko response dena, ye message ko update kar dega aur buttons hata dega
        await interaction.update({ 
            content: '👋 Playback band kar diya gaya hai. Bot channel chhod raha hai.',
            embeds: [],
            components: [] 
        });
    }
};

// === QUEUE BUTTON HANDLER ===
module.exports[CUSTOM_IDS.QUEUE] = {
    name: CUSTOM_IDS.QUEUE,
    
    /**
     * Queue ki list dikhaane ke liye
     * @param {object} context
     * @param {import('discord.js').ButtonInteraction} context.interaction
     * @param {import('../utility/MusicPlayer')} context.player
     */
    async execute({ interaction, player }) {
        if (!player.current) {
             return interaction.reply({ 
                content: '❌ Abhi koi gaana nahi chal raha hai aur na hi queue mein koi item hai.', 
                ephemeral: true 
            });
        }

        const queue = player.queue;
        const queueLength = queue.length;
        
        let description = `▶️ **Ab Chal Raha Hai:** [${player.current.title}](${player.current.url})\n\n`;

        if (queueLength === 0) {
            description += '📜 **Queue Khali Hai**।';
        } else {
            const queueList = queue.slice(0, 5).map((track, index) => 
                `**${index + 1}.** [${track.title}](${track.url})`
            ).join('\n');
            
            description += `📜 **Queue (${queueLength} items):**\n${queueList}`;
            
            if (queueLength > 5) {
                description += `\n...Aur ${queueLength - 5} gaane line mein hain.`;
            }
        }

        await interaction.reply({
            content: description,
            ephemeral: true // Yeh message sirf button dabane waale ko dikhega
        });
    }
};
