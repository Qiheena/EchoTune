// cogs/interactionHandler.js
// Yeh file Discord buttons par hone wale clicks (Interactions) ko handle karti hai.

const { CUSTOM_IDS } = require('../config');

// Cog ke liye naam define karein taki index.js ise Event Handler ki tarah load kare.
module.exports.name = 'interactionHandler';

/**
 * Button interactions ko handle karta hai.
 * @param {import('discord.js').Client} client - Discord client instance
 * @param {import('discord.js').ButtonInteraction} interaction - Button interaction object
 */
module.exports.execute = async (client, interaction) => {
    // 1. Check karein ki user voice channel mein hai ya nahi
    const member = interaction.member;
    const guildId = interaction.guildId;

    if (!member || !member.voice.channel) {
        return interaction.reply({
            content: '🎶 Gaana control karne ke liye aapko pehle voice channel mein hona chahiye!',
            ephemeral: true
        });
    }

    // 2. Music Player instance lo
    const player = client.musicPlayers.get(guildId);
    if (!player) {
        return interaction.reply({
            content: '🛑 Abhi koi gaana nahi chal raha hai.',
            ephemeral: true
        });
    }

    // 3. Command ke adhaar par action lo
    try {
        await interaction.deferUpdate(); // Interaction ko acknowledge karo

        switch (interaction.customId) {
            case CUSTOM_IDS.PLAY_PAUSE:
                if (player.audioPlayer.state.status === 'playing') {
                    player.pause();
                    await interaction.editReply({ content: '⏸️ Gaana roka gaya.' });
                } else {
                    player.resume();
                    await interaction.editReply({ content: '▶️ Gaana phir se shuru hua.' });
                }
                break;

            case CUSTOM_IDS.SKIP:
                player.playNext(true); // Skip is true
                // Reply music player se aaega
                break;

            case CUSTOM_IDS.PREVIOUS:
                player.playPrevious();
                // Reply music player se aaega
                break;

            case CUSTOM_IDS.STOP:
                player.destroy();
                client.musicPlayers.delete(guildId);
                await interaction.editReply({ content: '⏹️ Playback band kiya gaya aur bot channel se hata.' });
                break;
            
            case CUSTOM_IDS.QUEUE:
                // Isme queue list dikhani chahiye. Simple reply de sakte hain.
                const queueList = player.queue.map((track, index) => `${index + 1}. ${track.title}`).join('\n');
                await interaction.editReply({
                    content: `🎶 **Queue List:**\n${queueList || 'Queue khaali hai.'}`,
                    ephemeral: true // Taaki sirf dabane wala user hi dekh sake
                });
                break;
            
            // Note: Volume ya loop change buttons ko yahan handle kiya ja sakta hai agar wo music player embed mein hote.

            default:
                await interaction.editReply({ content: 'Unknown button action.', ephemeral: true });
                break;
        }

        // Action ke baad Music Player Embed ko update karo
        player.updateMessage();

    } catch (error) {
        console.error('Interaction processing error:', error);
        // DeferUpdate ke baad error aaya to editReply use karo
        await interaction.editReply({ content: 'An error occurred while handling the button click.', ephemeral: true });
    }
};
