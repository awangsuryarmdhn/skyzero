# 🧺 Sky Laundry Management System

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

> **Sky Laundry** adalah aplikasi manajemen laundry modern berbasis web fullstack. Didesain untuk efisiensi operasional bisnis laundry dengan fitur pelacakan real-time, manajemen pesanan yang aman, dan antarmuka *Glassmorphism* yang estetis.

---

## ✨ Fitur Unggulan

### 🌍 Sisi Pelanggan (Public Facing)
* **Real-time Tracking:** Pelanggan dapat melacak status cucian (Pending, Cuci, Setrika, Selesai) menggunakan Order ID unik (Contoh: `240209-1430-K`).
* **Transparansi Layanan:** Informasi paket layanan (Kiloan, Satuan, Express) dan estimasi harga.
* **Responsive Design:** Tampilan mobile-friendly yang responsif dan cepat.
* **WhatsApp Integration:** Tombol floating untuk menghubungi CS via WhatsApp.

### 🔒 Sisi Admin (Dashboard Staff)
* **Manajemen Pesanan (CRUD):**
    * Generator Order ID Unik & Kustom.
    * Update status pengerjaan & pembayaran (Lunas/Belum).
    * **2-Step Delete Verification:** Modal konfirmasi ganda untuk mencegah penghapusan data tidak sengaja.
* **Activity Log System:**
    * Mencatat setiap aksi staff (Create, Update, Delete).
    * Audit trail keamanan untuk pemilik laundry.
* **Auto-Print Struk (Thermal):**
    * Integrasi cetak struk otomatis setelah input pesanan.
    * Modal konfirmasi cetak yang modern.
* **Visualisasi Data:** Grafik tren transaksi dan ringkasan omzet menggunakan **Chart.js**.
* **User Experience (UX):**
    * **Toast Notifications:** Notifikasi status (Sukses/Gagal) yang dinamis, berwarna, dan *auto-hide*.
    * **Glassmorphism UI:** Desain antarmuka modern dengan efek blur.

---

## 🛠️ Tech Stack

Project ini dibangun menggunakan teknologi terkini (Monorepo-style structure):

### **Frontend (Client-Side)**
* **Framework:** Next.js 14 (App Router)
* **Styling:** Tailwind CSS (Custom Config)
* **Icons:** Lucide React
* **HTTP Client:** Axios
* **Charts:** React-Chartjs-2 & Chart.js

### **Backend (Server-Side)**
* **Framework:** NestJS (Modular Architecture)
* **Database:** PostgreSQL / MySQL
* **ORM:** Prisma
* **Validation:** Class-Validator & DTOs

---


