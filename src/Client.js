// src/Client.js
// Discord Client ko extend karke hum ismein music player aur commands collections jaisi custom properties jodd rahe hain.

const { Client, Collection } = require('discord.js');
const { getFirestore } = require('firebase-admin/firestore'); // Firestore admin SDK
const config = require('../config');

class MusicClient extends Client {
    constructor() {
        super({ intents: config.intents });

        // Command files ko store karne ke liye
        /** @type {Collection<string, object>} */
        this.commands = new Collection(); 

        // Interaction (Button/Select Menu) handlers ko store karne ke liye
        /** @type {Collection<string, object>} */
        this.cogs = new Collection(); 

        // Active MusicPlayer instances ko store karne ke liye (guildId ke saath mapped)
        /** @type {Collection<string, import('../utility/MusicPlayer')>} */
        this.musicPlayers = new Collection(); 

        // Database instance
        this.db = getFirestore();
    }
}

module.exports = MusicClient;
