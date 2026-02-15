const { query } = require('../config/database');
const { formatCurrency, formatDate, getStatusLabel, getStatusDesc } = require('../utils/formatter');
const messages = require('../config/messages.json');

const handleCheckStatus = async (msg, keyword) => {
    if (!keyword) {
        msg.reply('Mohon sertakan Nomor Nota.\nContoh: *STATUS SKY-12345*');
        return;
    }

    try {
        const sql = `
            SELECT * FROM \`order\` 
            WHERE orderId = ? 
            OR phoneNumber = ? 
            OR customerName LIKE ? 
            ORDER BY createdAt DESC 
            LIMIT 5
        `;
        const params = [keyword, keyword, `%${keyword}%`];
        const rows = await query(sql, params);
        
        if (rows.length > 0) {
            if (rows.length === 1) {
                // Single Result
                const order = rows[0];
                const paymentStatus = order.isPaid ? '✅ LUNAS' : '❌ BELUM BAYAR';
                const weightInfo = order.serviceType === 'SATUAN' ? `${order.weight} Pcs` : `${order.weight} Kg`;

                let replyMsg = `☁️ *SKY LAUNDRY* ☁️\n`;
                replyMsg += `_Cucian Bersih Sebening Langit_\n\n`;
                replyMsg += `Halo Kak *${order.customerName}*! 👋\n`;
                replyMsg += `Berikut detail pesanan Anda:\n\n`;
                replyMsg += `📦 *No. Nota:* ${order.orderId}\n`;
                replyMsg += `🗓️ *Tanggal:* ${formatDate(order.createdAt)}\n`;
                replyMsg += `🧺 *Layanan:* ${order.serviceType}\n`;
                replyMsg += `⚖️ *Berat/Jml:* ${weightInfo}\n`;
                replyMsg += `💰 *Total:* ${formatCurrency(order.totalPrice)}\n`;
                replyMsg += `💳 *Pembayaran:* ${paymentStatus}\n`;
                replyMsg += `🏷️ *Status:* *${getStatusLabel(order.status)}*\n\n`;
                replyMsg += `_${getStatusDesc(order.status)}_\n\n`;
                replyMsg += `🔄 *Update Terakhir:* ${formatDate(order.updatedAt)}\n\n`;
                replyMsg += `📍 *Lokasi:* Pontianak\n`;
                replyMsg += `⏰ *Buka:* 07:00 - 20:00 (Setiap Hari)\n\n`;
                replyMsg += `Terima kasih telah mempercayakan pakaian Anda pada kami! ✨`;
                
                msg.reply(replyMsg);
            } else {
                // Multiple Results
                let replyMsg = `☁️ *SKY LAUNDRY* ☁️\n`;
                replyMsg += `_Ditemukan ${rows.length} pesanan untuk pencarian "${keyword}"_\n\n`;

                rows.forEach((order, index) => {
                    replyMsg += `${index + 1}. *${order.orderId}* (${order.customerName})\n`;
                    replyMsg += `   📅 ${formatDate(order.createdAt)}\n`;
                    replyMsg += `   🏷️ ${getStatusLabel(order.status)}\n`;
                    replyMsg += `   💰 ${formatCurrency(order.totalPrice)}\n\n`;
                });

                replyMsg += `👉 Ketik *STATUS [NO_NOTA]* untuk melihat detail lengkap salah satu pesanan di atas.\n`;
                replyMsg += `Contoh: *STATUS ${rows[0].orderId}*`;
                
                msg.reply(replyMsg);
            }
        } else {
            msg.reply(messages.statusNotFound.replace('{keyword}', keyword));
        }
    } catch (error) {
        console.error('Database Error:', error);
        msg.reply(messages.statusError);
    }
};

module.exports = handleCheckStatus;
