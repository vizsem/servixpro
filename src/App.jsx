import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import {
  Smartphone, BarChart3, Package, Users, Store,
  LayoutGrid, Search, Zap, Plus, LogOut, Key,
  Clock, Trash2, X, ChevronRight, ArrowLeft,
  CheckCircle2, RefreshCw, Bell, AlertCircle, TrendingDown, Printer, MapPin, Globe, Share2
} from 'lucide-react';

// Import Komponen
import AddServiceForm from './components/AddServiceForm';
import StockManagement from './components/StockManagement';
import FinanceReport from './components/FinanceReport';
import TrackingServis from './components/TrackingServis';
import ExpenseManagement from './components/ExpenseManagement';
import PublicStore from './components/PublicStore';
import HRDManagement from './components/HRDManagement';
import StoreKatalog from './components/StoreKatalog';
import Invoice from './components/Invoice';
import MarketingLanding from './components/MarketingLanding';

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [services, setServices] = useState([]);
  const [stockLogs, setStockLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [showPartPicker, setShowPartPicker] = useState(null); // Service ID for which we are picking parts
  const [inventory, setInventory] = useState([]);
  const [pickerSearch, setPickerSearch] = useState('');

  // Fungsi ambil semua data terpusat
  const fetchAllData = React.useCallback(async (userId) => {
    if (!userId) return;

    try {
      // 1. Ambil data utama: services, logs, low stock, dan inventory
      const [
        { data: sData },
        { data: lData },
        { data: lowStockData },
        { data: invData }
      ] = await Promise.all([
        supabase.from('services').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('stock_logs').select('*, spareparts(name)').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('location_inventory').select('*, spareparts!inner(name, user_id)').eq('spareparts.user_id', userId).lt('quantity', 5).limit(5),
        supabase.from('location_inventory').select('*, spareparts!inner(*), locations(*)').eq('spareparts.user_id', userId)
      ]);

      if (sData) setServices(sData);
      // Simpan log tanpa limit agar bisa di-filter per unit di UI
      if (lData) setStockLogs(lData);
      if (lowStockData) setLowStockItems(lowStockData.map(i => ({ name: i.spareparts?.name, quantity: i.quantity })));
      if (invData) setInventory(invData);
    } catch (error) {
      console.error("Error fetching data in parallel:", error.message);
    }
  }, []);

  const updateStatus = async (id, currentStatus) => {
    const statusSequence = ['Pending', 'Checking', 'Working', 'Done'];
    const nextStatus = statusSequence[statusSequence.indexOf(currentStatus) + 1];

    if (nextStatus) {
      const { error } = await supabase.from('services').update({ status: nextStatus }).eq('id', id);
      if (!error && session) fetchAllData(session.user.id);
    }
  };


  useEffect(() => {
    // 1. Inisialisasi Auth Terstruktur
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        if (initialSession) {
          fetchAllData(initialSession.user.id);
        }
      } catch (err) {
        console.error("Auth init error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // 2. Listener Perubahan Auth yang Lebih Robust
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth Event:", event);

      // Update session state
      setSession(currentSession);

      if (currentSession) {
        // Jika ada session baru, ambil data ulang
        fetchAllData(currentSession.user.id);
      } else if (event === 'SIGNED_OUT') {
        // Hanya kosongkan data jika benar-benar logout eksplisit
        setServices([]);
        setStockLogs([]);
        setActiveModule('dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchAllData]);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#katalog') setActiveModule('public-store');
      else if (hash === '#lacak') setActiveModule('tracking');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveModule('dashboard');
  };

  const totalOmzet = services
    .filter(s => s.status === 'Done')
    .reduce((acc, curr) => acc + (Number(curr.estimated_cost) || 0), 0);

  const filteredServices = services.filter(s => {
    const matchesSearch = s.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.unit_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const features = [
    { id: 'servis', icon: <Smartphone />, title: "Layanan servis", color: "bg-blue-600", desc: "Kelola antrean unit" },
    { id: 'stok', icon: <Package />, title: "Stok barang", color: "bg-indigo-600", desc: "Sparepart & inventori" },
    { id: 'laporan', icon: <BarChart3 />, title: "Laporan keuangan", color: "bg-emerald-500", desc: "Analisis laba rugi" },
    { id: 'hrd', icon: <Users />, title: "Profit share", color: "bg-violet-600", desc: "Gaji & komisi teknisi" },
    { id: 'expenses', title: 'Pengeluaran Toko', desc: 'Catat biaya operasional harian', icon: <TrendingDown />, color: 'bg-rose-500' },
    { id: 'public-store', title: 'Katalog Publik', desc: 'Tampilan produk untuk konsumen', icon: <Globe />, color: 'bg-blue-600' },
    { id: 'toko', icon: <Store />, title: "Admin Cabang", color: "bg-emerald-600", desc: "Kelola stok & harga global" },
    { id: 'tracking', icon: <Search />, title: "Tracking", color: "bg-orange-500", desc: "Cek status pelanggan" }
  ];

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-sm font-bold text-slate-500">Menyinkronkan data...</p>
    </div>
  );

  if (!session) {
    if (activeModule === 'tracking') return (
      <div className="min-h-screen bg-slate-50">
        <nav className="bg-white border-b p-4 flex items-center gap-3">
          <button onClick={() => setActiveModule('dashboard')} className="p-2 hover:bg-slate-100 rounded-xl"><ArrowLeft size={20} /></button>
          <span className="font-bold">Lacak Status</span>
        </nav>
        <TrackingServis />
      </div>
    );
    if (activeModule === 'public-store') return <PublicStore onBack={() => setActiveModule('dashboard')} />;

    return (
      <MarketingLanding
        onLogin={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
        onTrack={() => setActiveModule('tracking')}
        onCatalog={() => setActiveModule('public-store')}
      />
    );
  }

  // Handle Public Store separately
  if (activeModule === 'public-store') {
    return <PublicStore onBack={() => setActiveModule('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100">

      {/* Navigasi Samping / Bawah */}
      <nav className="fixed z-50 bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-8 py-4 flex justify-between items-center lg:top-0 lg:left-0 lg:bottom-0 lg:w-24 lg:flex-col lg:border-r lg:border-t-0 lg:px-0 lg:py-10 shadow-sm">
        <div className="hidden lg:flex mb-12 items-center justify-center w-12 h-12 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100"><Zap size={22} fill="currentColor" /></div>
        <div className="flex justify-between w-full lg:flex-col lg:gap-10 lg:items-center">
          <button onClick={() => setActiveModule('dashboard')} className={`flex flex-col items-center gap-1.5 ${activeModule === 'dashboard' ? 'text-blue-600' : 'text-slate-300'}`}><LayoutGrid size={24} /><span className="text-[9px] font-bold uppercase tracking-wider">Beranda</span></button>
          <button onClick={() => setActiveModule('servis')} className={`flex flex-col items-center gap-1.5 ${activeModule === 'servis' ? 'text-blue-600' : 'text-slate-300'}`}><Clock size={24} /><span className="text-[9px] font-bold uppercase tracking-wider">Antrean</span></button>
          <button onClick={() => setActiveModule('add-form')} className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100 active:scale-95 transition-all -mt-10 lg:mt-0"><Plus size={30} /></button>
          <button onClick={() => setActiveModule('tracking')} className={`flex flex-col items-center gap-1.5 ${activeModule === 'tracking' ? 'text-blue-600' : 'text-slate-300'}`}><Search size={24} /><span className="text-[9px] font-bold uppercase tracking-wider">Cek</span></button>
          <button onClick={handleLogout} className="flex flex-col items-center gap-1.5 text-slate-300"><LogOut size={24} /><span className="text-[9px] font-bold uppercase tracking-wider">Keluar</span></button>
        </div>
      </nav>

      <div className="lg:ml-24 transition-all">
        {/* Header Atas */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-6 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">ServixPro <span className="text-blue-600 text-[10px] font-black bg-blue-50 px-2 py-1 rounded ml-1">V4.0</span></h1>
            <div className="w-full md:max-w-2xl flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input type="text" placeholder="Cari nota, unit, atau nama pelanggan..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-500 outline-none focus:bg-white transition-all"
              >
                <option value="All">Semua Status</option>
                <option value="Pending">Pending</option>
                <option value="Checking">Checking</option>
                <option value="Working">Working</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-8 py-10 pb-32">
          {activeModule === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Ringkasan Omzet */}
              <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="relative z-10">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <BarChart3 size={14} className="text-blue-400" /> Akumulasi pemasukan hari ini
                  </p>
                  <h2 className="text-5xl font-black tracking-tighter">Rp {totalOmzet.toLocaleString('id-ID')}</h2>
                  <div className="flex gap-4 mt-6">
                    <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/5 text-[10px] font-bold">Total {services.length} Unit</div>
                    <div className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/20 text-[10px] font-bold">Selesai: {services.filter(s => s.status === 'Done').length}</div>
                  </div>
                </div>
                <button onClick={() => setActiveModule('add-form')} className="relative z-10 bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-xs shadow-xl shadow-blue-900/20 active:scale-95 hover:bg-blue-500 transition-all uppercase tracking-widest">
                  Buat antrean baru
                </button>
                <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12"><Zap size={240} fill="white" /></div>
              </div>

              {/* Grid Menu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((f, i) => (
                  <div key={i} onClick={() => setActiveModule(f.id)} className="bg-white p-7 rounded-[2rem] border border-slate-100 hover:border-blue-500 transition-all cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
                    <div className={`${f.color} w-14 h-14 rounded-2xl text-white flex items-center justify-center mb-6 shadow-lg shadow-blue-100 transition-transform group-hover:scale-110`}>{f.icon}</div>
                    <h3 className="font-bold text-slate-800 mb-1">{f.title}</h3>
                    <p className="text-[11px] font-medium text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>

              {/* Log & Warning Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Log Aktivitas Terakhir */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Bell size={14} className="text-orange-500" /> Aktivitas operasional
                  </h3>
                  <div className="space-y-4">
                    {stockLogs.length > 0 ? stockLogs.slice(0, 5).map((log, idx) => (
                      <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${log.type === 'Keluar' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {log.type === 'Keluar' ? '-' : '+'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700">{log.spareparts?.name}</p>
                            <p className="text-[9px] text-slate-400 font-medium">{log.notes || 'Perubahan stok manual'}</p>
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-300">{new Date(log.created_at).toLocaleTimeString()}</p>
                      </div>
                    )) : (
                      <p className="text-xs text-slate-400 italic text-center py-4">Belum ada riwayat mutasi barang.</p>
                    )}
                  </div>
                </div>

                {/* Warning Stok Menipis */}
                <div className="bg-rose-50 p-8 rounded-[2rem] border border-rose-100/50">
                  <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <AlertCircle size={14} className="text-rose-500" /> Stok Barang Menipis
                  </h3>
                  <div className="space-y-4">
                    {lowStockItems.length > 0 ? lowStockItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-3 border-b border-rose-100/30 last:border-0">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[10px] font-bold text-rose-600 shadow-sm">
                            {item.quantity}
                          </div>
                          <p className="text-xs font-bold text-rose-800">{item.name}</p>
                        </div>
                        <button onClick={() => setActiveModule('stok')} className="text-[9px] font-bold text-rose-500 uppercase hover:underline">Restock</button>
                      </div>
                    )) : (
                      <div className="py-6 text-center">
                        <p className="text-xs text-rose-400 italic font-medium">Stok inventori masih aman.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Render Modul Komponen */}
          {session && activeModule === 'servis' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800 tracking-tight"><Clock size={22} className="text-blue-600" /> Antrean Unit Masuk</h2>
                <button onClick={() => setActiveModule('dashboard')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"><ArrowLeft size={24} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredServices.map(s => (
                  <div key={s.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg w-fit uppercase tracking-tighter">Nota #{s.id?.slice(0, 8)}</span>
                        <h4 className="font-bold text-base text-slate-800">{s.unit_name}</h4>
                        <div className="flex gap-2 items-center">
                          <p className="text-[10px] text-slate-400 font-medium">Pemilik: <span className="text-slate-600 font-bold">{s.customer_name}</span></p>
                          <span className="text-[8px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">Teknisi: {s.technician_name || 'Umum'}</span>
                        </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${s.status === 'Done' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>{s.status}</div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl mb-6">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Keluhan Kerusakan</p>
                      <p className="text-xs text-slate-600 italic leading-relaxed">"{s.issue}"</p>

                      {/* Customer & IMEI/SN Info */}
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed mt-4">
                        {s.customer_name} • {s.customer_phone}
                        {s.imei_sn && <span className="block text-blue-500 italic mt-0.5">SN/IMEI: {s.imei_sn}</span>}
                      </p>

                      {/* Spareparts Section */}
                      <div className="mt-6 border-t border-slate-50 pt-6">
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suku Cadang Terpasang</p>
                          <button
                            onClick={() => setShowPartPicker(s)}
                            className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            + Tambah Part
                          </button>
                        </div>

                        <div className="space-y-2">
                          {/* We simulate linked parts via stock_logs with reference_invoice = service.id */}
                          {stockLogs.filter(log => log.reference_invoice === s.id).length > 0 ? (
                            stockLogs.filter(log => log.reference_invoice === s.id).map((log, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-slate-50/50 p-2 rounded-xl text-[10px] font-bold">
                                <span className="text-slate-600">{log.spareparts?.name} (x{log.quantity})</span>
                                <span className="text-slate-400">Rp {(log.price_at_transaction * log.quantity).toLocaleString()}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-[9px] text-slate-300 italic">Belum ada sparepart yang ditambahkan.</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-6">
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Estimasi Biaya</p>
                          <p className="text-lg font-black text-slate-800">Rp {Number(s.estimated_cost).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setActiveInvoice(s)} className="p-3 text-slate-300 hover:text-blue-500 transition-colors"><Printer size={20} /></button>
                          <button onClick={() => { if (confirm('Hapus unit ini?')) { supabase.from('services').delete().eq('id', s.id).then(() => session && fetchAllData(session.user.id)); } }} className="p-3 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={20} /></button>
                          {s.status !== 'Done' && (
                            <button onClick={() => updateStatus(s.id, s.status)} className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-slate-100">Update Status</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {session && activeModule === 'add-form' && <AddServiceForm onComplete={() => session && fetchAllData(session.user.id)} onClose={() => setActiveModule('servis')} />}
          {session && activeModule === 'stok' && <StockManagement />}
          {session && activeModule === 'laporan' && <FinanceReport />}
          {session && activeModule === 'hrd' && <HRDManagement />}
          {session && activeModule === 'expenses' && <ExpenseManagement />}
          {session && activeModule === 'toko' && <StoreKatalog />}
          {activeModule === 'tracking' && <TrackingServis />}

          {/* Part Picker Modal */}
          {
            showPartPicker && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl relative animate-in zoom-in-95">
                  <button onClick={() => setShowPartPicker(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X size={20} /></button>
                  <h2 className="text-2xl font-bold mb-8 tracking-tight text-slate-800">Pilih Sparepart</h2>
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                      type="text"
                      placeholder="Cari nama sparepart..."
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                  <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Group inventory by part name to show locations together */}
                    {Object.entries(inventory
                      .filter(item => item.spareparts?.name?.toLowerCase().includes(pickerSearch.toLowerCase()))
                      .reduce((acc, curr) => {
                        const name = curr.spareparts.name;
                        if (!acc[name]) acc[name] = [];
                        acc[name].push(curr);
                        return acc;
                      }, {})).map(([partName, variants]) => (
                        <div key={partName} className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{partName}</p>
                          <div className="space-y-2">
                            {variants.map((item) => (
                              <button
                                key={item.product_id + item.location_id}
                                disabled={item.quantity <= 0}
                                onClick={async () => {
                                  const { data: { session: currentSession } } = await supabase.auth.getSession();
                                  // 1. Kurangi Stok di Cabang Terpilih
                                  const { error: invErr } = await supabase.from('location_inventory').update({ quantity: item.quantity - 1 }).eq('product_id', item.product_id).eq('location_id', item.location_id);
                                  if (invErr) return alert(invErr.message);

                                  // 2. Catat Log dengan Cabang asal
                                  await supabase.from('stock_logs').insert([{
                                    user_id: currentSession.user.id,
                                    product_id: item.product_id,
                                    location_id: item.location_id,
                                    type: 'Keluar',
                                    quantity: 1,
                                    price_at_transaction: item.spareparts.price_sell,
                                    reference_invoice: showPartPicker.id,
                                    notes: `[TRANSFER] ${item.locations?.name || 'Cabang'} -> Servis: ${showPartPicker.unit_name}`
                                  }]);

                                  // 3. Update Biaya Servis
                                  const newCost = Number(showPartPicker.estimated_cost) + Number(item.spareparts.price_sell);
                                  await supabase.from('services').update({ estimated_cost: newCost }).eq('id', showPartPicker.id);

                                  setShowPartPicker(null);
                                  fetchAllData(currentSession.user.id);
                                }}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border-2 ${item.quantity > 0 ? 'bg-white border-transparent hover:border-blue-500 hover:shadow-lg' : 'bg-slate-100 border-transparent opacity-50 cursor-not-allowed'}`}
                              >
                                <div className="text-left">
                                  <p className="text-[10px] font-black text-slate-800 flex items-center gap-2">
                                    <MapPin size={10} className="text-blue-500" />
                                    {item.locations?.name || 'Toko Utama'}
                                  </p>
                                  <p className="text-[9px] text-slate-400 font-bold mt-1">Tersedia: {item.quantity} Unit</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-black text-blue-600">Rp {item.spareparts.price_sell.toLocaleString()}</p>
                                  {item.quantity > 0 && <p className="text-[8px] font-black text-blue-400 uppercase tracking-tighter mt-1">Ambil</p>}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    {inventory.length === 0 && (
                      <p className="text-center py-10 text-xs text-slate-400 italic">Data inventori belum tersedia.</p>
                    )}
                  </div>
                </div>
              </div>
            )
          }

          {/* Modal Invoice */}
          {
            activeInvoice && (
              <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
                <Invoice data={activeInvoice} onBack={() => setActiveInvoice(null)} />
              </div>
            )
          }

        </main>
      </div>
    </div>
  );
};

export default App;