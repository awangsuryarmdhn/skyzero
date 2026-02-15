/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, CheckCircle, Package, Search, 
  Menu, X, Loader2, AlertCircle, MapPin, 
  Clock, ShieldCheck, Sparkles, Truck, Instagram 
} from 'lucide-react';

// --- TIPE DATA ---
interface SearchResult {
  id: string;
  orderId: string;
  customerName: string;
  serviceType: string;
  weight: number;
  totalPrice: number;
  status: string;
  isPaid: boolean;
  createdAt: string;
}

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // --- ANIMASI SCROLL ---
  useEffect(() => {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  }, []);

  // --- LOGIKA CEK STATUS ---
  const handleCheckStatus = async () => {
    if (!searchId || searchId.trim() === '') {
        setErrorMsg('Mohon masukkan ID Resi.');
        return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSearchResult(null);

    try {
      // Menggunakan endpoint khusus tracking
      const response = await axios.get(`http://localhost:4000/orders/track/${searchId.trim()}`);
      setSearchResult(response.data);
    } catch (error: any) {
      console.error("Search Error:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
             setErrorMsg('ID Resi tidak ditemukan. Pastikan nomor resi benar (Contoh: 240209-1430-K).');
        } else {
             setErrorMsg('Gagal terhubung ke server. Pastikan backend menyala.');
        }
      } else {
        setErrorMsg('Terjadi kesalahan yang tidak diketahui.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- HELPER FUNCTIONS (FIXED TYPES) ---
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Menunggu Konfirmasi';
      case 'WASHING': return 'Sedang Dicuci';
      case 'IRONING': return 'Sedang Disetrika';
      case 'READY': return 'Siap Diambil';
      case 'COMPLETED': return 'Selesai / Diambil';
      default: return status;
    }
  };

  const getProgressWidth = (status: string) => {
    switch (status) {
      case 'PENDING': return '10%';
      case 'WASHING': return '40%';
      case 'IRONING': return '70%';
      case 'READY': return '90%';
      case 'COMPLETED': return '100%';
      default: return '0%';
    }
  };

  const getStatusColorText = (status: string) => {
    switch (status) {
      case 'READY': return 'text-purple-600';
      case 'COMPLETED': return 'text-emerald-600';
      case 'WASHING': return 'text-blue-600';
      case 'IRONING': return 'text-amber-600';
      default: return 'text-slate-500';
    }
  };

  const getStatusColorBg = (status: string) => {
    switch (status) {
      case 'READY': return 'bg-purple-500';
      case 'COMPLETED': return 'bg-emerald-500';
      case 'WASHING': return 'bg-blue-500';
      case 'IRONING': return 'bg-amber-500';
      default: return 'bg-slate-300';
    }
  };

  return (
    <main className="bg-slate-50 text-slate-900 leading-relaxed overflow-x-hidden min-h-screen selection:bg-blue-200 font-[family-name:var(--font-jakarta)]">
      
      {/* Background Blobs */}
      <div className="absolute top-0 left-[-50px] w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 right-[-50px] w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* LOGO SECTION */}
            <div className="flex items-center gap-3 group cursor-pointer shrink-0">
              {/* Container Logo Image */}
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                <Image 
                  src="/logo1.png" 
                  alt="Sky Laundry Logo" 
                  fill 
                  className="object-cover"
                  sizes="(max-width: 768px) 40px, 40px"
                />
              </div>
              
              {/* Brand Name */}
              <span className="text-base sm:text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-sky-500">
                Sky Laundry
              </span>
            </div>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#beranda" className="text-xs font-bold text-slate-600 hover:text-blue-600 uppercase tracking-wider transition-colors">Beranda</a>
              <a href="#cek-status" className="text-xs font-bold text-slate-600 hover:text-blue-600 uppercase tracking-wider transition-colors">Cek Status</a>
              <a href="#layanan" className="text-xs font-bold text-slate-600 hover:text-blue-600 uppercase tracking-wider transition-colors">Layanan</a>
              <a href="#tentang" className="text-xs font-bold text-slate-600 hover:text-blue-600 uppercase tracking-wider transition-colors">Tentang Kami</a>
              <a href="#kontak" className="text-xs font-bold text-slate-600 hover:text-blue-600 uppercase tracking-wider transition-colors">Kontak</a>
              <Link 
                href="/staff-login" 
                className="bg-blue-600 text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-blue-700 shadow-md transition-all active:scale-95 inline-block">
                Login
              </Link>
            </div>

            {/* MOBILE MENU TOGGLE */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-2 shadow-2xl absolute w-full left-0 animate-in slide-in-from-top-5">
            <a href="#beranda" className="block text-slate-700 font-bold text-sm p-3 hover:bg-blue-50 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Beranda</a>
            <a href="#cek-status" className="block text-slate-700 font-bold text-sm p-3 hover:bg-blue-50 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Cek Status</a>
            <a href="#layanan" className="block text-slate-700 font-bold text-sm p-3 hover:bg-blue-50 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Layanan</a>
            <a href="#tentang" className="block text-slate-700 font-bold text-sm p-3 hover:bg-blue-50 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Tentang Kami</a>
            <a href="#kontak" className="block text-slate-700 font-bold text-sm p-3 hover:bg-blue-50 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Kontak</a>
            <Link href="/staff-login" className="block bg-blue-600 text-white text-center py-3 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all">Login</Link>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="beranda" className="pt-32 pb-12 md:pt-52 md:pb-48 text-center relative overflow-hidden flex flex-col items-center">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="reveal active flex flex-col items-center w-full">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] md:text-sm font-bold border border-blue-100 mb-8 animate-bounce">
              SKY LAUNDRY Terpercaya 100%
            </span>

            <h1 className="text-4xl sm:text-7xl md:text-9xl font-black text-slate-900 leading-tight mb-8 tracking-tighter">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Cucian Bersih</span> <br />
              <span className="relative inline-block">Sebening Langit</span>
            </h1>

            <p className="text-sm sm:text-lg md:text-2xl text-slate-500 mb-14 max-w-3xl mx-auto font-medium">
              Layanan laundry premium dengan standar hotel bintang lima untuk menjaga kebersihan pakaian Anda sebersih langit biru.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#cek-status" className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                Lacak Status <ArrowRight size={20} />
              </a>
              <a href="#layanan" className="px-10 py-4 bg-white text-slate-700 border-2 border-slate-100 rounded-2xl font-black text-lg hover:border-blue-300 transition-colors">
                Pilihan Paket
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* --- CEK STATUS SECTION --- */}
      <section id="cek-status" className="py-10 md:py-24 bg-white relative text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden reveal w-full">
            
            {/* Header Section */}
            <div className="py-10 bg-gradient-to-br from-blue-600 to-blue-900 text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
              <h2 className="text-2xl md:text-6xl font-black uppercase tracking-widest relative z-10">Cek Resi</h2>
              <p className="text-blue-100 text-xs md:text-base mt-2 relative z-10 font-medium tracking-wide">Pantau status laundry Anda secara Real-time</p>
            </div>

            {/* Input Search */}
            <div className="p-8 -mt-8 bg-white relative z-20 mx-auto w-[90%] md:w-[80%] rounded-[2rem] shadow-lg border border-slate-50">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Masukkan ID Resi (Contoh: 240209-1430-K)" 
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCheckStatus()}
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center text-lg md:text-2xl font-black text-slate-700 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:font-normal placeholder:text-slate-300 uppercase"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-200 text-slate-400 p-2 rounded-xl hidden md:block">
                  <Search className="w-6 h-6" />
                </div>
              </div>

              <button 
                onClick={handleCheckStatus}
                disabled={isLoading}
                className="w-full mt-6 py-4 md:py-5 bg-blue-600 text-white rounded-2xl font-black text-lg md:text-xl uppercase tracking-widest hover:bg-blue-700 transition active:scale-[0.98] shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-6 w-6 text-white" />
                    <span>Mencari...</span>
                  </>
                ) : (
                  <>
                    <span>Lacak Pesanan</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Result Display Area */}
            <div className="p-6 md:p-12 min-h-[300px] bg-slate-50 flex items-center justify-center">
              
              {/* State: Kosong / Belum Cari */}
              {!searchResult && !errorMsg && !isLoading && (
                 <div className="text-center opacity-50">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full mx-auto flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                       <Search className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-bold text-sm md:text-base uppercase tracking-widest">Masukkan Nomor Resi Anda</p>
                 </div>
              )}

              {/* State: Error */}
              {errorMsg && (
                 <div className="text-center w-full max-w-md animate-in fade-in zoom-in duration-300">
                    <div className="bg-red-50 text-red-500 p-6 rounded-3xl border-2 border-red-100 flex flex-col items-center gap-3">
                      <AlertCircle className="w-12 h-12" />
                      <span className="font-bold text-lg">{errorMsg}</span>
                    </div>
                 </div>
              )}

              {/* State: Data Ditemukan (Ticket Style) */}
              {searchResult && (
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 w-full max-w-2xl text-left overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500 relative">
                    
                    {/* Hiasan Ticket Cut */}
                    <div className="absolute top-1/2 -left-3 w-6 h-6 bg-slate-50 rounded-full"></div>
                    <div className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-50 rounded-full"></div>

                    {/* Header Ticket */}
                    <div className="bg-slate-900 text-white p-6 md:p-8 flex justify-between items-center relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Nomor Resi</p>
                            <h3 className="text-xl md:text-3xl font-mono font-black tracking-tighter text-yellow-400">{searchResult.orderId}</h3>
                        </div>
                        <div className="relative z-10">
                            <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border ${searchResult.isPaid ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-red-500 text-white border-red-400'}`}>
                                {searchResult.isPaid ? 'LUNAS' : 'BELUM BAYAR'}
                            </div>
                        </div>
                    </div>

                    {/* Body Ticket */}
                    <div className="p-6 md:p-8 space-y-6">
                        
                       {/* Customer Info */}
                       <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-6">
                          <div>
                            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Nama Pelanggan</p>
                            <p className="text-lg md:text-2xl font-bold text-slate-800">{searchResult.customerName}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-slate-400 text-xs font-bold uppercase mb-1">Tanggal Masuk</p>
                             <p className="text-sm md:text-base font-bold text-slate-600">
                                {new Date(searchResult.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                             </p>
                          </div>
                       </div>

                       {/* Status Progress Bar */}
                       <div>
                          <div className="flex justify-between items-end mb-3">
                            <span className="text-slate-400 text-xs font-bold uppercase">Status Pengerjaan</span>
                            <span className={`text-sm md:text-lg font-black uppercase ${getStatusColorText(searchResult.status)}`}>
                                {getStatusLabel(searchResult.status)}
                            </span>
                          </div>
                          
                          {/* Progress Bar Container */}
                          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden shadow-inner relative">
                             <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${getStatusColorBg(searchResult.status)}`}
                                style={{ width: getProgressWidth(searchResult.status) }}
                             >
                                <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                             </div>
                          </div>
                          <div className="flex justify-between text-[10px] font-bold text-slate-300 mt-2 uppercase tracking-wide">
                              <span>Masuk</span>
                              <span>Proses</span>
                              <span>Selesai</span>
                          </div>
                       </div>

                       {/* Detail Layanan & Total */}
                       <div className="bg-slate-50 rounded-2xl p-5 md:p-6 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600 border border-slate-100">
                                <Package className="w-6 h-6" />
                             </div>
                             <div>
                                <p className="text-slate-500 text-xs font-bold uppercase">Layanan</p>
                                <p className="text-slate-800 font-bold">{searchResult.serviceType} <span className="text-slate-400">•</span> {searchResult.weight} Kg</p>
                             </div>
                          </div>
                          <div className="text-center md:text-right">
                             <p className="text-slate-500 text-xs font-bold uppercase">Total Tagihan</p>
                             <p className="text-2xl font-black text-blue-600">Rp {searchResult.totalPrice.toLocaleString('id-ID')}</p>
                          </div>
                       </div>

                    </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- LAYANAN SECTION --- */}
      <section id="layanan" className="py-20 bg-slate-50 text-center">
        <div className="max-w-7xl mx-auto px-5">
           <div className="text-center mb-16 reveal">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">Layanan Kami</span>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 mt-2">Pilihan Terbaik</h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1: Ekspres */}
              <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 group reveal hover:shadow-2xl transition-all duration-500">
                 <div className="h-60 overflow-hidden relative bg-blue-100">
                    <Image 
                      src="/express.png" 
                      alt="Layanan Ekspres"
                      width={400} 
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    />
                 </div>
                 <div className="p-8 text-left">
                    <h3 className="text-2xl font-extrabold text-slate-800">Ekspres</h3>
                    <p className="text-slate-500 mt-2 mb-6 text-sm">Kilat dalam hitungan jam. Solusi cerdas kebutuhan mendesak.</p>
                    <div className="pt-6 border-t border-slate-50">
                        <span className="text-2xl font-black text-blue-600">Rp 15.000</span>
                    </div>
                 </div>
              </div>

              {/* Card 2: Kiloan */}
              <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 group reveal delay-100 hover:shadow-2xl transition-all duration-500">
                 <div className="h-60 overflow-hidden relative bg-blue-100">
                    <Image 
                      src="/kiloan.png" 
                      alt="Layanan Kiloan"
                      width={400} 
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    />
                 </div>
                 <div className="p-8 text-left">
                    <h3 className="text-2xl font-extrabold text-slate-800">Kiloan</h3>
                    <p className="text-slate-500 mt-2 mb-6 text-sm">Hemat harian keluarga. Bersih, harum, dan rapi.</p>
                    <div className="pt-6 border-t border-slate-50">
                        <span className="text-2xl font-black text-blue-600">Rp 8.000</span>
                    </div>
                 </div>
              </div>

              {/* Card 3: Satuan */}
              <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 group reveal delay-200 hover:shadow-2xl transition-all duration-500">
                 <div className="h-60 overflow-hidden relative bg-blue-100">
                    <Image 
                      src="/satuan.png" 
                      alt="Layanan Satuan"
                      width={400} 
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    />
                 </div>
                 <div className="p-8 text-left">
                    <h3 className="text-2xl font-extrabold text-slate-800">Satuan</h3>
                    <p className="text-slate-500 mt-2 mb-6 text-sm">Perawatan premium untuk jas, gaun, dan kebaya.</p>
                    <div className="pt-6 border-t border-slate-50">
                        <span className="text-2xl font-black text-blue-600">Rp 25.000</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- TENTANG SECTION --- */}
      <section id="tentang" className="py-20 bg-white text-center">
         <div className="max-w-6xl mx-auto px-4 reveal">
            
            {/* Main Banner Image */}
            <div className="bg-blue-900 rounded-[3rem] overflow-hidden relative min-h-[600px] flex items-center justify-center group shadow-2xl">
               <Image 
                 src="/tentang.jpg" 
                 alt="Tentang Sky Laundry"
                 fill
                 className="object-cover opacity-60 group-hover:scale-105 transition duration-[3s]"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-transparent"></div>
               
               <div className="relative z-10 max-w-3xl px-6 pb-20">
                  <div className="flex justify-center mb-8">
                     <span className="px-6 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-xs md:text-sm font-extrabold uppercase tracking-widest border border-white/30 shadow-lg">
                        Profil Perusahaan
                     </span>
                  </div>
                  <h2 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter uppercase drop-shadow-2xl">
                    SKY LAUNDRY
                  </h2>
                  <p className="text-lg md:text-2xl text-blue-50 font-medium leading-relaxed drop-shadow-md">
                     Kami menghadirkan teknologi pencucian modern untuk menjaga serat kain Anda tetap awet sebersih langit biru.
                  </p>
               </div>
            </div>

            {/* Jadwal Operasional Card */}
            <div className="relative z-20 -mt-16 px-4">
               <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 md:p-12 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-blue-100/50 transition-all duration-500">
                  <div className="flex items-center gap-6">
                     <div className="bg-blue-600 text-white p-5 rounded-3xl shadow-lg shadow-blue-200">
                        <Clock className="w-10 h-10" />
                     </div>
                     <div className="text-left">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Jadwal Operasional</p>
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900">Buka Setiap Hari</h3>
                     </div>
                  </div>
                  <div className="hidden md:block w-px h-16 bg-slate-200"></div>
                  <div className="text-center md:text-right">
                     <p className="text-lg md:text-xl font-bold text-slate-500 mb-1">Senin - Minggu</p>
                     <p className="text-3xl md:text-5xl font-black text-blue-600 tracking-tight">07:00 - 20:00</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- KONTAK SECTION --- */}
      <section id="kontak" className="py-16 md:py-32 bg-slate-50 text-center">
        <div className="max-w-7xl mx-auto px-5">
            <div className="text-center mb-16 reveal">
                <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Hubungi Kami</h2>
                <div className="h-1.5 w-16 bg-blue-600 mx-auto rounded-full mt-6 opacity-30"></div>
            </div>

            <div className="max-w-5xl mx-auto space-y-12">
                {/* Form Card */}
                <div className="bg-white p-8 md:p-16 rounded-[2.5rem] shadow-xl reveal text-left">
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                            <input type="text" placeholder="Nama Anda" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nomor HP</label>
                            <input type="tel" placeholder="0812..." className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Pesan</label>
                            <textarea rows={4} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"></textarea>
                        </div>
                        <div className="md:col-span-2 pt-4">
                            <button type="button" className="btn-shimmer w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl uppercase tracking-widest hover:bg-blue-700 transition">
                                Kirim Sekarang
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 shadow-sm group hover:shadow-lg transition">
                        <div className="bg-blue-50 text-blue-500 p-5 rounded-3xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
                          <MapPin className="w-8 h-8" />
                        </div>
                        <div>
                            <h4 className="font-extrabold text-slate-900 text-xl">Lokasi Utama</h4>
                            <p className="text-slate-500">Pontianak, Kalimantan Barat</p>
                        </div>
                    </div>
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 shadow-sm group hover:shadow-lg transition">
                        <div className="bg-green-50 text-green-500 p-5 rounded-3xl group-hover:bg-green-500 group-hover:text-white transition-colors">
                          <Truck className="w-8 h-8" />
                        </div>
                        <div>
                            <h4 className="font-extrabold text-slate-900 text-xl">Pickup Gratis</h4>
                            <p className="text-xs text-green-600 font-black uppercase tracking-widest">RADIUS 5 KM</p>
                        </div>
                    </div>
                </div>

                {/* Instagram Banner */}
                <div className="w-full reveal">
                    <div className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-800 p-8 md:p-12 rounded-[3rem] shadow-xl text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">
                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner group-hover:rotate-12 transition-transform">
                                <Instagram className="w-8 h-8 text-white" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Ikuti Kami</p>
                                <p className="text-2xl font-black tracking-wide">SKY LAUNDRY</p>
                            </div>
                        </div>
                        <div className="mt-6 md:mt-0 relative z-10">
                            <a href="#" className="inline-flex items-center px-8 py-3 bg-white text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all shadow-lg active:scale-95">
                                Lihat Instagram
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-14 bg-white text-center border-t border-slate-100 px-5">
         <span className="text-2xl font-extrabold text-slate-900 tracking-tight block mb-2">Sky Laundry</span>
         <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.3em]">&copy; 2026 SKY LAUNDRY OFFICIAL. PONTIANAK.</p>
      </footer>

      {/* --- WHATSAPP FLOATING --- */}
      <a 
        href="https://wa.me/628123456789" 
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[70] bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all flex items-center justify-center group"
      >
        <svg className="w-8 h-8 fill-current group-hover:animate-pulse" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.891 11.893-11.891 3.181 0 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.481 8.412 0 6.556-5.333 11.891-11.893 11.891-2.01 0-3.987-.512-5.747-1.483l-6.246 1.692z"/>
        </svg>
      </a>

    </main>
  );
}