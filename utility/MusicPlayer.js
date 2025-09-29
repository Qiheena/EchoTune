// utility/MusicPlayer.js
// यह क्लास Discord server ke liye music playback, queue aur state ko manage karti hai.

const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    AudioPlayerStatus, 
    createAudioResource, 
    VoiceConnectionStatus,
    entersState,
    StreamType, // Required for volume
} = require('@discordjs/voice');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const ytdl = require('ytdl-core');
const config = require('../config');

class MusicPlayer {
    /**
     * @param {import('../src/Client')} client - Hamara extended Discord Client.
     * @param {import('discord.js').Guild} guild - Server jahan music chal raha hai.
     */
    constructor(client, guild) {
        this.client = client;
        this.guild = guild;
        this.queue = [];
        this.previous = []; // Previous songs ke liye
        this.current = null;
        this.loopMode = 'none'; // 'none', 'song', 'queue'
        this.volume = config.MUSIC.DEFAULT_VOLUME; // Default volume set kiya
        this.message = null; // Playback message reference
        this.timeout = null; // Inactivity timeout
        
        // Audio Player aur Connection ka setup
        this.audioPlayer = createAudioPlayer();
        this.voiceConnection = null;

        // Player events ko handle karna
        this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
            console.log('AudioPlayer is Idle. Moving to next track.');
            this.playNext();
        });

        this.audioPlayer.on('error', error => {
            console.error(`Audio Player Error: ${error.message} with resource ${error.resource?.metadata.title}`);
            this.sendFeedback(`❌ Audio player mein ek error aaya: ${error.message}`);
            this.playNext(true); // Error ke baad bhi aage badho
        });
    }

    /**
     * Bot ko voice channel mein jodata hai.
     * @param {import('discord.js').VoiceChannel} channel - Voice channel jahan bot ko join karna hai.
     */
    async join(channel) {
        // ... (Join logic remains the same) ...
        try {
            this.voiceConnection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });
            
            await entersState(this.voiceConnection, VoiceConnectionStatus.Ready, 5000);
            this.voiceConnection.subscribe(this.audioPlayer);
            
            this.voiceConnection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
                if (newState.reason === 4) { 
                    this.destroy('Manual Disconnect');
                }
            });

            this.voiceConnection.on(VoiceConnectionStatus.Destroyed, () => {
                this.destroy('Connection Destroyed');
            });
            
            this.setInactivityTimeout();
            
            return true;
        } catch (error) {
            console.error('Voice connection join failed:', error);
            this.sendFeedback(`❌ Voice channel se judne mein asafal raha: ${error.message}`);
            this.destroy('Join Failed');
            return false;
        }
    }

    /**
     * Inactivity timeout set karta hai.
     */
    setInactivityTimeout() {
        if (this.timeout) clearTimeout(this.timeout);
        
        // 5 minute (300000 ms)
        this.timeout = setTimeout(() => {
            if (this.audioPlayer.state.status === AudioPlayerStatus.Idle && this.queue.length === 0) {
                this.sendFeedback('⏰ Koi activity nahi, main channel chhod raha hoon.');
                this.destroy('Inactivity Timeout');
            }
        }, config.MUSIC.INACTIVITY_TIMEOUT_MS); 
    }

    /**
     * Queue mein ek naya gana jodata hai.
     * @param {object} track - Gane ka object (title, url, duration).
     * @param {import('discord.js').ChatInputCommandInteraction|import('discord.js').Message} interaction - Jahan se command aaya.
     */
    addTrack(track, interaction) {
        if (this.queue.length >= config.MUSIC.MAX_QUEUE_SIZE) {
            this.sendFeedback('❌ Queue full hai! Maximum 50 gaane ho sakte hain.');
            return;
        }
        this.queue.push(track);
        
        if (!this.current) {
            this.playNext();
        } else {
            this.sendFeedback(`🎶 **${track.title}** queue mein jod diya gaya hai. (${this.queue.length} gaane line mein)`);
        }
    }

    /**
     * Queue se agla gana chalta hai.
     * @param {boolean} errorSkip - Kya yeh skip error ke karan hua hai?
     * @param {boolean} isBackTrack - Kya yeh previous button se aaya hai?
     */
    async playNext(errorSkip = false, isBackTrack = false) {
        this.setInactivityTimeout();

        if (this.current && !errorSkip && !isBackTrack) {
            if (this.loopMode === 'song') {
                // Current song wapas queue mein nahi jayega, bas use dobara chalao
            } else if (this.loopMode === 'queue') {
                // Current song ko queue ke end mein jod do
                this.queue.push(this.current);
                this.previous.push(this.current);
            } else {
                // Normal mode
                this.previous.push(this.current);
            }
        }

        if (this.previous.length > 20) this.previous.shift();

        if (this.queue.length === 0 && this.loopMode === 'none' && !isBackTrack) {
            this.current = null;
            this.audioPlayer.stop();
            this.sendFeedback('✅ Queue khatam ho gaya hai. Main 5 minute mein disconnect ho jaunga.');
            this.updatePlaybackMessage();
            return;
        }
        
        if (!isBackTrack) {
             if (this.loopMode !== 'song' || !this.current || errorSkip) {
                 this.current = this.queue.shift();
             }
        }
        
        if (!this.current) return;

        try {
            const stream = ytdl(this.current.url, {
                filter: 'audioonly',
                quality: 'highestaudio',
                highWaterMark: 1 << 25,
            });

            // Volume ko manage karne ke liye resource banayein
            const resource = createAudioResource(stream, { 
                inputType: StreamType.Arbitrary, // Use Arbitrary input type
                metadata: { title: this.current.title },
                inlineVolume: true, // Volume control ke liye zaroori
            });
            
            // Resource ka volume set karein
            resource.volume.setVolume(this.volume);

            this.audioPlayer.play(resource);
            
            await entersState(this.audioPlayer, AudioPlayerStatus.Playing, 5000);

            this.sendFeedback(`▶️ Ab chal raha hai: **${this.current.title}**`);
            this.updatePlaybackMessage();

        } catch (error) {
            console.error(`Error playing track ${this.current.title}:`, error);
            this.sendFeedback(`❌ **${this.current.title}** ko chalaane mein dikkat aayi. Agle gaane par badh rahe hain.`);
            this.playNext(true);
        }
    }
    
    /**
     * Volume ko set karta hai.
     * @param {number} newVolume - Naya volume level (0 se 200 tak, 1.0 = 100%).
     */
    setVolume(newVolume) {
        // Volume 0.0 to 2.0 (0% to 200%) tak set kar sakte hain
        const volumeFactor = Math.min(2.0, Math.max(0.0, newVolume / 100)); 
        this.volume = volumeFactor;

        // Agar gaana chal raha hai, to uske resource ka volume turant update karein
        if (this.audioPlayer.state.resource && this.audioPlayer.state.resource.volume) {
            this.audioPlayer.state.resource.volume.setVolume(this.volume);
        }
        
        this.sendFeedback(`🔊 Volume set kiya gaya: **${Math.round(this.volume * 100)}%**`);
        this.updatePlaybackMessage();
    }


    /**
     * Loop mode ko set karta hai (none, song, queue).
     * @param {string} mode - Naya loop mode.
     */
    setLoopMode(mode) {
        const validModes = ['none', 'song', 'queue'];
        if (!validModes.includes(mode)) {
            this.sendFeedback(`❌ Invalid loop mode: ${mode}. Valid modes: ${validModes.join(', ')}`);
            return;
        }
        this.loopMode = mode;
        this.sendFeedback(`🔁 Loop mode set to: **${mode.toUpperCase()}**`);
        this.updatePlaybackMessage();
    }


    /**
     * Play/Pause button ko toggle karta hai.
     */
    togglePause() {
        if (this.audioPlayer.state.status === AudioPlayerStatus.Playing) {
            this.audioPlayer.pause();
            this.sendFeedback('⏸️ Gaana rok diya gaya hai.');
        } else if (this.audioPlayer.state.status === AudioPlayerStatus.Paused) {
            this.audioPlayer.unpause();
            this.sendFeedback('▶️ Gaana fir se shuru ho gaya hai.');
        }
        this.updatePlaybackMessage();
    }
    
    /**
     * Agle gaane par skip karta hai.
     */
    skip() {
        if (this.queue.length === 0 && this.loopMode !== 'queue') {
            this.sendFeedback('❌ Queue mein aur koi gaana nahi hai.');
            return;
        }
        this.audioPlayer.stop();
        this.sendFeedback('⏭️ Gaana skip kiya gaya.');
    }

    /**
     * Pichle gaane par wapas aata hai.
     */
    previousTrack() {
        if (this.previous.length < 1) {
            this.sendFeedback('❌ Pichhle gaane ka koi history nahi hai.');
            return false;
        }
        // Current song ko wapas queue ke shuru mein daal dein
        if (this.current) {
            this.queue.unshift(this.current);
        }
        
        // Pichla gaana nikal kar current bana dein
        this.current = this.previous.pop(); 
        
        // Force play the current track (flag isBackTrack = true)
        this.playNext(false, true); 
        this.sendFeedback('⏮️ Pichla gaana fir se chala raha hoon.');
        return true;
    }

    /**
     * Queue mein ek specific index se gaana hatata hai.
     * @param {number} index - Queue index (1-based).
     */
    removeTrack(index) {
        if (index > 0 && index <= this.queue.length) {
            const removed = this.queue.splice(index - 1, 1);
            this.sendFeedback(`🗑️ Queue se **${removed[0].title}** (#${index}) hata diya gaya.`);
            this.updatePlaybackMessage();
            return true;
        }
        return false;
    }

    /**
     * Queue ko shuffle (ulta-pulta) karta hai.
     */
    shuffleQueue() {
        for (let i = this.queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
        }
        this.sendFeedback('🔀 Queue ko shuffle kar diya gaya hai.');
        this.updatePlaybackMessage();
    }
    
    /**
     * Bot ko voice channel se disconnect karta hai aur sab kuch saaf (cleanup) karta hai.
     * @param {string} reason - Disconnect ka karan.
     */
    destroy(reason) {
        console.log(`Destroying player for guild ${this.guild.id}. Reason: ${reason}`);
        
        if (this.voiceConnection) {
            this.voiceConnection.destroy();
        }
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        if (this.message) {
            // Hum message ko delete karne ke bajaye 'Player Stop' state mein update karenge
            // Taki log button-spam na karein, aur log history dekh sakein.
            this.message.edit({
                embeds: [new EmbedBuilder().setColor(0x808080).setTitle('⏹️ Playback System Stopped').setDescription('Bot channel se hata diya gaya.')],
                components: []
            }).catch(() => {});
        }
        this.client.musicPlayers.delete(this.guild.id);
    }
    
    /**
     * Buttons ke saath embed message banata hai.
     * @returns {{embeds: EmbedBuilder[], components: ActionRowBuilder[]}}
     */
    getPlaybackMessageContent() {
        // ... (Button logic remains the same, but fields/footer updated) ...
        const isPlaying = this.audioPlayer.state.status === AudioPlayerStatus.Playing;
        const statusIcon = isPlaying ? '▶️' : (this.audioPlayer.state.status === AudioPlayerStatus.Paused ? '⏸️' : '⏹️');
        const queueStatus = this.queue.length > 0 ? `+${this.queue.length} aur` : 'Queue Khali';
        
        let loopIcon = '';
        if (this.loopMode === 'song') loopIcon = '🔂';
        if (this.loopMode === 'queue') loopIcon = '🔁';
        
        const volumeDisplay = Math.round(this.volume * 100);

        const embed = new EmbedBuilder()
            .setColor(isPlaying ? 0x00A86B : 0xFFA500)
            .setTitle(`${statusIcon} ${loopIcon} ${this.current ? 'Ab Chal Raha Hai' : 'Playback System Ready'}`)
            .setDescription(this.current ? 
                `**[${this.current.title}](${this.current.url})**\n*Requester: ${this.current.requester}*` : 
                `Koi gaana nahi chal raha hai.`)
            .setFields([
                { name: 'Queue Size', value: `${this.queue.length}`, inline: true },
                { name: 'Volume', value: `🔊 ${volumeDisplay}%`, inline: true },
                { name: 'Loop Mode', value: `${this.loopMode.toUpperCase()}`, inline: true },
            ])
            .setThumbnail(this.current ? `https://img.youtube.com/vi/${ytdl.getVideoID(this.current.url)}/default.jpg` : null)
            .setFooter({ text: `Next: ${this.queue[0]?.title || 'Koi nahi'}` });

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(config.CUSTOM_IDS.PREVIOUS)
                .setLabel('⏮️ Pichla')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(this.previous.length === 0),
            new ButtonBuilder()
                .setCustomId(config.CUSTOM_IDS.PLAY_PAUSE)
                .setLabel(isPlaying ? '⏸️ Roko' : '▶️ Chalao')
                .setStyle(isPlaying ? ButtonStyle.Danger : ButtonStyle.Success)
                .setDisabled(!this.current),
            new ButtonBuilder()
                .setCustomId(config.CUSTOM_IDS.SKIP)
                .setLabel('⏭️ Skip')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(this.queue.length === 0 && this.loopMode !== 'queue'),
        );
        
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(config.CUSTOM_IDS.QUEUE)
                .setLabel('📜 Queue Dekho')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(config.CUSTOM_IDS.STOP)
                .setLabel('⏹️ Band Karo')
                .setStyle(ButtonStyle.Danger),
        );

        return { embeds: [embed], components: [row1, row2] };
    }

    /**
     * Playback message ko update karta hai ya naya message bhejta hai.
     */
    async updatePlaybackMessage() {
        const content = this.getPlaybackMessageContent();
        
        if (this.message && this.message.editable) {
            await this.message.edit(content).catch(e => console.error('Error editing message:', e));
        } else if (this.guild.systemChannel) {
            this.message = await this.guild.systemChannel.send(content).catch(e => console.error('Error sending new message:', e));
        }
    }
    
    /**
     * User ko feedback message bhejta hai.
     * @param {string} content - Message content.
     */
    sendFeedback(content) {
        if (this.guild.systemChannel) {
            this.guild.systemChannel.send(content).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 10000);
            }).catch(() => {});
        }
    }
}

module.exports = MusicPlayer;
