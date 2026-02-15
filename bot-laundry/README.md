# 🤖 Sky Laundry - WhatsApp Bot

Bot WhatsApp untuk manajemen laundry **Sky Laundry Rasau Jaya**. Terintegrasi dengan dashboard admin dan backend NestJS.

## ✨ Fitur

- 📱 **Cek Status Pesanan** via Nomor Nota, No. HP, atau Nama
- 📢 **Broadcast** pesan ke semua pelanggan
- 🔄 **Update Status** pesanan langsung dari WhatsApp
- 📊 **Laporan Harian** omset dan jumlah order
- ⏰ **Auto Reminder** untuk cucian yang siap diambil (cron job jam 09:00)
- 💬 **Smart FAQ** — harga, lokasi, jam buka
- 🖥️ **Dashboard Admin** dengan QR Code login

## 📁 Struktur Folder

```
bot-laundry/
├── public/              # File statis (landing page)
├── src/
│   ├── app.js           # Entry point (Express + Socket.IO)
│   ├── config/
│   │   ├── database.js  # Koneksi MySQL
│   │   └── messages.json # Template pesan bot
│   ├── handlers/
│   │   ├── messageHandler.js  # Router perintah bot
│   │   ├── checkStatus.js     # Handler cek status
│   │   ├── updateStatus.js    # Handler update status
│   │   ├── broadcast.js       # Handler broadcast
│   │   └── report.js          # Handler laporan
│   ├── routes/
│   │   └── adminRoutes.js     # Routes dashboard admin
│   ├── services/
│   │   ├── whatsappClient.js  # WhatsApp client (LocalAuth)
│   │   ├── settingsService.js # Settings dari database
│   │   └── socketService.js   # Socket.IO service
│   ├── utils/
│   │   └── formatter.js       # Format tanggal, mata uang, dll
│   └── views/
│       ├── dashboard.ejs      # Halaman dashboard
│       ├── login.ejs          # Halaman login
│       └── settings.ejs       # Halaman pengaturan
├── .env.example         # Template environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Instalasi

### Prasyarat
- **Node.js** v18+
- **MySQL** (database `laundry_db`)
- **Google Chrome** (digunakan oleh Puppeteer)

### Langkah

1. **Clone repository**
   ```bash
   git clone https://github.com/username/bot-laundry.git
   cd bot-laundry
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env sesuai konfigurasi database Anda
   ```

4. **Setup database**
   
   Pastikan tabel berikut ada di database `laundry_db`:
   - `order` — Data pesanan
   - `user` — Data user/admin
   - `settings` — Pengaturan bot
   - `activitylog` — Log aktivitas

5. **Jalankan bot**
   ```bash
   npm start
   ```

6. **Scan QR Code**
   
   Buka `http://localhost:3005/admin/dashboard` dan scan QR Code dengan WhatsApp.

## 💬 Perintah Bot

| Perintah | Fungsi | Contoh |
|---|---|---|
| `STATUS [nota/hp/nama]` | Cek status pesanan | `STATUS SKY-12345` |
| `MENU` / `HELP` | Tampilkan menu | `MENU` |
| `HARGA` / `TARIF` | Info harga | `HARGA` |
| `ALAMAT` / `LOKASI` | Info lokasi outlet | `ALAMAT` |
| `JAM BUKA` | Jam operasional | `JAM BUKA` |

### Perintah Owner (harus dari nomor owner)

| Perintah | Fungsi | Contoh |
|---|---|---|
| `UPDATE [nota] [status]` | Update status pesanan | `UPDATE SKY-001 READY` |
| `BROADCAST [pesan]` | Broadcast ke pelanggan | `BROADCAST Promo hari ini!` |
| `LAPORAN` / `OMSET` | Laporan harian | `LAPORAN` |

## 🔧 Konfigurasi

Edit pengaturan melalui dashboard admin (`/admin/settings`):
- **Nomor Owner** — Nomor WhatsApp yang bisa akses perintah admin
- **Auto Reply** — Aktifkan/nonaktifkan balasan otomatis FAQ

## 🌐 Deploy ke VPS

```bash
# Install PM2 (process manager)
npm install -g pm2

# Jalankan bot
pm2 start src/app.js --name "sky-bot"

# Auto-start saat reboot
pm2 startup
pm2 save
```

## 📝 Lisensi

MIT
