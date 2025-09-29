// utility/Database.js
// यह Firebase Admin SDK का उपयोग करके Firestore से जुड़ता है और डेटा को संभालता है।

const admin = require('firebase-admin');
const config = require('../config');

// Firebase Admin SDK को service account credentials के साथ initialize करें
try {
    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Private key ko ek line mein replace kiya gaya hai,
        // ya Base64 se decode kiya ja sakta hai (Render par commonly used).
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
    };

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin SDK successfully initialized.');

} catch (error) {
    console.error("❌ Firebase initialization failed. Check your .env credentials.", error.message);
}

const db = admin.firestore();

/**
 * Guild (Server) ke settings (jaise prefix) ko fetch karta hai.
 * Agar data nahi milta, toh default settings wapas karta hai.
 * @param {string} guildId - Server ka ID.
 * @returns {Promise<object>} Guild settings.
 */
async function getGuildSettings(guildId) {
    try {
        const docRef = db.collection('guilds').doc(guildId);
        const doc = await docRef.get();

        if (doc.exists) {
            // Agar settings Firestore mein maujood hain
            return doc.data();
        } else {
            // Agar settings nahi hain, toh default prefix wapas karein
            return { prefix: config.DEFAULT_PREFIX };
        }
    } catch (error) {
        console.error(`Error fetching settings for guild ${guildId}:`, error);
        return { prefix: config.DEFAULT_PREFIX };
    }
}

/**
 * Guild ke settings (jaise prefix) ko Firestore mein set karta hai.
 * @param {string} guildId - Server ka ID.
 * @param {object} settings - Nayi settings ka object.
 */
async function setGuildSettings(guildId, settings) {
    try {
        const docRef = db.collection('guilds').doc(guildId);
        await docRef.set(settings, { merge: true }); // Merge: true purane data ko barqarar rakhta hai
        console.log(`Settings saved for guild ${guildId}`);
    } catch (error) {
        console.error(`Error saving settings for guild ${guildId}:`, error);
    }
}

module.exports = { db, getGuildSettings, setGuildSettings };
