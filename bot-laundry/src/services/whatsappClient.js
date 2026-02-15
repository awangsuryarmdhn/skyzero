const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const cron = require('node-cron');
const path = require('path');
const { query } = require('../config/database');
const handleMessage = require('../handlers/messageHandler');
const { getSettings } = require('./settingsService');
const { normalizePhoneNumber } = require('../utils/formatter');

// ========================================
// STATE (variabel global untuk bot)
// ========================================
let client;
let isReady = false;
let currentQr = null;
let ioInstance;

// ========================================
// INISIALISASI CLIENT WHATSAPP
// ========================================
const initWhatsappClient = (io) => {
    ioInstance = io;

    client = new Client({
        authStrategy: new LocalAuth({ clientId: 'client-one' }),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    // --- EVENT HANDLERS ---

    client.on('qr', (qr) => {
        console.log('[BOT] QR Code diterima. Silakan scan dari dashboard.');
        qrcode.toDataURL(qr, (err, url) => {
            if (err) return console.error('[BOT] Error generating QR:', err);
            currentQr = url;
            io.emit('qr', url);
            io.emit('message', 'Scan QR Code to login');
        });
    });

    client.on('ready', () => {
        console.log('[BOT] ✅ WhatsApp Client siap!');
        isReady = true;
        currentQr = null;
        io.emit('ready', 'WhatsApp Client is Ready!');
        io.emit('message', 'Clients Connected');
    });

    client.on('authenticated', () => {
        console.log('[BOT] ✅ Authenticated');
        io.emit('authenticated', 'Authenticated successfully!');
    });

    client.on('auth_failure', (msg) => {
        console.error('[BOT] ❌ Authentication gagal:', msg);
        io.emit('auth_failure', 'Authentication failure');
    });

    client.on('loading_screen', (percent) => {
        io.emit('message', `Loading... ${percent}%`);
    });

    client.on('disconnect', (reason) => {
        console.log('[BOT] ⚠️ Disconnected:', reason);
        isReady = false;
        currentQr = null;
        io.emit('message', 'Client logged out');
    });

    // --- MESSAGE HANDLER ---
    client.on('message', async (msg) => {
        try {
            const settings = await getSettings();
            await handleMessage(msg, settings, sendMessage);
        } catch (error) {
            console.error('[BOT] Error handling message:', error.message);
        }
    });

    // --- CRON JOB: Auto Reminder jam 09:00 ---
    cron.schedule('0 9 * * *', async () => {
        console.log('[CRON] Menjalankan auto reminder...');
        try {
            const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
                .toISOString().replace('T', ' ').slice(0, 19);

            const orders = await query(
                `SELECT * FROM \`order\` WHERE status = 'READY' AND updatedAt < ? AND phoneNumber != '-'`,
                [twoDaysAgo]
            );
            console.log(`[CRON] Ditemukan ${orders.length} pesanan untuk diingatkan.`);

            for (let i = 0; i < orders.length; i++) {
                const order = orders[i];
                // Delay tiap pesan 5 detik agar tidak terdeteksi spam
                await new Promise(r => setTimeout(r, i * 5000));

                let reminderMsg = `Halo Kak *${order.customerName}*! 👋\n\n`;
                reminderMsg += `Kami ingin mengingatkan bahwa cucian dengan nota *${order.orderId}* sudah *SIAP DIAMBIL* sejak 2 hari lalu.\n`;
                reminderMsg += `Mohon segera diambil ya agar tidak menumpuk di outlet. Terima kasih! 🙏`;

                await sendMessage(order.phoneNumber, reminderMsg);
            }
        } catch (error) {
            console.error('[CRON] Error:', error.message);
        }
    });

    client.initialize();
};

// ========================================
// KIRIM PESAN WHATSAPP
// ========================================
const sendMessage = async (phoneNumber, message) => {
    if (!isReady) {
        console.error('[BOT] Client belum siap, pesan tidak terkirim.');
        return false;
    }

    const formattedNumber = normalizePhoneNumber(phoneNumber);

    try {
        // Cek apakah nomor terdaftar di WhatsApp
        const isRegistered = await client.isRegisteredUser(formattedNumber);
        if (!isRegistered) {
            console.log(`[BOT] ⚠️ Nomor ${phoneNumber} tidak terdaftar di WhatsApp, skip.`);
            return false;
        }

        await client.sendMessage(formattedNumber, message);
        return true;
    } catch (error) {
        console.error(`[BOT] ❌ Gagal kirim ke ${phoneNumber}:`, error.message);
        return false;
    }
};

// ========================================
// GETTER FUNCTIONS
// ========================================
const getClient = () => client;
const getIsReady = () => isReady;
const getClientStatus = () => isReady ? 'CONNECTED' : 'DISCONNECTED';
const getQrCode = () => currentQr;

// ========================================
// RESTART CLIENT
// ========================================
const restartClient = async () => {
    try {
        if (client) await client.destroy();
    } catch (error) {
        console.error('[BOT] Error destroying client:', error.message);
    }
    isReady = false;
    currentQr = null;
    initWhatsappClient(ioInstance);
};

module.exports = {
    initWhatsappClient,
    getClient,
    getIsReady,
    getClientStatus,
    getQrCode,
    sendMessage,
    restartClient
};
