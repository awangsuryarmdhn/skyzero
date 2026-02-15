const handleCheckStatus = require('./checkStatus');
const handleReport = require('./report');
const handleUpdateStatus = require('./updateStatus');
const handleBroadcast = require('./broadcast');
const messages = require('../config/messages.json');

const handleMessage = async (msg, settings, sendMessageFunc) => {
    console.log('MESSAGE RECEIVED', msg.body);
    const bodyContent = msg.body.trim();
    const command = bodyContent.toUpperCase();
    const args = bodyContent.split(' ');

    // 1. LAPORAN
    if (command === 'LAPORAN' || command === 'OMSET') {
        return handleReport(msg, settings);
    }

    // 2. UPDATE STATUS
    if (command.startsWith('UPDATE ')) {
        return handleUpdateStatus(msg, args, settings, sendMessageFunc);
    }

    // 3. BROADCAST
    if (command.startsWith('BROADCAST ')) {
        const messageContent = bodyContent.substring(10);
        return handleBroadcast(msg, messageContent, settings, sendMessageFunc);
    }

    // 4. CEK STATUS
    if (command.startsWith('STATUS')) {
        const keyword = bodyContent.split(' ')[1]; // case-sensitive check often better for IDs
        return handleCheckStatus(msg, keyword);
    }

    // 5. HELP / INFO
    if (['MENU', 'HELP', 'HALO', 'HI', 'INFO', 'TES', 'TEST', 'PING'].includes(command)) {
        return msg.reply(messages.welcome);
    }

    // 6. SMART FAQ (Auto Reply)
    if (settings.autoReply) {
        if (bodyContent.toLowerCase().includes('harga') || bodyContent.toLowerCase().includes('tarif')) {
            let priceMsg = `💰 *DAFTAR HARGA SKY LAUNDRY* 💰\n\n`;
            priceMsg += `👕 *Cuci Komplit*\n- Reguler: Update di Outlet\n- Kilat/Express: Tersedia\n\n`;
            priceMsg += `🛵 *Antar Jemput*\n- GRATIS untuk area Rasau Jaya!\n\n`;
            priceMsg += `_Hubungi 0895-3870-60474 untuk info paket berlangganan._`;
            return msg.reply(priceMsg);
        }
        
        if (bodyContent.toLowerCase().includes('alamat') || bodyContent.toLowerCase().includes('lokasi')) {
            return msg.reply(`📍 *LOKASI OUTLET*\n\nJl. Rasau Jaya Depan Gereja Protestan\n\nGoogle Maps: https://maps.google.com/?q=SkyLaundryRasauJaya`);
        }
        
        if (bodyContent.toLowerCase().includes('jam') && bodyContent.toLowerCase().includes('buka')) {
            return msg.reply(`⏰ *JAM OPERASIONAL*\n\nBuka Setiap Hari\nInfo lanjut hubungi: 0895-3870-60474`);
        }
    }

    // Default - pesan tidak dikenali
    return msg.reply(messages.default);
};

module.exports = handleMessage;
