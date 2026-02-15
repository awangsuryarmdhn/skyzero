const { query } = require('../config/database');
const messages = require('../config/messages.json');

/**
 * Handle perintah BROADCAST dari owner via WhatsApp
 * Contoh: BROADCAST Promo hari ini diskon 20%!
 */
const handleBroadcast = async (msg, messageContent, settings, sendMessageFunc) => {
    // Cek apakah pengirim adalah owner
    const senderNumber = msg.from.replace('@c.us', '');
    if (!settings.ownerNumber || !senderNumber.includes(settings.ownerNumber)) {
        return; // Bukan owner, abaikan
    }

    try {
        const recipients = await query(
            'SELECT DISTINCT phoneNumber FROM `order` WHERE phoneNumber != "-"'
        );

        msg.reply(messages.broadcastStart.replace('{count}', recipients.length));

        let sent = 0;
        for (let i = 0; i < recipients.length; i++) {
            // Delay 3 detik per pesan agar tidak kena spam
            await new Promise(r => setTimeout(r, i * 3000));
            const result = await sendMessageFunc(recipients[i].phoneNumber, messageContent);
            if (result) sent++;
        }

        msg.reply(`✅ Broadcast selesai: ${sent}/${recipients.length} pesan terkirim.`);
    } catch (error) {
        console.error('[BROADCAST] Error:', error.message);
        msg.reply(messages.broadcastFail);
    }
};

module.exports = handleBroadcast;
