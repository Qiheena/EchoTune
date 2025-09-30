// File: index.js

require('dotenv').config();
require("./server")
const { ExtendedClient } = require('./src/Client');
const { readdirSync } = require('fs');
const { resolve } = require('path');
const config = require('./config');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// --------------------------------------------------------------------------------
// Firebase Admin SDK Initialization
// --------------------------------------------------------------------------------
try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_PRIVATE_KEY);

    // Check if the app is already initialized
    let app;
    try {
        app = initializeApp(
            {
                credential: serviceAccount,
                databaseURL: config.FIREBASE_DB_URL,
            },
            'discord_bot_admin_app' // Use a custom name to avoid default app conflict
        );
    } catch (e) {
        // If an app with this name already exists, reuse it
        app = initializeApp(undefined, 'discord_bot_admin_app');
    }

    const auth = getAuth(app);

    console.log('✅ Firebase Admin SDK initialized successfully.');
} catch (error) {
    if (process.env.NODE_ENV !== 'production') {
        console.warn(
            '⚠️ Firebase Admin SDK initialization skipped. Check FIREBASE_PRIVATE_KEY in .env file.'
        );
    } else {
        console.error('❌ Firebase Admin SDK initialization failed:', error.message);
    }
}

// --------------------------------------------------------------------------------
// File Loader Helper Function
// --------------------------------------------------------------------------------
/**
 * Loads command or cog files recursively.
 * @param {ExtendedClient} client The Discord client instance.
 * @param {string} dirPath The directory path to scan.
 * @param {'commands'|'cogs'} collectionName The name of the client's collection to store the files.
 */
function loadFiles(client, dirPath, collectionName) {
    const files = readdirSync(resolve(__dirname, dirPath));
    const collection = client[collectionName]; // Get client.commands or client.cogs

    for (const file of files) {
        const filePath = resolve(__dirname, dirPath, file);

        if (file.endsWith('.js')) {
            try {
                // Remove module cache to allow hot-reloading
                delete require.cache[filePath];

                const module = require(filePath);

                // Get the actual command/cog object
                const fileModule = module.default || module;

                // Check for required properties
                if (!fileModule || (!fileModule.execute && !fileModule.data && !fileModule.run)) {
                    console.warn(
                        `⚠️ ${file} mein 'data' ya 'execute' property missing hai. Skip kiya gaya.`
                    );
                    continue;
                }

                // Use the file name as the command/cog name if not specified
                const name = fileModule.data?.name || file.replace('.js', '');
                collection.set(name, fileModule);
                console.log(`✅ ${file} successfully loaded into ./${collectionName}.`);

                // Handle command aliases if present
                if (collectionName === 'commands' && fileModule.aliases) {
                    fileModule.aliases.forEach((alias) => {
                        collection.set(alias, fileModule);
                        console.log(`  -> Alias '${alias}' mapped to '${name}'`);
                    });
                }
            } catch (error) {
                console.error(`❌ ${file} load karte waqt error: ${error.name}: ${error.message}`);
                console.error(error.stack.split('\n')[1]); // Show where the error occurred
            }
        }
    }
}

// --------------------------------------------------------------------------------
// Client Initialization
// --------------------------------------------------------------------------------
const client = new ExtendedClient({
    intents: config.CLIENT_OPTIONS.intents,
});

// Load all commands and cogs
loadFiles(client, 'commands', 'commands');
loadFiles(client, 'cogs', 'cogs');

// --------------------------------------------------------------------------------
// Discord Event Handlers
// --------------------------------------------------------------------------------

// Ready Event
client.on('ready', () => {
    console.log(`🤖 Bot Ready! Logged in as ${client.user.tag}`);
    console.log(`Bot is in ${client.guilds.cache.size} servers.`);
});

// MessageCreate Event (Handling prefix commands)
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild || !client.user) return;

    // --- DEBUGGING STEP 1: Check if message is received ---
    console.log(`[DEBUG] Message received: ${message.content} (from ${message.author.tag})`);

    // Get the prefix for this guild
    let prefix = config.DEFAULT_PREFIX;
    try {
        prefix = await client.database.getPrefix(message.guild.id);
        if (!prefix) {
            prefix = config.DEFAULT_PREFIX;
        }
    } catch (error) {
        console.error(
            'Error fetching prefix from Firestore (using default prefix):',
            error.message
        );
    }

    // --- DEBUGGING STEP 2: Check which prefix is being used ---
    console.log(`[DEBUG] Using prefix: ${prefix}`);

    if (!message.content.startsWith(prefix)) return;

    // --- DEBUGGING STEP 3: Check if prefix matches ---
    console.log('[DEBUG] Prefix matched! Processing command...');

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Find the command by name or alias
    const command = client.commands.get(commandName);

    // --- DEBUGGING STEP 4: Check if command was found ---
    if (!command) {
        console.log(`[DEBUG] Command not found: ${commandName}. Checking aliases...`);
        return;
    }
    console.log(`[DEBUG] Command found: ${commandName}`);

    try {
        await command.execute(client, message, args);
    } catch (error) {
        console.error(`Command execution error for ${commandName}:`, error);
        // message.reply('कमांड चलाने में कोई त्रुटि हुई।'); // Optional: notify user
    }
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
