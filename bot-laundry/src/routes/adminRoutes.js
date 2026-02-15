const express = require('express');
const router = express.Router();
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const { query } = require('../config/database');
const { sendMessage, getClientStatus, getQrCode, restartClient } = require('../services/whatsappClient');
const { getSettings, updateSetting } = require('../services/settingsService');

const JWT_SECRET = 'RAHASIA_NEGARA_SANGAT_PENTING';

// ========================================
// MIDDLEWARE: Cek Login
// ========================================
const checkAuth = (req, res, next) => {
    if (req.session && req.session.user) return next();
    res.redirect('/admin/login');
};

// ========================================
// AUTH ROUTES
// ========================================

// Auto-Login via Token (dari backend NestJS)
router.get('/auth-token', (req, res) => {
    const { token } = req.query;
    if (!token) return res.redirect('/admin/login?error=No token provided');

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.session.user = {
            email: decoded.email,
            name: decoded.name || decoded.email.split('@')[0],
            id: decoded.sub
        };

        req.session.save((err) => {
            if (err) return res.redirect('/admin/login?error=SessionSaveFailed');
            res.redirect('/admin/dashboard');
        });
    } catch (error) {
        console.error('[AUTH] Auto-login gagal:', error.message);
        res.redirect('/admin/login?error=InvalidToken');
    }
});

// Login Page
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// Login Logic
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const users = await query('SELECT * FROM user WHERE email = ?', [email]);
        if (users.length > 0 && users[0].password === password) {
            req.session.user = users[0];
            return res.redirect('/admin/dashboard');
        }
        res.render('login', { error: 'Email atau Password salah!' });
    } catch (error) {
        console.error('[AUTH] Login error:', error.message);
        res.render('login', { error: 'Database Error' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// ========================================
// DASHBOARD
// ========================================
router.get('/dashboard', checkAuth, async (req, res) => {
    try {
        const users = await query('SELECT COUNT(*) as count FROM user');
        const orders = await query('SELECT COUNT(*) as count FROM `order`');
        const today = new Date().toISOString().slice(0, 10);
        const income = await query(
            'SELECT SUM(totalPrice) as total FROM `order` WHERE status = ? AND DATE(createdAt) = ?',
            ['COMPLETED', today]
        );

        const stats = {
            users: users[0].count,
            orders: orders[0].count,
            revenueToday: income[0].total || 0,
            revenueMonth: 0
        };

        const logs = await query('SELECT * FROM activitylog ORDER BY createdAt DESC LIMIT 5');
        const settings = await getSettings();

        res.render('dashboard', {
            user: req.session.user,
            stats,
            logs,
            qrStatus: getClientStatus(),
            qrCode: getQrCode(),
            settings,
            broadcastMsg: req.session.broadcastMsg || null
        });
        req.session.broadcastMsg = null;
    } catch (error) {
        console.error('[DASHBOARD] Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// ========================================
// SETTINGS
// ========================================
router.get('/settings', checkAuth, async (req, res) => {
    const settings = await getSettings();
    res.render('settings', {
        user: req.session.user,
        settings
    });
});

router.post('/settings', checkAuth, async (req, res) => {
    const { ownerNumber, autoReply } = req.body;
    await updateSetting('ownerNumber', ownerNumber);
    await updateSetting('autoReply', autoReply === 'on');
    res.redirect('/admin/settings');
});

// ========================================
// BROADCAST (dari dashboard)
// ========================================
router.post('/broadcast', checkAuth, async (req, res) => {
    const { target, message } = req.body;
    try {
        let sql = 'SELECT DISTINCT phoneNumber FROM `order` WHERE phoneNumber != "-"';
        const params = [];

        if (target === 'today') {
            sql += ' AND DATE(createdAt) = ?';
            params.push(new Date().toISOString().split('T')[0]);
        }

        const recipients = await query(sql, params);
        let count = 0;

        // Kirim dengan delay 3 detik per pesan agar tidak kena spam
        for (let i = 0; i < recipients.length; i++) {
            const row = recipients[i];
            if (row.phoneNumber) {
                await new Promise(r => setTimeout(r, i * 3000));
                const sent = await sendMessage(row.phoneNumber, message);
                if (sent) count++;
            }
        }

        req.session.broadcastMsg = `✅ Broadcast terkirim ke ${count}/${recipients.length} penerima.`;
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('[BROADCAST] Error:', error.message);
        req.session.broadcastMsg = '❌ Broadcast gagal.';
        res.redirect('/admin/dashboard');
    }
});

// ========================================
// WHATSAPP RE-LOGIN
// ========================================
router.post('/relogin-whatsapp', checkAuth, async (req, res) => {
    try {
        // Hapus folder session lokal agar scan QR ulang
        const authDir = path.join(process.cwd(), '.wwebjs_auth');
        if (fs.existsSync(authDir)) {
            fs.rmSync(authDir, { recursive: true, force: true });
        }
        await restartClient();
        req.session.broadcastMsg = 'Proses Login Ulang WhatsApp dimulai. Silakan scan QR Code baru.';
    } catch (error) {
        console.error('[RELOGIN] Error:', error.message);
        req.session.broadcastMsg = 'Gagal melakukan login ulang.';
    }
    res.redirect('/admin/dashboard');
});

module.exports = router;
