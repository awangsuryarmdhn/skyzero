'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import './staff-login.css'; // Import CSS kustom tadi

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Refs untuk elemen animasi
  const cloudLayerRef = useRef<HTMLDivElement>(null);
  const bubbleLayerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // --- LOGIKA ANIMASI (Dari login.js) ---
  useEffect(() => {
    const createCloud = () => {
      if (!cloudLayerRef.current) return;
      const cloud = document.createElement('div');
      const size = Math.random() * 80 + 40;
      const top = Math.random() * 100;
      const duration = Math.random() * 30 + 30;
      const delay = Math.random() * -20;

      cloud.className = 'cloud';
      cloud.innerHTML = `<i class="fas fa-cloud" style="font-size: ${size}px"></i>`;
      cloud.style.top = `${top}%`;
      cloud.style.left = `-200px`;
      cloud.style.animation = `drift ${duration}s linear ${delay}s infinite`;
      cloudLayerRef.current.appendChild(cloud);
    };

    const createBubble = () => {
      if (!bubbleLayerRef.current) return;
      const bubble = document.createElement('div');
      const size = Math.random() * 30 + 10;
      const left = Math.random() * 100;
      const duration = Math.random() * 5 + 5;

      bubble.className = 'bubble';
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${left}%`;
      bubble.style.animation = `floatUp ${duration}s linear infinite`;
      bubbleLayerRef.current.appendChild(bubble);

      setTimeout(() => bubble.remove(), duration * 1000);
    };

    // Jalankan animasi
    const isMobile = window.innerWidth < 768;
    const cloudCount = isMobile ? 6 : 10;
    for (let i = 0; i < cloudCount; i++) createCloud();
    
    const bubbleInterval = setInterval(createBubble, isMobile ? 1000 : 600);

    // Efek 3D Mouse Move
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMobile && cardRef.current) {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 45;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 45;
        
        // Perbaiki targeting parentElement agar aman di React
        if (cardRef.current.parentElement) {
            cardRef.current.parentElement.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg) translateZ(0)`;
        }
        
        if (cloudLayerRef.current) {
            cloudLayerRef.current.style.transform = `translateX(${xAxis * 1.2}px) translateY(${yAxis * 1.2}px) translateZ(0)`;
        }
      }
    };

    if (!isMobile) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      clearInterval(bubbleInterval);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // --- LOGIKA LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        // 1. Panggil API Backend yang Asli
        const res = await fetch('http://localhost:4000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        // 2. Cek apakah login berhasil?
        if (!res.ok) {
             throw new Error(data.message || 'Login gagal');
        }

        // 3. Login Sukses: Simpan Token
        localStorage.setItem('accessToken', data.access_token);
        
        // 4. Jalankan Animasi & Redirect
        setShowSuccess(true);
        setTimeout(() => {
            router.push('/dashboard');
        }, 2000);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Login Error:", error);
        alert(error.message); // Tampilkan pesan error dari backend (misal: "Password salah")
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper relative flex items-center justify-center p-4 sm:p-6 min-h-screen">
      {/* Load Font Awesome via CDN (atau install via npm lebih baik) */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />

      {/* Latar Belakang Interaktif */}
      <div ref={cloudLayerRef} id="cloud-layer" className="absolute inset-0 z-0"></div>
      <div ref={bubbleLayerRef} id="bubble-layer" className="absolute inset-0 z-0"></div>

      {/* Konten Utama */}
      <div className="max-w-md w-full relative z-20" id="parallax-container">
        
        {/* Brand Header */}
        <div className="text-center mb-6 sm:mb-10 reveal" style={{ animationDelay: '0.1s' }}>
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-white blur-2xl opacity-30 rounded-full scale-150"></div>
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl flex items-center justify-center mb-4 transform transition hover:rotate-6">
              <i className="fas fa-cloud-showers-heavy text-sky-500 text-4xl sm:text-5xl"></i>
              <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-400 rounded-full border-4 border-white animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg tracking-tight">Sky Laundry</h1>
          <p className="text-sky-50 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase mt-1 sm:mt-2 opacity-80">Management System</p>
        </div>

        {/* Wrapper untuk Border Glow */}
        <div className="relative reveal" style={{ animationDelay: '0.3s' }}>
          <div className="card-border-glow"></div>
          
          {/* Login Card */}
          <div ref={cardRef} id="login-card" className="glass-card rounded-3xl sm:rounded-[3rem] p-6 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)]">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Masuk Akun</h2>
              <div className="h-1 w-10 sm:w-12 bg-sky-500 rounded-full mt-2 animate-pulse"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
              <div className="space-y-1.5 sm:space-y-2 group">
                <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Email Admin</label>
                <div className="relative">
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-5 pr-4 py-3.5 sm:py-4 bg-white/70 border border-slate-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 focus:bg-white transition-all duration-300 outline-none text-sm sm:text-base font-medium text-slate-800"
                    placeholder="email@skylaundry.com" 
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2 group">
                <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Kata Sandi</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-5 pr-12 py-3.5 sm:py-4 bg-white/70 border border-slate-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 focus:bg-white transition-all duration-300 outline-none text-sm sm:text-base font-medium text-slate-800"
                    placeholder="••••••••" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-sky-500 active:scale-90 transition-transform"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="shine-btn w-full bg-sky-600 hover:bg-sky-500 text-white font-black py-4 sm:py-5 rounded-xl sm:rounded-2xl shadow-xl shadow-sky-200 transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-3 text-sm sm:text-base disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                    <>
                        <i className="fas fa-cog animate-spin"></i> Memuat...
                    </>
                ) : (
                    <>
                        <span>Mulai Mengelola</span>
                        <i className="fas fa-arrow-right text-xs"></i>
                    </>
                )}
              </button>
            </form>

            <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-slate-100 text-center">
              <p className="text-slate-400 text-[10px] sm:text-sm font-semibold tracking-wide uppercase">Sky Laundry</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Overlay */}
      <div 
        id="success-overlay" 
        className={`fixed inset-0 z-[100] bg-sky-600 flex items-center justify-center transition-opacity duration-500 ${showSuccess ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
      >
        <div className="text-center text-white p-6">
          <svg className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="25" fill="none" stroke="white" strokeWidth="2" />
            <path className="success-circle" fill="none" stroke="white" strokeWidth="3" d="M14 27l7 7 16-16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h3 className="text-2xl sm:text-3xl font-bold">Akses Diterima!</h3>
          <p className="mt-2 text-sky-100 text-sm sm:text-base">Mempersiapkan mesin cuci digital Anda...</p>
        </div>
      </div>
    </div>
  );
}