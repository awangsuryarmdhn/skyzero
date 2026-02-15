"use client"; // Wajib karena ada interaksi (tombol/input)

import { Search } from 'lucide-react';
import { useState } from 'react';

export default function HeroSection() {
  const [resi, setResi] = useState('');

  const handleCekStatus = () => {
    alert(`Mengecek resi: ${resi} (Nanti kita sambungkan ke Backend!)`);
  };

  return (
    <section className="relative mb-20">
      {/* Background Biru Atas */}
      <div className="bg-gradient-to-b from-blue-100 to-white pb-32 pt-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="text-blue-600 font-semibold tracking-wider text-sm">
            SKY LAUNDRY PROFESSIONAL
          </span>
          <h1 className="mt-4 text-5xl md:text-6xl font-extrabold text-blue-900 leading-tight">
            Cucian Bersih <br />
            <span className="text-blue-500">Sebening Langit</span>
          </h1>
          <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
            Layanan laundry premium dengan standar hotel bintang lima untuk menjaga kebersihan pakaian Anda secerah langit biru.
          </p>
          
          <div className="mt-8 flex justify-center gap-4">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition">
              Layanan Kami
            </button>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold shadow-md hover:bg-gray-50 transition border border-blue-100">
              Hubungi Kami
            </button>
          </div>
        </div>
      </div>

      {/* Floating Card: Cek Status */}
      <div className="max-w-xl mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-blue-50 text-center">
          <div className="bg-blue-600 text-white py-3 px-6 rounded-xl inline-block mb-6 shadow-blue-200 shadow-lg">
            <h3 className="font-bold tracking-widest uppercase">Cek Status</h3>
          </div>
          
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Masukkan Kode Resi (Contoh: ORDER-123)"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg placeholder:text-gray-400"
              value={resi}
              onChange={(e) => setResi(e.target.value)}
            />
            
            <button 
              onClick={handleCekStatus}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Search size={20} />
              LACAK SEKARANG
            </button>
          </div>
          
          <p className="mt-4 text-xs text-gray-400">
            Hasil pelacakan Real-time
          </p>
        </div>
      </div>
    </section>
  );
}