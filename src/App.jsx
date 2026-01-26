import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase'; 
import { 
  Smartphone, BarChart3, Package, Users, Store, 
  Globe, Phone, ShieldCheck, ChevronRight, 
  LayoutGrid, Search, Zap, Plus, Info, UserCheck, Monitor, LogOut, Key, UserPlus, X, Clock, Trash2
} from 'lucide-react';

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // State Form
  const [formData, setFormData] = useState({
    customer_name: '', unit_name: '', issue: '', estimated_cost: ''
  });

  // --- LOGIC AUTH & DATA ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if(session) fetchServices(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if(session) fetchServices(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchServices = async (userId) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (!error) setServices(data);
  };

  const handleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (error) {
      alert("Terjadi kesalahan: " + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveModule('dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('services').insert([
      { ...formData, user_id: session.user.id, status: 'Pending' }
    ]);
    if (!error) {
      setShowModal(false);
      setFormData({ customer_name: '', unit_name: '', issue: '', estimated_cost: '' });
      fetchServices(session.user.id);
    }
  };

  const updateStatus = async (id, status) => {
    const nextStatus = status === 'Pending' ? 'Proses' : 'Selesai';
    await supabase.from('services').update({ status: nextStatus }).eq('id', id);
    fetchServices(session.user.id);
  };

  // Kalkulasi
  const totalLaba = services.reduce((acc, curr) => acc + (Number(curr.estimated_cost) || 0), 0);

  const features = [
    { id: 'servis', icon: <Smartphone className="w-6 h-6" />, title: "Manajemen Layanan Servis", color: "bg-blue-600", items: ["Rekap riwayat servis kendaraan/ponsel", "Pelacakan status servis online via website"] },
    { id: 'laporan', icon: <BarChart3 className="w-6 h-6" />, title: "Laporan & Administrasi", color: "bg-indigo-600", items: ["Laporan laba/rugi transaksi", "Penjualan spare part & aksesori", "Administrasi kasir & rekap harian"] },
    { id: 'stok', icon: <Package className="w-6 h-6" />, title: "Manajemen Persediaan", color: "bg-cyan-600", items: ["Stok spare part & aksesori", "Fitur stock reminder (pengingat stok)"] },
    { id: 'hrd', icon: <Users className="w-6 h-6" />, title: "Manajemen Sumber Daya", color: "bg-violet-600", items: ["Sistem profit share karyawan", "Perhitungan gaji otomatis"] },
    { id: 'toko', icon: <Store className="w-6 h-6" />, title: "Website Toko", color: "bg-emerald-600", items: ["Store Website (Toko Online)", "Landing page branding marketing"] },
    { id: 'support', icon: <Globe className="w-6 h-6" />, title: "Akses & Support", color: "bg-amber-600", items: ["Registrasi & login pengguna trial", "Tutorial & dukungan kontak admin"] }
  ];

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white font-bold tracking-widest gap-4">
      <Zap className="w-12 h-12 text-blue-400 animate-bounce fill-blue-400" />
      <p className="animate-pulse text-xs">SINKRONISASI CLOUD...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-28 lg:pb-10 font-sans text-slate-900 transition-all duration-300">
      
      {/* Header Premium */}
      <div className="bg-[#1E293B] pt-10 md:pt-16 pb-20 md:pb-28 px-6 rounded-b-[40px] md:rounded-b-[60px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50"></div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center relative z-10 gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
              <Zap className="w-4 h-4 text-blue-400 fill-blue-400" />
              <span className="text-blue-400 font-bold tracking-tighter text-[10px] uppercase italic">ServixPro Official</span>
            </div>
            <h1 className="text-white text-4xl md:text-5xl font-black tracking-tight italic" onClick={() => setActiveModule('dashboard')} style={{cursor:'pointer'}}>ServixPro</h1>
            {session ? (
              <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">{session.user.email}</p>
              </div>
            ) : <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">v4.0 Mode Pengunjung</p>}
          </div>

          <div className="w-full md:max-w-md flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input type="text" placeholder="Cari fitur atau cek unit..." className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none backdrop-blur-sm focus:bg-white/20 transition-all text-sm" />
            </div>
            {session ? (
                <button onClick={handleLogout} className="bg-rose-500/20 text-rose-400 p-4 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-lg flex items-center justify-center"><LogOut className="w-5 h-5" /></button>
            ) : (
                <button onClick={handleAuth} className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-xs hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center gap-2"><Key className="w-4 h-4" /> LOGIN</button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-5 -mt-10 relative z-20">
        
        {/* Banner Statistik / Promo */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-10 shadow-xl mb-10 flex flex-col md:flex-row items-center justify-between border border-blue-400/20 gap-6">
          <div className="text-white text-center md:text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">{session ? "DATABASE CLOUD AKTIF" : "AKSES TERBATAS"}</p>
            <h3 className="text-2xl font-bold mb-1">{session ? `Laba: Rp ${totalLaba.toLocaleString()}` : "Siap Upgrade Bisnis Anda?"}</h3>
            <p className="text-sm opacity-90 leading-tight">{session ? `Terdapat ${services.length} unit dalam antrean servis.` : "Daftar sekarang untuk sinkronisasi data HP & Laptop."}</p>
          </div>
          <button onClick={() => session ? setShowModal(true) : handleAuth()} className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-black text-sm shadow-lg active:scale-95 hover:bg-slate-50 transition-all flex items-center gap-2">
            {session ? <Plus className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            {session ? "TAMBAH SERVIS" : "DAFTAR SEKARANG"}
          </button>
        </div>

        {/* --- MODUL KONTEN --- */}
        {activeModule === 'servis' && session ? (
          <div className="mb-10 space-y-4 animate-in fade-in duration-500">
             <div className="flex items-center justify-between">
                <h2 className="font-black text-2xl text-slate-800 italic uppercase">Antrean Servis</h2>
                <button onClick={() => setActiveModule('dashboard')} className="text-xs font-bold text-blue-600 underline">Kembali</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map(s => (
                  <div key={s.id} className="bg-white p-6 rounded-[30px] border border-slate-200 shadow-sm flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-800">{s.unit_name}</h4>
                      <p className="text-[10px] text-slate-500 uppercase font-black">{s.customer_name} • {s.status}</p>
                    </div>
                    <button onClick={() => updateStatus(s.id, s.status)} className="bg-slate-100 px-4 py-2 rounded-xl text-[9px] font-bold hover:bg-blue-600 hover:text-white transition-all">UPDATE STATUS</button>
                  </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6 px-1">
              <h2 className="font-black text-2xl text-slate-800 tracking-tight italic uppercase">Modul Bisnis</h2>
              <div className="hidden md:flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest"><Monitor className="w-4 h-4" /> Real-time Sync</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div key={i} onClick={() => setActiveModule(f.id)} className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className={`${f.color} p-4 rounded-2xl text-white shadow-lg transform group-hover:rotate-6 transition-transform`}>{f.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 text-lg leading-tight mb-3">{f.title}</h3>
                      <ul className="space-y-2">
                        {f.items.map((item, idx) => (
                          <li key={idx} className="text-[12px] text-slate-500 flex items-start gap-2 leading-relaxed">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" /> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer info tetap ada */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 pb-10">
          <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl border border-slate-700">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3 text-blue-400"><Globe className="w-6 h-6" /><h3 className="text-xl font-bold italic uppercase tracking-tighter">Partner ServixPro</h3></div>
              <p className="text-sm text-slate-400 mb-6">Hubungi jaringan distributor RBM Borneo untuk token aktivasi.</p>
              <button className="w-full bg-slate-800 py-4 rounded-2xl text-xs font-black border border-slate-700 hover:bg-slate-700 transition-all uppercase tracking-widest">Hubungi Admin</button>
            </div>
          </div>
          <div className="bg-white rounded-[32px] p-8 border border-slate-200 flex flex-col justify-center shadow-sm">
            <div className="flex items-start gap-4 text-slate-500"><Info className="w-6 h-6 text-blue-600 flex-shrink-0" /><p className="text-xs leading-relaxed italic text-justify font-medium">Sistem database terpusat memastikan riwayat servis pelanggan tersimpan aman di cloud.</p></div>
          </div>
        </div>
      </main>

      {/* MODAL INPUT SERVIS */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400"><X /></button>
            <h2 className="text-xl font-black italic mb-6 uppercase">Input Unit Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Nama Pelanggan" className="w-full p-4 bg-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setFormData({...formData, customer_name: e.target.value})} />
              <input required placeholder="Tipe Unit (Contoh: iPhone 13)" className="w-full p-4 bg-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setFormData({...formData, unit_name: e.target.value})} />
              <textarea required placeholder="Kerusakan" className="w-full p-4 bg-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 h-24" onChange={e => setFormData({...formData, issue: e.target.value})} />
              <input required type="number" placeholder="Estimasi Biaya" className="w-full p-4 bg-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setFormData({...formData, estimated_cost: e.target.value})} />
              <button type="submit" className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-200">Simpan ke Cloud</button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-8 py-5 z-50 rounded-t-[30px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto flex justify-between items-center text-slate-400">
          <button onClick={() => setActiveModule('dashboard')} className={`flex flex-col items-center gap-1 font-bold uppercase text-[9px] ${activeModule === 'dashboard' ? 'text-blue-600' : ''}`}><LayoutGrid className="w-6 h-6" /> Menu</button>
          <button onClick={() => setActiveModule('servis')} className={`flex flex-col items-center gap-1 font-bold uppercase text-[9px] ${activeModule === 'servis' ? 'text-blue-600' : ''}`}><Clock className="w-6 h-6" /> Antrean</button>
          <div className="relative -mt-20">
            <button onClick={() => session ? setShowModal(true) : handleAuth()} className="w-16 h-16 bg-blue-600 rounded-[22px] flex items-center justify-center text-white shadow-2xl shadow-blue-400 border-[6px] border-[#F1F5F9] active:scale-90 transition-all">
              {session ? <Plus className="w-8 h-8" /> : <Key className="w-8 h-8" />}
            </button>
          </div>
          <button className="flex flex-col items-center gap-1 uppercase text-[9px] font-bold"><Store className="w-6 h-6" /> Toko</button>
          <button onClick={!session ? handleAuth : handleLogout} className={`flex flex-col items-center gap-1 uppercase text-[9px] font-bold ${session ? 'text-rose-500' : ''}`}>
            {session ? <LogOut className="w-6 h-6" /> : <Users className="w-6 h-6" />} {session ? 'Logout' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;