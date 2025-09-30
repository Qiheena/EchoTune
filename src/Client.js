// File: src/Client.js

const { Client, Collection } = require('discord.js');
const { Database } = require('../utility/Database'); // Corrected import
const config = require('../config');

class ExtendedClient extends Client {
    constructor(options) {
        super(options);

        // Store commands as a collection
        this.commands = new Collection();
        
        // Store button interactions (for music controls)
        this.cogs = new Collection();

        // Music player instances (map Guild ID to player state)
        // This fixes the 'musicPlayers' undefined error.
        this.musicPlayers = new Map(); 

        // Store configuration
        this.config = config;
        
        // Use a private property to store the database instance
        this._database = null;
    }

    /**
     * Getter for the database instance. Loads it lazily.
     * This fixes the 'Database is not a constructor' error.
     */
    get database() {
        if (!this._database) {
            this._database = new Database();
        }
        return this._database;
    }

    // Add other methods like loadCommands, loadEvents here...
}

module.exports = { ExtendedClient };
