const { SlashCommandBuilder } = require('discord.js');
const yts = require('yt-search');  // YouTube search package
const MusicPlayer = require('../utility/MusicPlayer');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('YouTube या Spotify से गाना बजाएं या क्यू में जोड़ें।')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('गाने का नाम या URL')
                .setRequired(true)),
    aliases: ['p', 'add'],

    /**
     * @param {ExtendedClient} client
     * @param {Message} message
     * @param {string[]} args
     */
    async execute(client, message, args) {
        // Argument check
        if (!args || args.length === 0) {
            return message.reply({ content: '❌ कृपया गाने का नाम या लिंक प्रदान करें!' });
        }

        const query = args.join(' ');

        // Voice channel check
        const voiceChannel = message.member?.voice.channel;
        if (!voiceChannel) {
            return message.reply({ content: '❌ गाना बजाने के लिए आपको एक वॉइस चैनल में होना चाहिए!' });
        }

        // YouTube URL fetch karna: agar direct URL nahi diya to search karo
        let url = query;
        if (!query.startsWith('http')) {
            const searchResult = await yts(query);
            if (!searchResult || !searchResult.videos || searchResult.videos.length === 0) {
                return message.reply({ content: '❌ गाना नहीं मिला!' });
            }
            url = searchResult.videos[0].url;
        }

        // MusicPlayer instance banayein ya existing lein
        let musicPlayer = client.musicPlayers.get(message.guild.id);
        if (!musicPlayer) {
            musicPlayer = new MusicPlayer(client, message.guild);
            client.musicPlayers.set(message.guild.id, musicPlayer);
        }

        // Gaana queue mein add karo
        musicPlayer.addTrack({
            title: query,
            url: url,
            requester: message.author.tag,
        }, message);

        // Agar koi gaana abhi play nahi ho raha, to play start karo
        if (!musicPlayer.current) {
            musicPlayer.playNext();
        }

        return message.reply({ content: `🎵 अब बजा रहा हूँ: **${query}**` });
    },
};
