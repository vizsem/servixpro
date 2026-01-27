import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; 
import { 
  Smartphone, BarChart3, Package, Users, Store, 
  LayoutGrid, Search, Zap, Plus, LogOut, Key, 
  Clock, Trash2, X, ChevronRight, ArrowLeft,
  CheckCircle2, RefreshCw, Bell
} from 'lucide-react';

// Import Komponen
import AddServiceForm from './components/AddServiceForm';
import StockManagement from './components/StockManagement';
import FinanceReport from './components/FinanceReport';
import TrackingServis from './components/TrackingServis';
import HRDManagement from './components/HRDManagement';
import StoreKatalog from './components/StoreKatalog';

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [services, setServices] = useState([]);
  const [stockLogs, setStockLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // --- STATE BARU UNTUK TRIAL & SUBSCRIPTION ---
  const [profile, setProfile] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Inisialisasi Auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if(session) {
        fetchAllData(session.user.id);
        fetchUserProfile(session.user.id); // Cek masa aktif trial
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if(session) {
        fetchAllData(session.user.id);
        fetchUserProfile(session.user.id);
      } else {
        setServices([]);
        setStockLogs([]);
        setProfile(null);
        setIsExpired(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fungsi ambil profil untuk cek trial
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setProfile(data);
        const expiryDate = new Date(data.subscription_ends_at);
        const now = new Date();
        if (now > expiryDate) {
          setIsExpired(true);
        }
      }
    } catch (err) {
      console.error("Trial check error:", err);
    }
  };

  // Fungsi ambil semua data terpusat
  const fetchAllData = async (userId) => {
    const { data: sData } = await supabase
      .from('services')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (sData) setServices(sData);

    const { data: lData } = await supabase
      .from('stock_logs')
      .select('*, spareparts(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    if (lData) setStockLogs(lData);
  };

  const updateStatus = async (id, currentStatus) => {
    const statusSequence = ['Pending', 'Checking', 'Working', 'Done'];
    const nextStatus = statusSequence[statusSequence.indexOf(currentStatus) + 1];

    if (nextStatus) {
      const { error } = await supabase.from('services').update({ status: nextStatus }).eq('id', id);
      if (!error) fetchAllData(session.user.id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveModule('dashboard');
    setShowAuthScreen(false);
  };

  const totalOmzet = services
    .filter(s => s.status === 'Done')
    .reduce((acc, curr) => acc + (Number(curr.estimated_cost) || 0), 0);

  const filteredServices = services.filter(s => 
    s.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.unit_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const features = [
    { id: 'servis', icon: <Smartphone />, title: "Layanan servis", color: "bg-blue-600", desc: "Kelola antrean unit" },
    { id: 'stok', icon: <Package />, title: "Stok barang", color: "bg-indigo-600", desc: "Sparepart & inventori" },
    { id: 'laporan', icon: <BarChart3 />, title: "Laporan keuangan", color: "bg-slate-800", desc: "Analisis laba rugi" },
    { id: 'hrd', icon: <Users />, title: "Profit share", color: "bg-violet-600", desc: "Gaji & komisi teknisi" },
    { id: 'tracking', icon: <Search />, title: "Tracking", color: "bg-orange-500", desc: "Cek status pelanggan" },
    { id: 'toko', icon: <Store />, title: "E-katalog", color: "bg-emerald-600", desc: "Website etalase toko" }
  ];

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-sm font-bold text-slate-500">Menyinkronkan data...</p>
    </div>
  );

  // --- LAYAR PROTEKSI JIKA TRIAL HABIS ---
  if (session && isExpired) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center font-sans">
        <div className="w-full max-w-sm bg-white p-10 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Clock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Masa Trial Habis</h2>
          <p className="text-slate-500 text-xs font-medium mt-3 leading-relaxed">
            Masa percobaan 14 hari Anda telah berakhir. Silakan upgrade ke paket tahunan untuk terus menggunakan ServixPro.
          </p>
          <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Paket Pro Tahunan</p>
            <p className="text-2xl font-black text-slate-800 tracking-tighter">Rp 1.200.000<span className="text-xs text-slate-400 font-medium">/12 bln</span></p>
          </div>
          <button 
            onClick={() => window.open('https://wa.me/628123456789?text=Halo Admin, saya ingin upgrade ServixPro ke paket Tahunan', '_blank')}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold mt-6 shadow-lg shadow-blue-100 active:scale-95 transition-all text-xs uppercase tracking-widest"
          >
            Hubungi Admin / Upgrade
          </button>
          <button onClick={handleLogout} className="mt-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-slate-600 transition-colors">
            Keluar Akun
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100">
      
      {/* Login Screen Overlay */}
      {!session && showAuthScreen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-10 shadow-2xl relative animate-in zoom-in-95">
            <button onClick={() => setShowAuthScreen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X size={20}/></button>
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-blue-200">
              <Zap className="text-white fill-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-center mb-2 tracking-tight text-slate-800">Masuk sistem</h2>
            <p className="text-center text-slate-400 text-xs font-medium mb-8 leading-relaxed">Gunakan akun Google untuk sinkronisasi data seluruh cabang.</p>
            <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-3 hover:bg-slate-800 transition-all">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5 bg-white rounded-full p-0.5"/>
              Lanjutkan dengan Google
            </button>
          </div>
        </div>
      )}

      {/* Navigasi Samping / Bawah */}
      <nav className="fixed z-50 bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-8 py-4 flex justify-between items-center lg:top-0 lg:left-0 lg:bottom-0 lg:w-24 lg:flex-col lg:border-r lg:border-t-0 lg:px-0 lg:py-10 shadow-sm">
        <div className="hidden lg:flex mb-12 items-center justify-center w-12 h-12 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100"><Zap size={22} fill="currentColor" /></div>
        <div className="flex justify-between w-full lg:flex-col lg:gap-10 lg:items-center">
          <button onClick={() => setActiveModule('dashboard')} className={`flex flex-col items-center gap-1.5 ${activeModule === 'dashboard' ? 'text-blue-600' : 'text-slate-300'}`}><LayoutGrid size={24} /><span className="text-[9px] font-bold uppercase tracking-wider">Beranda</span></button>
          <button onClick={() => session ? setActiveModule('servis') : setShowAuthScreen(true)} className={`flex flex-col items-center gap-1.5 ${activeModule === 'servis' ? 'text-blue-600' : 'text-slate-300'}`}><Clock size={24} /><span className="text-[9px] font-bold uppercase tracking-wider">Antrean</span></button>
          <button onClick={() => session ? setActiveModule('add-form') : setShowAuthScreen(true)} className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100 active:scale-95 transition-all -mt-10 lg:mt-0">{session ? <Plus size={30} /> : <Key size={24} />}</button>
          <button onClick={() => setActiveModule('tracking')} className={`flex flex-col items-center gap-1.5 ${activeModule === 'tracking' ? 'text-blue-600' : 'text-slate-300'}`}><Search size={24} /><span className="text-[9px] font-bold uppercase tracking-wider">Cek</span></button>
          <button onClick={session ? handleLogout : () => setShowAuthScreen(true)} className="flex flex-col items-center gap-1.5 text-slate-300">{session ? <LogOut size={24} /> : <Users size={24} />}<span className="text-[9px] font-bold uppercase tracking-wider">Akun</span></button>
        </div>
      </nav>

      <div className="lg:ml-24 transition-all">
        {/* Header Atas */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-6 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">ServixPro <span className="text-blue-600 text-[10px] font-black bg-blue-50 px-2 py-1 rounded ml-1">V4.0</span></h1>
            </div>
            <div className="w-full md:max-w-md relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input type="text" placeholder="Cari nota, unit, atau nama pelanggan..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                    <BarChart3 size={14} className="text-blue-400"/> Akumulasi pemasukan hari ini
                  </p>
                  <h2 className="text-5xl font-black tracking-tighter">Rp {totalOmzet.toLocaleString('id-ID')}</h2>
                  <div className="flex gap-4 mt-6">
                    <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/5 text-[10px] font-bold">Total {services.length} Unit</div>
                    <div className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/20 text-[10px] font-bold">Selesai: {services.filter(s => s.status === 'Done').length}</div>
                    {profile && (
                      <div className="bg-amber-500/20 text-amber-400 px-4 py-2 rounded-xl border border-amber-500/20 text-[10px] font-bold">
                        {isExpired ? 'Trial Habis' : `Trial: ${Math.ceil((new Date(profile.subscription_ends_at) - new Date()) / (1000 * 60 * 60 * 24))} Hari lagi`}
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => session ? setActiveModule('add-form') : setShowAuthScreen(true)} className="relative z-10 bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-xs shadow-xl shadow-blue-900/20 active:scale-95 hover:bg-blue-500 transition-all uppercase tracking-widest">
                  Buat antrean baru
                </button>
                <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12"><Zap size={240} fill="white" /></div>
              </div>

              {/* Grid Menu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((f, i) => (
                  <div key={i} onClick={() => (session || f.id === 'tracking') ? setActiveModule(f.id) : setShowAuthScreen(true)} className="bg-white p-7 rounded-[2rem] border border-slate-100 hover:border-blue-500 transition-all cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
                    <div className={`${f.color} w-14 h-14 rounded-2xl text-white flex items-center justify-center mb-6 shadow-lg shadow-blue-100 transition-transform group-hover:scale-110`}>{f.icon}</div>
                    <h3 className="font-bold text-slate-800 mb-1">{f.title}</h3>
                    <p className="text-[11px] font-medium text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>

              {/* Log Aktivitas Terakhir */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Bell size={14} className="text-orange-500"/> Aktivitas operasional terbaru
                </h3>
                <div className="space-y-4">
                  {stockLogs.length > 0 ? stockLogs.map((log, idx) => (
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
                    <p className="text-xs text-slate-400 italic text-center py-4">Belum ada riwayat mutasi barang hari ini.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Render Modul Komponen */}
          {session && activeModule === 'servis' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800 tracking-tight"><Clock size={22} className="text-blue-600"/> Antrean Unit Masuk</h2>
                <button onClick={() => setActiveModule('dashboard')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"><ArrowLeft size={24}/></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredServices.map(s => (
                  <div key={s.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg w-fit uppercase tracking-tighter">Nota #{s.id?.slice(0, 8)}</span>
                        <h4 className="font-bold text-base text-slate-800">{s.unit_name}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Pemilik: <span className="text-slate-600 font-bold">{s.customer_name}</span></p>
                      </div>
                      <div className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${s.status === 'Done' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>{s.status}</div>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-2xl mb-6">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Keluhan Kerusakan</p>
                       <p className="text-xs text-slate-600 italic leading-relaxed">"{s.issue}"</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                       <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Estimasi Biaya</p>
                          <p className="text-lg font-black text-slate-800">Rp {Number(s.estimated_cost).toLocaleString()}</p>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => { if(confirm('Hapus unit ini?')) { supabase.from('services').delete().eq('id', s.id).then(() => fetchAllData(session.user.id)); }}} className="p-3 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={20}/></button>
                          {s.status !== 'Done' && (
                            <button onClick={() => updateStatus(s.id, s.status)} className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-slate-100">Update Status</button>
                          )}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {session && activeModule === 'add-form' && <AddServiceForm onComplete={() => fetchAllData(session.user.id)} onClose={() => setActiveModule('servis')} />}
          {session && activeModule === 'stok' && <StockManagement />}
          {session && activeModule === 'laporan' && <FinanceReport />}
          {session && activeModule === 'hrd' && <HRDManagement />}
          {session && activeModule === 'toko' && <StoreKatalog />}
          {activeModule === 'tracking' && <TrackingServis />}
          
        </main>
      </div>
    </div>
  );
};

export default App;