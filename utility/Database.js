// utility/Database.js
// Firebase Admin SDK ko initialize karta hai aur database operations handle karta hai.

const admin = require('firebase-admin');

/**
 * .env variables se Firebase credentials fetch karta hai.
 * @returns {object | null} Firebase admin configuration object or null if key is missing.
 */
function getFirebaseConfig() {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!privateKey) {
        console.error('FATAL: FIREBASE_PRIVATE_KEY environment variable is missing!');
        return null;
    }

    // Newline characters ko replace karte hain, jo ENV mein escaped hote hain
    const sanitizedPrivateKey = privateKey.replace(/\\n/g, '\n');

    return {
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: sanitizedPrivateKey,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
    };
}

/**
 * Singleton class jo Firebase initialization aur Firestore operations handle karti hai.
 */
class Database {
    constructor() {
        if (!admin.apps.length) {
            const config = getFirebaseConfig();
            if (!config) {
                console.error('❌ Firebase initialization failed. Check your .env credentials.');
                throw new Error('Firebase configuration missing.');
            }
            try {
                admin.initializeApp({
                    credential: admin.credential.cert(config),
                    databaseURL: `https://${config.project_id}.firebaseio.com`
                });
                console.log('✅ Firebase Admin SDK initialized successfully.');
            } catch (e) {
                console.error('❌ Firebase initialization failed. Check your .env credentials.', e);
                throw e; // Initialization error ko aage badha do
            }
        }
        this.db = admin.firestore();
        this.collectionPath = 'discord-bot-config'; // Main collection jahan server data store hoga
    }

    /**
     * Kisi specific guild (server) ka prefix fetch karta hai.
     * Agar custom prefix nahi mila, toh default prefix return karta hai.
     * @param {string} guildId - Discord Server ID
     * @returns {Promise<string>} Prefix string
     */
    async getPrefix(guildId) {
        try {
            const docRef = this.db.collection(this.collectionPath).doc(guildId);
            const doc = await docRef.get();

            if (doc.exists) {
                return doc.data().prefix || '!'; // Agar document hai par prefix nahi, toh default
            } else {
                return '!'; // Document nahi hai, toh default
            }
        } catch (error) {
            console.error('Error fetching prefix from Firestore:', error);
            return '!'; // Error aane par bhi default
        }
    }

    /**
     * Kisi specific guild (server) ke liye naya prefix set karta hai.
     * @param {string} guildId - Discord Server ID
     * @param {string} newPrefix - Naya prefix
     */
    async setPrefix(guildId, newPrefix) {
        try {
            const docRef = this.db.collection(this.collectionPath).doc(guildId);
            await docRef.set({ prefix: newPrefix }, { merge: true });
        } catch (error) {
            console.error('Error setting prefix in Firestore:', error);
            throw new Error('Prefix save nahi ho paya.');
        }
    }
}

// Database class ko seedha export karo
module.exports = { Database };
