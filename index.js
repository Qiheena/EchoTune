// index.js
// Bot ka main entry point. Sabhi zaroori cheezein load karta hai aur client ko shuru karta hai.

require('dotenv').config();
const { promisify } = require('util');
const { readdir } = require('fs/promises');
const path = require('path');
const { Events } = require('discord.js');

const MusicClient = require('./src/Client');
const config = require('./config');
const { getGuildSettings } = require('./utility/Database'); // Prefix ke liye database function
const MusicPlayer = require('./utility/MusicPlayer'); // Player class

const client = new MusicClient();

/**
 * Commands aur Cogs ko recursively load karta hai.
 * @param {string} dir - Directory jahan se load karna hai.
 * @param {import('discord.js').Collection} collection - Jahan data store karna hai.
 */
async function loadFiles(dir, collection) {
    const fullPath = path.resolve(__dirname, dir);
    let files;
    try {
        files = await readdir(fullPath, { withFileTypes: true });
    } catch (e) {
        console.error(`❌ Folder nahi mila: ${dir}`);
        return;
    }

    for (const file of files) {
        if (file.isDirectory()) {
            await loadFiles(path.join(dir, file.name), collection); // Sub-directories ko load karna
        } else if (file.name.endsWith('.js')) {
            const filePath = path.join(fullPath, file.name);
            try {
                // Har file ko naye सिरे से require karen
                delete require.cache[require.resolve(filePath)]; 
                const module = require(filePath);
                
                if (module.data && module.execute) {
                    // Mukhya command name ko store karein
                    collection.set(module.data.name, module);
                    
                    // ALIASES (short names) ko store karein
                    if (Array.isArray(module.data.aliases)) {
                        module.data.aliases.forEach(alias => {
                            collection.set(alias, module);
                            console.log(`  -> Alias '${alias}' mapped to '${module.data.name}'`);
                        });
                    }

                    console.log(`✅ ${file.name} successfully loaded into ${dir}.`);
                } else {
                    console.warn(`⚠️ ${file.name} mein 'data' ya 'execute' property missing hai. Skip kiya gaya.`);
                }
            } catch (error) {
                console.error(`❌ Error loading ${file.name}:`, error);
            }
        }
    }
}

// ===================================
// EVENT LISTENERS
// ===================================

// Bot ke ready hone par
client.once(Events.ClientReady, async () => {
    // Commands aur Cogs (interactions) ko load karein
    await loadFiles(config.COMMANDS_PATH, client.commands);
    await loadFiles(config.COGS_PATH, client.cogs);

    // Bot ka status set karein
    client.user.setPresence(config.PRESENCE);

    console.log(`🤖 Bot Ready! Logged in as ${client.user.tag}`);
    console.log(`Bot is in ${client.guilds.cache.size} servers.`);
});


// Message ko handle karne ke liye (Prefix Commands)
client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.guild) return;

    // Guild ka prefix database se laayein
    const settings = await getGuildSettings(message.guild.id);
    const prefix = settings.prefix || config.DEFAULT_PREFIX;

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Command ko mukhya naam ya alias se dhundhen
    const command = client.commands.get(commandName);

    if (!command) return;

    try {
        // Har command ko message, args, aur client ke saath execute karein
        await command.execute({ message, args, client, prefix });
    } catch (error) {
        console.error(error);
        message.reply('❌ Command execute karte waqt ek error ho gaya. Server logs check karein.');
    }
});

// Interactions (Buttons, Slash Commands) ko handle karne ke liye
client.on(Events.InteractionCreate, async interaction => {
    // Hum sirf Button Interactions (Cogs) ko handle karenge.
    if (!interaction.isButton()) return;
    
    // Interaction ID (jo ButtonBuilder mein set kiya gaya tha)
    const customId = interaction.customId;

    const cog = client.cogs.get(customId);
    
    if (!cog) {
        return interaction.reply({ content: '❌ Is button ke liye koi handler nahi mila.', ephemeral: true });
    }
    
    try {
        // Player ko fetch karein
        const player = client.musicPlayers.get(interaction.guildId);
        if (!player) {
            return interaction.reply({ content: '❌ Is server par koi music player active nahi hai.', ephemeral: true });
        }
        
        // Cog (button handler) ko execute karein
        await cog.execute({ interaction, client, player });
    } catch (error) {
        console.error(`❌ Error handling interaction ${customId}:`, error);
        interaction.reply({ content: '❌ Interaction execute karte waqt ek error ho gaya.', ephemeral: true }).catch(() => {});
    }
});


// ===================================
// CLIENT LOGIN
// ===================================

client.login(process.env.DISCORD_TOKEN);
