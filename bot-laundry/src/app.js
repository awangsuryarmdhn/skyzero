const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const session = require('express-session');
const MySQLStoreSession = require('express-mysql-session')(session);

const { pool } = require('./config/database');
const { initWhatsappClient, sendMessage } = require('./services/whatsappClient');
const { initSocketService } = require('./services/socketService');
const adminRoutes = require('./routes/adminRoutes');

// ========================================
// EXPRESS APP SETUP
// ========================================
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3005;

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ========================================
// SESSION (MySQL Store)
// ========================================
const sessionStore = new MySQLStoreSession({
    clearExpired: true,
    checkExpirationInterval: 900000, // 15 menit
    expiration: 86400000,            // 24 jam
    createDatabaseTable: true,
    schema: {
        tableName: 'admin_sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}, pool);

app.use(session({
    key: 'skybot_session',
    secret: process.env.SESSION_SECRET || 'sky-laundry-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000 } // 24 jam
}));

// ========================================
// ROUTES
// ========================================
app.use('/admin', adminRoutes);

// API: Kirim notifikasi WhatsApp (dipanggil oleh backend NestJS)
app.post('/notify/order-update', async (req, res) => {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
        return res.status(400).json({ success: false, error: 'phoneNumber dan message wajib diisi' });
    }

    try {
        const result = await sendMessage(phoneNumber, message);
        if (result) {
            res.json({ success: true, message: 'Notifikasi terkirim' });
        } else {
            res.status(500).json({ success: false, error: 'Gagal mengirim pesan' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========================================
// START SERVER
// ========================================
initSocketService(io);
initWhatsappClient(io);

server.listen(port, () => {
    console.log(`[SERVER] Bot berjalan di http://localhost:${port}`);
});
