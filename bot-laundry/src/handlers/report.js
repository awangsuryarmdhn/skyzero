const { query } = require('../config/database');
const { formatCurrency, formatDate } = require('../utils/formatter');

const handleReport = async (msg, settings) => {
    const senderNumber = msg.from.replace('@c.us', '');
    if (settings.ownerNumber && senderNumber.includes(settings.ownerNumber)) {
        try {
            const today = new Date().toISOString().split('T')[0];
            const ordersToday = await query('SELECT COUNT(*) as count, SUM(totalPrice) as revenue FROM `order` WHERE DATE(createdAt) = ?', [today]);
            const stats = ordersToday[0];
            
            let reportMsg = `📊 *LAPORAN HARIAN* 📊\n`;
            reportMsg += `📅 Tanggal: ${today}\n\n`;
            reportMsg += `🧺 Total Order: ${stats.count || 0}\n`;
            reportMsg += `💰 Total Omset: ${formatCurrency(stats.revenue)}\n\n`;
            reportMsg += `_Tetap semangat bos!_ 💪`;
            
            msg.reply(reportMsg);
        } catch (error) {
            console.error('Report Error:', error);
            msg.reply('❌ Gagal mengambil laporan harian.');
        }
    }
};

module.exports = handleReport;
