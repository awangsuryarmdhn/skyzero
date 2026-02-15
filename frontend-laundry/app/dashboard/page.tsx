'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LineChart, Search, Filter, RotateCcw, LogOut, 
  CheckCircle, AlertCircle, Trash2, Package, Calendar, 
  Plus, X, Edit, Save, Loader2, Clock, Printer, DollarSign, 
  AlertTriangle, Info, ChevronLeft, ChevronRight, MessageSquare // Icon tambahan untuk notifikasi & log
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// --- TIPE DATA ---
interface Order {
  id: string; 
  orderId: string;
  customerName: string;
  phoneNumber: string;
  serviceType: 'KILOAN' | 'SATUAN' | 'EXPRESS';
  weight: number;
  totalPrice: number;
  status: 'PENDING' | 'WASHING' | 'IRONING' | 'READY' | 'COMPLETED';
  isPaid: boolean; 
  createdAt: string;
}

// Tipe Data Log Aktivitas
interface ActivityLog {
  id: number;
  action: string;
  details: string;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]); // State Logs
  const [loading, setLoading] = useState(true);
  
  // State Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState(''); 
  const [endDate, setEndDate] = useState('');     

  // --- LOGIKA PAGINATION DINAMIS ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15); // Default 15

  // State Modal & Print
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // State Struk
  const [printData, setPrintData] = useState<Order | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // --- STATE DELETE MODAL (2-STEP) ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1); // 1 = Konfirmasi Awal, 2 = Konfirmasi Final
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- STATE PRINT MODAL ---
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [pendingPrintOrder, setPendingPrintOrder] = useState<Order | null>(null);

  // Form Data Default
  const initialForm = {
    customerName: '',
    phoneNumber: '',
    serviceType: 'KILOAN', 
    weight: 1,
    status: 'PENDING',
    isPaid: false 
  };
  const [formData, setFormData] = useState(initialForm);

  // --- STATE NOTIFIKASI MODERN ---
  const [notif, setNotif] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info'
  });

  // Fungsi Trigger Notifikasi
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotif({ show: true, message, type });
    // Auto-hide 3 detik
    setTimeout(() => {
      setNotif(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // --- 1. FETCH DATA (ORDERS & LOGS) ---
  const fetchOrders = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return router.push('/staff-login');

    try {
      const res = await fetch('http://localhost:4000/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('accessToken');
          router.push('/staff-login');
        }
        throw new Error('Gagal mengambil data');
      }

      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
      showNotification("Gagal memuat data server", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch('http://localhost:4000/orders/activity/logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLogs(data);
    } catch (error) { console.error("Gagal ambil logs", error); }
  };

  useEffect(() => { 
      fetchOrders(); 
      fetchLogs(); // Ambil logs juga saat load
  }, [router]);

  // --- 2. PRINT FUNCTION ---
  const handlePrint = (order: Order) => {
    setPrintData(order);
    setTimeout(() => {
        window.print();
    }, 100);
  };

  // --- 3. SUBMIT HANDLE (CREATE & UPDATE) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('accessToken');

    try {
      const url = isEditing 
        ? `http://localhost:4000/orders/${editId}` 
        : 'http://localhost:4000/orders';
      
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Gagal menyimpan data");
      
      const savedData = await res.json(); 

      await fetchOrders();
      await fetchLogs(); // Refresh log setelah simpan
      closeModal();
      
      // Notifikasi Sukses
      showNotification(isEditing ? "Data berhasil diperbarui!" : "Pesanan berhasil dibuat!", "success");

      // Tawarkan Print jika pesanan baru
      if (!isEditing) {
        setPendingPrintOrder(savedData); // Simpan data order yang baru dibuat
        setShowPrintModal(true);         // Buka modal konfirmasi
      }

    } catch (error) {
      console.error(error);
      showNotification("Terjadi kesalahan saat menyimpan.", "error");
    } finally {
      setSaving(false);
    }
  };

  // --- 4. TOGGLE PAYMENT STATUS ---
  const togglePayment = async (order: Order) => {
    const token = localStorage.getItem('accessToken');
    const newStatus = !order.isPaid;
    
    // Optimistic UI Update
    const originalOrders = [...orders];
    setOrders(orders.map(o => o.id === order.id ? { ...o, isPaid: newStatus } : o));

    try {
        const res = await fetch(`http://localhost:4000/orders/${order.id}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ isPaid: newStatus })
        });
        
        if(!res.ok) throw new Error("Gagal update pembayaran");
        
        showNotification(`Status pembayaran: ${newStatus ? 'LUNAS' : 'BELUM LUNAS'}`, "info");
        fetchOrders(); // Sync data
        fetchLogs();   // Sync logs
    } catch (error) { 
        console.error(error);
        setOrders(originalOrders); // Rollback
        showNotification("Gagal mengubah status pembayaran", "error");
    }
  };

  // --- 5. DELETE HANDLER (2-STEP MODAL) ---
  
  // Trigger Modal
  const promptDelete = (id: string) => {
    setDeleteId(id);
    setDeleteStep(1); // Mulai dari langkah 1
    setShowDeleteModal(true);
  };

  // Eksekusi Hapus Final
  const confirmDelete = async () => {
    if (!deleteId) return;
    
    setIsDeleting(true);
    const token = localStorage.getItem('accessToken');

    try {
      const res = await fetch(`http://localhost:4000/orders/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if(res.ok) {
          showNotification("Pesanan berhasil dihapus permanen", "info");
          await fetchOrders();
          await fetchLogs();
          setShowDeleteModal(false); 
      } else {
          throw new Error("Gagal hapus");
      }
    } catch (error) { 
        console.error(error); 
        showNotification("Gagal menghapus data", "error");
    } finally {
        setIsDeleting(false);
    }
  };

  const markAsCompleted = async (id: string) => {
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`http://localhost:4000/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'COMPLETED' })
      });
      
      if(res.ok) {
          showNotification("Pesanan ditandai Selesai", "success");
          fetchOrders();
          fetchLogs();
      }
    } catch (error) { console.error(error); }
  };

  // --- UI HELPERS ---
  const openCreateModal = () => {
    setIsEditing(false); setEditId(null); setFormData(initialForm); setShowModal(true);
  };

  const openEditModal = (order: Order) => {
    setIsEditing(true); setEditId(order.id);
    setFormData({
      customerName: order.customerName,
      phoneNumber: order.phoneNumber,
      serviceType: order.serviceType,
      weight: order.weight,
      status: order.status,
      isPaid: order.isPaid
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setSaving(false); };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const lowerSearch = search.toLowerCase();
      const paymentStatusSearch = order.isPaid ? 'lunas' : 'belum'; 

      // 1. LOGIKA SEARCH TEXT (Sama seperti sebelumnya)
      const matchSearch = 
        order.customerName.toLowerCase().includes(lowerSearch) ||   
        order.orderId.toLowerCase().includes(lowerSearch) ||        
        (order.phoneNumber && order.phoneNumber.includes(search)) || 
        order.serviceType.toLowerCase().includes(lowerSearch) ||    
        paymentStatusSearch.includes(lowerSearch);

      // 2. LOGIKA STATUS
      const matchStatus = statusFilter === 'all' ? true : order.status === statusFilter;
      
      // 3. LOGIKA DATE RANGE (BARU)
      let matchDate = true;
      if (startDate || endDate) {
        const orderDate = new Date(order.createdAt).setHours(0, 0, 0, 0); // Ambil tanggalnya saja (jam 00:00)
        const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
        const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;

        if (start && orderDate < start) matchDate = false; // Jika sebelum tanggal mulai
        if (end && orderDate > end) matchDate = false;     // Jika setelah tanggal akhir
      }
      
      return matchSearch && matchStatus && matchDate;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, search, statusFilter, startDate, endDate]); // Jangan lupa update dependency array

  // Hitung index data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Fungsi ganti halaman
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, startDate, endDate, itemsPerPage]);

  const stats = useMemo(() => ({
    income: orders.filter(o => o.status === 'COMPLETED').reduce((acc, curr) => acc + curr.totalPrice, 0),
    pending: orders.filter(o => o.status !== 'COMPLETED').reduce((acc, curr) => acc + curr.totalPrice, 0),
    countDone: orders.filter(o => o.status === 'COMPLETED').length,
    countPending: orders.filter(o => o.status !== 'COMPLETED').length
  }), [orders]);

  const chartData = {
    labels: filteredOrders.slice(0, 7).map(o => new Date(o.createdAt).toLocaleDateString('id-ID', {day: '2-digit', month: 'short'})).reverse(),
    datasets: [{
      label: 'Omzet',
      data: filteredOrders.slice(0, 7).map(o => o.totalPrice).reverse(),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  const getStatusColor = (status: string) => {
    switch(status) {
        case 'PENDING': return 'bg-slate-100 text-slate-600';
        case 'WASHING': return 'bg-blue-100 text-blue-600';
        case 'IRONING': return 'bg-amber-100 text-amber-600';
        case 'READY': return 'bg-purple-100 text-purple-600';
        case 'COMPLETED': return 'bg-emerald-100 text-emerald-600';
        default: return 'bg-gray-100 text-gray-600';
    }
  };

  const confirmPrint = () => {
    if (pendingPrintOrder) {
        handlePrint(pendingPrintOrder);
        setShowPrintModal(false); // Tutup modal setelah print
        setPendingPrintOrder(null);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 font-[family-name:var(--font-jakarta)] relative print:p-0 print:bg-white">
      
      {/* --- STRUK PRINT AREA --- */}
      <div className="hidden print:block print:w-[300px] print:mx-auto print:text-black print:font-mono p-4" ref={printRef}>
        {printData && (
            <div className="text-center border-b-2 border-dashed border-black pb-4 mb-4">
                <h1 className="text-xl font-black uppercase">Sky Laundry</h1>
                <p className="text-xs">Jl. Merdeka No. 123, Pontianak</p>
                <p className="text-xs">WA: 0812-3456-7890</p>
                <br/>
                <div className="text-left text-xs space-y-1">
                    <p>No. Order : <strong>{printData.orderId}</strong></p>
                    <p>Tanggal   : {new Date().toLocaleDateString('id-ID')}</p>
                    <p>Pelanggan : {printData.customerName}</p>
                </div>
                <br/>
                <div className="border-t border-b border-black py-2 text-left text-xs">
                    <div className="flex justify-between font-bold">
                        <span>{printData.serviceType} ({printData.weight}kg)</span>
                        <span>Rp {printData.totalPrice.toLocaleString('id-ID')}</span>
                    </div>
                </div>
                <br/>
                <div className="text-right text-sm font-black">
                    TOTAL: Rp {printData.totalPrice.toLocaleString('id-ID')}
                </div>
                <div className="text-center text-xs mt-4">
                    STATUS: {printData.isPaid ? 'LUNAS' : 'BELUM LUNAS'}
                </div>
                <div className="text-center text-[10px] mt-4 italic">
                    Terima kasih telah mempercayakan<br/>cucian Anda kepada kami!
                </div>
            </div>
        )}
      </div>

      {/* --- DASHBOARD CONTENT --- */}
      <div className="print:hidden">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div>
            <h1 className="text-3xl md:text-4xl font-black text-blue-600 flex items-center gap-3">
                Sky Laundry <span className="text-slate-300 font-light text-xl">Dashboard</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Panel Kontrol Admin & Staff</p>
            </div>
            <div className="flex gap-3">
            
            {/* LINK KE BOT DASHBOARD (AUTO LOGIN) */}
            <button 
                onClick={() => {
                    const token = localStorage.getItem('accessToken');
                    if (token) {
                        const targetUrl = `http://localhost:3005/admin/auth-token?token=${encodeURIComponent(token)}`;
                        window.open(targetUrl, '_blank');
                    } else {
                        window.open('http://localhost:3005/admin/login', '_blank');
                    }
                }}
                className="bg-emerald-500 text-white hover:bg-emerald-600 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-200 active:scale-95"
            >
                <MessageSquare size={20} /> Bot WA
            </button>

            <button onClick={openCreateModal} className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-200 active:scale-95">
                <Plus size={20} /> Input Pesanan
            </button>
            <button onClick={() => { localStorage.removeItem('accessToken'); router.push('/staff-login'); }} className="bg-white border border-red-100 text-red-500 hover:bg-red-50 px-4 py-3 rounded-xl font-bold transition-all shadow-sm">
                <LogOut size={20} />
            </button>
            </div>
        </header>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg shadow-blue-200">
            <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-2">Total Omzet</p>
            <h3 className="text-3xl font-black">Rp {stats.income.toLocaleString('id-ID')}</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Potensi (Pending)</p>
            <h3 className="text-3xl font-black text-amber-500">Rp {stats.pending.toLocaleString('id-ID')}</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Order Selesai</p>
            <h3 className="text-3xl font-black text-emerald-600">{stats.countDone}</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Dalam Proses</p>
            <h3 className="text-3xl font-black text-blue-600">{stats.countPending}</h3>
            </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* KIRI: TABEL & FILTER */}
            <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
                
                {/* 1. INPUT PENCARIAN */}
                <div className="relative flex-grow min-w-[200px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Cari ID / Nama / No HP..." 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)} 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none outline-none font-medium text-slate-700 transition-all focus:bg-blue-50/50 focus:ring-2 focus:ring-blue-100" 
                    />
                </div>

                {/* 2. FILTER STATUS */}
                <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)} 
                    className="px-4 py-3 bg-slate-50 rounded-2xl border-none outline-none font-medium text-slate-700 cursor-pointer min-w-[150px] transition-all focus:bg-blue-50/50 focus:ring-2 focus:ring-blue-100"
                >
                    <option value="all">Semua Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="WASHING">Cuci</option>
                    <option value="IRONING">Setrika</option>
                    <option value="READY">Siap Ambil</option>
                    <option value="COMPLETED">Selesai</option>
                </select>

                {/* 3. FILTER TANGGAL (RANGE) - BARU */}
                <div className="flex items-center bg-slate-50 rounded-2xl px-2 py-1 border border-transparent focus-within:border-blue-200 focus-within:bg-blue-50/30 transition-all">
                    <div className="flex flex-col px-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dari</span>
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)} 
                            className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 p-0 w-[110px]" 
                        />
                    </div>
                    <div className="w-px h-8 bg-slate-200 mx-1"></div> {/* Garis Pemisah */}
                    <div className="flex flex-col px-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sampai</span>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)} 
                            className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 p-0 w-[110px]" 
                        />
                    </div>
                </div>

                {/* 4. TOMBOL RESET */}
                <button 
                    onClick={() => {
                        setSearch(''); 
                        setStatusFilter('all'); 
                        setStartDate(''); // Reset tanggal mulai
                        setEndDate('');   // Reset tanggal akhir
                    }} 
                    className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 hover:scale-105 transition-all shadow-sm active:scale-95"
                    title="Reset Filter"
                >
                    <RotateCcw size={20} />
                </button>
            </div>

            {/* --- TABEL ORDER (DIPERBARUI) --- */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="py-5 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Order ID</th>
                        <th className="py-5 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Pelanggan</th>
                        <th className="py-5 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-wider text-center">Info</th>
                        <th className="py-5 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-wider text-center">Pembayaran</th>
                        <th className="py-5 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-wider text-center">Status</th>
                        <th className="py-5 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-wider text-center">Aksi</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                    {filteredOrders.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-10 text-slate-400 italic">Tidak ada data ditemukan</td></tr>
                    ) : (
                        currentItems.map((order) => (
                        <tr key={order.id} className="hover:bg-blue-50/30 transition-colors">
                            {/* KOLOM 1: ORDER ID */}
                            <td className="py-4 px-6"><span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{order.orderId}</span></td>
                            
                            {/* KOLOM 2: PELANGGAN (Updated: Ada No HP & WA) */}
                            <td className="py-4 px-6">
                                <p className="font-bold text-slate-700">{order.customerName}</p>
                                
                                {/* CONTAINER NO HP & WA */}
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[11px] text-slate-500 font-medium font-mono bg-slate-50 px-1.5 rounded">{order.phoneNumber || '-'}</span>
                                    
                                    {/* Tombol WA hanya muncul jika ada nomor HP dan bukan tanda strip */}
                                    {order.phoneNumber && order.phoneNumber !== '-' && (
                                        <a 
                                            href={`https://wa.me/${order.phoneNumber.replace(/^0/, '62').replace(/\D/g, '')}?text=Halo Kak ${encodeURIComponent(order.customerName)}, status laundry Anda (Order ID: ${order.orderId}) saat ini: ${order.status}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[9px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-bold hover:bg-emerald-500 hover:text-white flex items-center gap-1 transition-colors border border-emerald-200"
                                            title="Chat via WhatsApp"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                            Chat
                                        </a>
                                    )}
                                </div>

                                <p className="text-[10px] text-slate-400 mt-1.5">{new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
                            </td>

                            {/* KOLOM 3: INFO BERAT & HARGA */}
                            <td className="py-4 px-6 text-center">
                                <div className="font-bold text-slate-600 text-sm">{order.serviceType}</div>
                                <div className="text-[10px] text-blue-500 font-bold">{order.weight} Kg • Rp {order.totalPrice.toLocaleString('id-ID')}</div>
                            </td>
                            
                            {/* KOLOM 4: STATUS PEMBAYARAN */}
                            <td className="py-4 px-6 text-center">
                                <button onClick={() => togglePayment(order)} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${order.isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'}`}>
                                    {order.isPaid ? 'LUNAS' : 'BELUM BAYAR'}
                                </button>
                            </td>

                            {/* KOLOM 5: STATUS PENGERJAAN */}
                            <td className="py-4 px-6 text-center">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                    {order.status === 'COMPLETED' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                    {order.status}
                                </span>
                            </td>

                            {/* KOLOM 6: AKSI */}
                            <td className="py-4 px-6 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <button onClick={() => handlePrint(order)} className="p-2 bg-slate-800 text-white rounded-full hover:bg-slate-900 transition-all shadow-sm active:scale-90" title="Cetak Struk">
                                        <Printer size={16} />
                                    </button>
                                    
                                    {/* Tombol Selesai hanya muncul jika belum completed */}
                                    {order.status !== 'COMPLETED' && (
                                        <button onClick={() => markAsCompleted(order.id)} className="p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-500 hover:text-white transition-all shadow-sm active:scale-90" title="Tandai Selesai">
                                            <CheckCircle size={16} />
                                        </button>
                                    )}

                                    <button onClick={() => openEditModal(order)} className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-blue-500 hover:text-white transition-all shadow-sm active:scale-90" title="Edit Data">
                                        <Edit size={16} />
                                    </button>
                                    
                                    <button onClick={() => promptDelete(order.id)} className="p-2 bg-red-50 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90" title="Hapus Permanen">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                        ))
                    )}
                    </tbody>
                </table>
                </div>
            </div>
            </div>

            {/* KANAN: CHART & ACTIVITY LOG */}
            <div className="space-y-8">
                
                {/* WIDGET CHART */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-xl">
                    <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                        <LineChart size={20} className="text-blue-600" /> Tren Transaksi
                    </h3>
                    <div className="h-48">
                        <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { display: false }, x: { grid: { display: false } } }, plugins: { legend: { display: false } } }} />
                    </div>
                </div>

                {/* WIDGET ACTIVITY LOG (BARU) */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-xl h-[400px] flex flex-col">
                    <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                        <Clock size={20} className="text-amber-500" /> Aktivitas Terbaru
                    </h3>
                    
                    <div className="overflow-y-auto pr-2 space-y-4 flex-1 custom-scrollbar">
                        {logs.length === 0 ? (
                            <p className="text-slate-400 text-center text-sm italic mt-10">Belum ada aktivitas.</p>
                        ) : (
                            logs.map((log) => (
                                <div key={log.id} className="flex gap-3 items-start pb-4 border-b border-slate-50 last:border-0">
                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                                        log.action.includes('CREATE') ? 'bg-blue-500' :
                                        log.action.includes('DELETE') ? 'bg-red-500' :
                                        log.action.includes('PAYMENT') ? 'bg-emerald-500' :
                                        'bg-amber-500'
                                    }`}></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700 leading-tight">{log.details}</p>
                                        <p className="text-[10px] text-slate-400 mt-1 font-medium">
                                            {new Date(log.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {new Date(log.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>

        {/* --- MODAL FORM INPUT/EDIT --- */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    {isEditing ? <Edit className="text-blue-600" /> : <Plus className="text-blue-600" />}
                    {isEditing ? 'Update Pesanan' : 'Input Pesanan Baru'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24} className="text-slate-400" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nama Pelanggan</label>
                    <input type="text" required value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-700 transition-all" placeholder="Contoh: Budi Santoso" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nomor WhatsApp</label>
                    <input 
                        type="text" 
                        required 
                        value={formData.phoneNumber} 
                        onChange={e => {
                            // Hanya izinkan angka
                            const val = e.target.value.replace(/\D/g, '');
                            setFormData({...formData, phoneNumber: val});
                        }} 
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-700 transition-all" 
                        placeholder="Contoh: 08123456789" 
                    />
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Berat (Kg)</label>
                    <input type="number" step="0.1" min="0.1" required value={formData.weight} onChange={e => setFormData({...formData, weight: parseFloat(e.target.value)})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-700 transition-all text-center" />
                    </div>
                    <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Layanan</label>
                    <select value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-700 transition-all appearance-none cursor-pointer">
                        <option value="KILOAN">Cuci Kiloan</option>
                        <option value="SATUAN">Cuci Satuan</option>
                        <option value="EXPRESS">Express</option>
                    </select>
                    </div>
                </div>

                {/* TOGGLE BAYAR */}
                <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setFormData({...formData, isPaid: !formData.isPaid})}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-slate-700 text-sm">Status Pembayaran</p>
                            <p className="text-xs text-slate-400">{formData.isPaid ? 'Pesanan LUNAS' : 'Belum dibayar'}</p>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.isPaid ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${formData.isPaid ? 'translate-x-6' : ''}`}></div>
                    </div>
                </div>

                {isEditing && (
                    <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Update Status</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['PENDING', 'WASHING', 'IRONING', 'READY', 'COMPLETED'].map((s) => (
                        <button key={s} type="button" onClick={() => setFormData({...formData, status: s})} className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${formData.status === s ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-300'}`}>{s}</button>
                        ))}
                    </div>
                    </div>
                )}
                <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-4">
                    {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    {isEditing ? 'Simpan Perubahan' : 'Buat Pesanan & Cetak'}
                </button>
                </form>
            </div>
            </div>
        )}

        {/* --- MODAL DELETE (2-STEP) --- */}
        {showDeleteModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8 text-center animate-in zoom-in-95 duration-200 border border-slate-100">
                
                {/* Ikon Peringatan */}
                <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg transition-colors duration-300 ${deleteStep === 1 ? 'bg-amber-100 text-amber-500' : 'bg-red-100 text-red-600 animate-pulse'}`}>
                    <AlertTriangle size={40} />
                </div>

                {/* KONTEN LANGKAH 1 */}
                {deleteStep === 1 && (
                    <div className="animate-in slide-in-from-right duration-300">
                        <h3 className="text-2xl font-black text-slate-800 mb-2">Hapus Pesanan?</h3>
                        <p className="text-slate-500 font-medium mb-8">
                            Apakah Anda yakin ingin menghapus data ini? Tindakan ini akan memindahkan data ke proses penghapusan.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowDeleteModal(false)} 
                                className="flex-1 py-4 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={() => setDeleteStep(2)} 
                                className="flex-1 py-4 rounded-2xl font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-200 transition-all"
                            >
                                Lanjut Hapus
                            </button>
                        </div>
                    </div>
                )}

                {/* KONTEN LANGKAH 2 (FINAL) */}
                {deleteStep === 2 && (
                    <div className="animate-in slide-in-from-right duration-300">
                        <h3 className="text-2xl font-black text-red-600 mb-2">Peringatan Terakhir!</h3>
                        <p className="text-slate-500 font-medium mb-8">
                            Data akan dihapus <strong>secara permanen</strong> dan tidak dapat dikembalikan. Anda yakin?
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setDeleteStep(1)} 
                                className="flex-1 py-4 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all">
                                Kembali
                            </button>
                            <button 
                                onClick={confirmDelete} 
                                disabled={isDeleting}
                                className="flex-1 py-4 rounded-2xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center justify-center">
                               <div className="flex items-center justify-center">
                                    {isDeleting ? (
                                        // KONDISI 1: SEDANG LOADING (Hanya Icon Putar)
                                        <Loader2 className="animate-spin w-5 h-5" /> 
                                    ) : (
                                        // KONDISI 2: TIDAK LOADING (Hanya Teks)
                                        <span>Ya, Hapus Permanen</span>
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>
                )}

            </div>
            </div>
        )}
      </div>

      {/* --- NOTIFIKASI TOAST (MODERN) --- */}
      <div className={`fixed top-6 right-6 z-[100] transform transition-all duration-500 ease-out ${notif.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        <div className="relative flex items-center gap-4 px-6 py-5 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/20 min-w-[320px] bg-white/90">
            
            {/* Icon Dynamic */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${
              notif.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
              notif.type === 'error' ? 'bg-red-100 text-red-600' :
              'bg-blue-100 text-blue-600'
            }`}>
                {notif.type === 'success' && <CheckCircle size={24} />}
                {notif.type === 'error' && <AlertTriangle size={24} />}
                {notif.type === 'info' && <Info size={24} />}
            </div>

            {/* Text Content */}
            <div className="flex-1">
                <h4 className={`font-black text-sm uppercase tracking-wider mb-0.5 ${
                  notif.type === 'success' ? 'text-emerald-700' :
                  notif.type === 'error' ? 'text-red-700' :
                  'text-blue-700'
                }`}>
                  {notif.type === 'success' ? 'Berhasil!' : notif.type === 'error' ? 'Gagal!' : 'Informasi'}
                </h4>
                <p className="font-medium text-slate-500 text-sm leading-tight">{notif.message}</p>
            </div>

            {/* Close Btn */}
            <button onClick={() => setNotif(prev => ({ ...prev, show: false }))} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
            </button>

            {/* Progress Bar Animation */}
            {notif.show && (
              <div className={`absolute bottom-0 left-0 h-1 w-full origin-left animate-[shrink_3s_linear_forwards] ${
                notif.type === 'success' ? 'bg-emerald-500' :
                notif.type === 'error' ? 'bg-red-500' :
                'bg-blue-500'
              }`}></div>
            )}
        </div>
      </div>

    {/* --- MODAL KONFIRMASI PRINT (MODERN) --- */}
      {showPrintModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden p-8 text-center animate-in zoom-in-95 duration-200 border border-slate-100">
            
            {/* Ikon Printer Berdenyut */}
            <div className="mx-auto w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-100">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
                    <Printer size={32} className="relative z-10" />
                </div>
            </div>

            <h3 className="text-2xl font-black text-slate-800 mb-2">Cetak Struk?</h3>
            <p className="text-slate-500 font-medium mb-8 text-sm leading-relaxed">
                Pesanan berhasil disimpan. Apakah Anda ingin mencetak struk transaksi sekarang?
            </p>

            <div className="flex gap-3">
                <button 
                    onClick={() => setShowPrintModal(false)} 
                    className="flex-1 py-4 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all text-sm"
                >
                    Nanti Saja
                </button>
                <button 
                    onClick={confirmPrint} 
                    className="flex-1 py-4 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all text-sm flex items-center justify-center gap-2"
                >
                    <Printer size={18} />
                    <span>Cetak</span>
                </button>
            </div>

          </div>
        </div>
      )}

      {/* --- FOOTER PAGINATION & LIMIT --- */}
            <div className="flex flex-col md:flex-row items-center justify-between mt-6 px-2 gap-4">
                
                {/* BAGIAN KIRI: Dropdown Limit & Info Data */}
                <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span className="font-medium">Tampilkan</span>
                    <select 
                        value={itemsPerPage} 
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="bg-white border border-slate-200 rounded-lg py-1 px-2 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                    <span className="font-medium">
                        dari <strong>{filteredOrders.length}</strong> data
                    </span>
                </div>

                {/* BAGIAN KANAN: Tombol Next/Prev */}
                {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        {/* Tombol Previous */}
                        <button 
                            onClick={() => paginate(currentPage - 1)} 
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-slate-600"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        {/* Angka Halaman (Smart Display) */}
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => {
                                // Logika biar angka halaman tidak terlalu panjang jika halamannya banyak
                                if (i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)) {
                                    return (
                                        <button
                                            key={i + 1}
                                            onClick={() => paginate(i + 1)}
                                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                                currentPage === i + 1 
                                                ? 'bg-slate-800 text-white shadow-lg shadow-slate-200' 
                                                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    );
                                } else if (i + 1 === currentPage - 2 || i + 1 === currentPage + 2) {
                                    return <span key={i} className="text-slate-400 text-xs px-1">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        {/* Tombol Next */}
                        <button 
                            onClick={() => paginate(currentPage + 1)} 
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-slate-600"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>

    </main>
  );
}