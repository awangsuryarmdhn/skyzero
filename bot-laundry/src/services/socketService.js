const { getIsReady } = require('./whatsappClient');

/**
 * Inisialisasi Socket.IO service
 * Kirim status koneksi WhatsApp ke client yang baru connect
 */
const initSocketService = (io) => {
    io.on('connection', (socket) => {
        if (getIsReady()) {
            socket.emit('ready', 'WhatsApp Client is Ready!');
            socket.emit('authenticated', 'Session restored!');
        } else {
            socket.emit('message', 'Connecting...');
        }
    });
};

module.exports = { initSocketService };
