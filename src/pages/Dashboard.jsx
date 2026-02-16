import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Smartphone, BarChart3, Package, Users, Store, Search, Zap, Plus, 
    TrendingDown, Globe, Bell, AlertCircle 
} from 'lucide-react';
import { useData } from '../context/DataContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const { services, stockLogs, lowStockItems, loadingData } = useData();
    const [searchTerm, setSearchTerm] = useState('');

    const totalOmzet = services
        .filter(s => s.status === 'Done')
        .reduce((acc, curr) => acc + (Number(curr.estimated_cost) || 0), 0);

    const features = [
        { id: 'servis', path: '/services', icon: <Smartphone />, title: "Layanan servis", color: "bg-blue-600", desc: "Kelola antrean unit" },
        { id: 'stok', path: '/stock', icon: <Package />, title: "Stok barang", color: "bg-indigo-600", desc: "Sparepart & inventori" },
        { id: 'laporan', path: '/finance', icon: <BarChart3 />, title: "Laporan keuangan", color: "bg-emerald-500", desc: "Analisis laba rugi" },
        { id: 'hrd', path: '/hrd', icon: <Users />, title: "Profit share", color: "bg-violet-600", desc: "Gaji & komisi teknisi" },
        { id: 'expenses', path: '/expenses', title: 'Pengeluaran Toko', desc: 'Catat biaya operasional harian', icon: <TrendingDown />, color: 'bg-rose-500' },
        { id: 'public-store', path: '/public-store', title: 'Katalog Publik', desc: 'Tampilan produk untuk konsumen', icon: <Globe />, color: 'bg-blue-600' },
        { id: 'toko', path: '/store-admin', icon: <Store />, title: "Admin Cabang", color: "bg-emerald-600", desc: "Kelola stok & harga global" },
        { id: 'tracking', path: '/tracking', icon: <Search />, title: "Tracking", color: "bg-orange-500", desc: "Cek status pelanggan" }
    ];

    if (loadingData) return <div className="p-10 text-center">Loading Dashboard data...</div>;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight italic">ServixPro <span className="text-blue-600">V4.0</span></h1>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Sistem Manajemen Servis & Inventaris</p>
                    </div>
                    <button onClick={() => navigate('/services/new')} className="bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-3">
                        <Plus size={18} strokeWidth={3} /> Input Servis Baru
                    </button>
                </div>
            </header>

            <div className="mb-8 relative shadow-sm">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                    type="text" 
                    placeholder="Cari nota, unit, atau nama pelanggan..." 
                    className="w-full bg-white border-2 border-slate-50 rounded-[1.5rem] py-5 pl-16 pr-6 text-sm font-bold outline-none focus:border-blue-500 transition-all" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/services?search=${searchTerm}`)}
                />
            </div>

            <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="relative z-10">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><BarChart3 size={14} className="text-blue-400" /> Akumulasi pemasukan hari ini</p>
                    <h2 className="text-5xl font-black tracking-tighter">Rp {totalOmzet.toLocaleString('id-ID')}</h2>
                    <div className="flex gap-4 mt-6">
                        <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/5 text-[10px] font-bold">Total {services.length} Unit</div>
                        <div className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/20 text-[10px] font-bold">Selesai: {services.filter(s => s.status === 'Done').length}</div>
                    </div>
                </div>
                <button onClick={() => navigate('/services')} className="relative z-10 bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-xs shadow-xl shadow-blue-900/20 active:scale-95 hover:bg-blue-500 transition-all uppercase tracking-widest">Lihat Semua Antrean</button>
                <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12"><Zap size={240} fill="white" /></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((f, i) => (
                    <div key={i} onClick={() => navigate(f.path)} className="bg-white p-7 rounded-[2rem] border border-slate-100 hover:border-blue-500 transition-all cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
                        <div className={`${f.color} w-14 h-14 rounded-2xl text-white flex items-center justify-center mb-6 shadow-lg shadow-blue-100 transition-transform group-hover:scale-110`}>{f.icon}</div>
                        <h3 className="font-bold text-slate-800 mb-1">{f.title}</h3>
                        <p className="text-[11px] font-medium text-slate-400 leading-relaxed">{f.desc}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Bell size={14} className="text-orange-500" /> Aktivitas operasional</h3>
                    <div className="space-y-4">
                        {stockLogs.length > 0 ? stockLogs.slice(0, 5).map((log, idx) => (
                            <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${log.type === 'Keluar' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>{log.type === 'Keluar' ? '-' : '+'}</div>
                                    <div><p className="text-xs font-bold text-slate-700">{log.spareparts?.name}</p><p className="text-[9px] text-slate-400 font-medium">{log.notes || 'Perubahan stok manual'}</p></div>
                                </div>
                                <p className="text-[10px] font-bold text-slate-300">{new Date(log.created_at).toLocaleTimeString()}</p>
                            </div>
                        )) : <p className="text-xs text-slate-400 italic text-center py-4">Belum ada riwayat mutasi barang.</p>}
                    </div>
                </div>

                <div className="bg-rose-50 p-8 rounded-[2rem] border border-rose-100/50">
                    <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-6 flex items-center gap-2"><AlertCircle size={14} className="text-rose-500" /> Stok Barang Menipis</h3>
                    <div className="space-y-4">
                        {lowStockItems.length > 0 ? lowStockItems.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between py-3 border-b border-rose-100/30 last:border-0">
                                <div className="flex items-center gap-4"><div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[10px] font-bold text-rose-600 shadow-sm">{item.quantity}</div><p className="text-xs font-bold text-rose-800">{item.name}</p></div>
                                <button onClick={() => navigate('/stock')} className="text-[9px] font-bold text-rose-500 uppercase hover:underline">Restock</button>
                            </div>
                        )) : <div className="py-6 text-center"><p className="text-xs text-rose-400 italic font-medium">Stok inventori masih aman.</p></div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
