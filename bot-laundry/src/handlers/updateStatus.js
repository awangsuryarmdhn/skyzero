const { query } = require('../config/database');
const messages = require('../config/messages.json');

const handleUpdateStatus = async (msg, args, settings, sendMessageFunc) => {
    // Check auth
    const senderNumber = msg.from.replace('@c.us', '');
    if (!settings.ownerNumber || !senderNumber.includes(settings.ownerNumber)) return;

    if (args.length < 3) {
        msg.reply(messages.invalidUpdateFormat);
        return; 
    }

    const orderId = args[1];
    let newStatus = args[2].toUpperCase();
    
    // Map status aliases
    if (newStatus === 'SELESAI') newStatus = 'COMPLETED';
    if (newStatus === 'SIAP') newStatus = 'READY';
    if (newStatus === 'CUCI') newStatus = 'WASHING';

    const validStatuses = ['PENDING', 'WASHING', 'IRONING', 'READY', 'COMPLETED'];
    if (!validStatuses.includes(newStatus)) {
        msg.reply(messages.invalidStatus);
        return;
    }

    try {
        // Update DB
        const result = await query('UPDATE `order` SET status = ?, updatedAt = NOW() WHERE orderId = ?', [newStatus, orderId]);
        
        if (result.affectedRows > 0) {
            // Get customer Phone
            const orders = await query('SELECT phoneNumber, customerName FROM `order` WHERE orderId = ?', [orderId]);
            const customer = orders[0];
            
            msg.reply(messages.updateSuccess.replace('{orderId}', orderId).replace('{newStatus}', newStatus));
            
            // Notify Customer
            if (customer && customer.phoneNumber && customer.phoneNumber !== '-') {
                let notifMsg = `Halo Kak *${customer.customerName}*! 👋\n\n`;
                notifMsg += `Status pesanan laundry kamu (*${orderId}*) sekarang: *${newStatus}*\n`;
                if (newStatus === 'READY') notifMsg += `Silakan datang ke outlet untuk mengambil cucian ya! 🧺\n`;
                if (newStatus === 'COMPLETED') notifMsg += `Terima kasih sudah mencuci di Sky Laundry! ✨\n`;
                
                sendMessageFunc(customer.phoneNumber, notifMsg);
            }
        } else {
             msg.reply(messages.orderNotFound.replace('{orderId}', orderId));
        }
    } catch (error) {
        console.error('Update Error:', error);
        msg.reply('❌ Gagal update status.');
    }
};

module.exports = handleUpdateStatus;
