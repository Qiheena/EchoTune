// commands/play.js
// Music chalaane ka mukhya command. YouTube URL aur Search dono ko support karta hai.

const ytdl = require('ytdl-core');
const ytSearch = require('yt-search'); // YouTube Search ke liye
const MusicPlayer = require('../utility/MusicPlayer');

module.exports = {
    data: {
        name: 'play',
        description: 'YouTube URL या Search Term से गाना चलाएं/queue में जोड़ें।',
        aliases: ['p', 'add'] 
    },
    
    /**
     * @param {object} context
     * @param {import('discord.js').Message} context.message
     * @param {string[]} context.args
     * @param {import('../src/Client')} context.client
     */
    async execute({ message, args, client }) {
        const query = args.join(' ');
        if (!query) {
            return message.reply('🎶 Kripya ek YouTube URL ya search term dein.');
        }

        const member = message.member;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            return message.reply('🔊 Gaana chalaane ke liye pehle kisi voice channel mein join ho jaiye.');
        }

        const permissions = voiceChannel.permissionsFor(client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            return message.reply('❌ Mujhe voice channel mein judne aur bolne ki anumati nahi hai.');
        }

        let player = client.musicPlayers.get(message.guildId);
        let trackInfo;

        try {
            let videoUrl;
            
            if (ytdl.validateURL(query)) {
                videoUrl = query;
            } else {
                // YOUTUBE SEARCH LOGIC
                const searchResults = await ytSearch(query);
                const videos = searchResults.videos.slice(0, 1);
                
                if (videos.length === 0) {
                    return message.reply('❌ Is search term ke liye koi video nahi mila.');
                }
                videoUrl = videos[0].url;
            }
            
            // Video details fetch karna
            const info = await ytdl.getInfo(videoUrl);
            trackInfo = {
                title: info.videoDetails.title.substring(0, 45),
                url: videoUrl,
                duration: info.videoDetails.lengthSeconds,
                requester: message.author.tag
            };

        } catch (error) {
            console.error('Music Processing Error:', error);
            return message.reply('❌ Video ki jaankari lene ya search karne mein dikkat aayi.');
        }

        if (!player) {
            player = new MusicPlayer(client, message.guild);
            client.musicPlayers.set(message.guildId, player);
            
            const joined = await player.join(voiceChannel);
            if (!joined) return;
        } else if (player.voiceConnection.joinConfig.channelId !== voiceChannel.id) {
            return message.reply('❌ Bot pehle se hi dusre voice channel mein music chala raha hai.');
        }

        player.addTrack(trackInfo, message);
        message.delete().catch(() => {});
    }
};
