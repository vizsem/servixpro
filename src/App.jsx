import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase'; 
import { 
  Smartphone, BarChart3, Package, Users, Store, 
  Globe, Phone, ShieldCheck, ChevronRight, 
  LayoutGrid, Search, Zap, Plus, Info, UserCheck, Monitor, LogOut, Key, UserPlus
} from 'lucide-react';

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- LOGIC SUPABASE AUTH ---
  useEffect(() => {
    // Ambil sesi saat ini
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Pantau perubahan status auth secara real-time
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fungsi Login & Daftar (Dibuat lebih kuat untuk Vercel)
  const handleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          // Mendeteksi URL secara otomatis (localhost atau domain vercel)
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error("Auth Error:", error.message);
      alert("Terjadi kesalahan: " + error.message);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.signOut();
    if (error) alert(error.message);
  };

  const features = [
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Manajemen Layanan Servis",
      color: "bg-blue-600",
      items: ["Rekap riwayat servis kendaraan/ponsel", "Pelacakan status servis online via website"]
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Laporan & Administrasi",
      color: "bg-indigo-600",
      items: ["Laporan laba/rugi transaksi", "Penjualan spare part & aksesori", "Administrasi kasir & rekap harian"]
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: "Manajemen Persediaan",
      color: "bg-cyan-600",
      items: ["Stok spare part & aksesori", "Fitur stock reminder (pengingat stok)"]
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Manajemen Sumber Daya",
      color: "bg-violet-600",
      items: ["Sistem profit share karyawan", "Perhitungan gaji otomatis"]
    },
    {
      icon: <Store className="w-6 h-6" />,
      title: "Website Toko",
      color: "bg-emerald-600",
      items: ["Store Website (Toko Online)", "Landing page branding marketing"]
    },
    {
        icon: <Globe className="w-6 h-6" />,
        title: "Akses & Support",
        color: "bg-amber-600",
        items: ["Registrasi & login pengguna trial", "Tutorial & dukungan kontak admin"]
    }
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
            <h1 className="text-white text-4xl md:text-5xl font-black tracking-tight italic">ServixPro</h1>
            
            {session ? (
              <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">{session.user.email}</p>
              </div>
            ) : (
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">v4.0 Mode Pengunjung</p>
            )}
          </div>

          <div className="w-full md:max-w-md flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Cari fitur atau cek unit..." 
                className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none backdrop-blur-sm focus:bg-white/20 transition-all text-sm"
              />
            </div>
            
            {session ? (
                <button onClick={handleLogout} className="bg-rose-500/20 text-rose-400 p-4 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-lg flex items-center justify-center">
                    <LogOut className="w-5 h-5" />
                </button>
            ) : (
                <button onClick={handleAuth} className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-xs hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center gap-2">
                    <Key className="w-4 h-4" /> LOGIN
                </button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-5 -mt-10 relative z-20">
        
        {/* Banner Promo / Welcome */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-10 shadow-xl mb-10 flex flex-col md:flex-row items-center justify-between border border-blue-400/20 gap-6">
          <div className="text-white text-center md:text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">
                {session ? "Lisensi: Aktif Premium" : "Akses Database Cloud"}
            </p>
            <h3 className="text-2xl font-bold mb-1">
                {session ? `Selamat Datang, ${session.user.user_metadata.full_name || 'User'}` : "Siap Upgrade Bisnis Anda?"}
            </h3>
            <p className="text-sm opacity-90 leading-tight">
                {session ? "Kelola semua data servis dalam satu genggaman." : "Daftar sekarang untuk sinkronisasi data HP & Laptop secara otomatis."}
            </p>
          </div>
          
          {!session ? (
              <button onClick={handleAuth} className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-black text-sm shadow-lg active:scale-95 hover:bg-slate-50 transition-all flex items-center gap-2 whitespace-nowrap">
                <UserPlus className="w-5 h-5" />
                DAFTAR SEKARANG
              </button>
          ) : (
              <button className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-black text-sm shadow-lg active:scale-90 hover:bg-slate-50 transition-all flex items-center gap-2 uppercase">
                <BarChart3 className="w-5 h-5" />
                Dashboard Admin
              </button>
          )}
        </div>

        {/* List Fitur Utama */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="font-black text-2xl text-slate-800 tracking-tight italic uppercase">Modul Bisnis</h2>
            <div className="hidden md:flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                <Monitor className="w-4 h-4" /> Real-time Sync
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className={`${f.color} p-4 rounded-2xl text-white shadow-lg transform group-hover:rotate-6 transition-transform`}>
                    {f.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg leading-tight mb-3">{f.title}</h3>
                    <ul className="space-y-2">
                      {f.items.map((item, idx) => (
                        <li key={idx} className="text-[12px] text-slate-500 flex items-start gap-2 leading-relaxed">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 pb-10">
          <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl border border-slate-700">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3 text-blue-400">
                <Globe className="w-6 h-6" />
                <h3 className="text-xl font-bold italic uppercase tracking-tighter">Partner ServixPro</h3>
              </div>
              <p className="text-sm text-slate-400 mb-6">Hubungi jaringan distributor RBM Borneo untuk mendapatkan token aktivasi akun Anda.</p>
              <button className="w-full bg-slate-800 py-4 rounded-2xl text-xs font-black border border-slate-700 hover:bg-slate-700 transition-all uppercase tracking-widest">
                Hubungi Admin
              </button>
            </div>
          </div>
          <div className="bg-white rounded-[32px] p-8 border border-slate-200 flex flex-col justify-center shadow-sm">
            <div className="flex items-start gap-4 text-slate-500">
              <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <p className="text-xs leading-relaxed italic text-justify font-medium">
                Sistem database terpusat memastikan riwayat servis pelanggan tetap tersimpan aman selamanya di server cloud kami.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-8 py-5 z-50 rounded-t-[30px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto flex justify-between items-center text-slate-400">
          <button className="flex flex-col items-center gap-1 text-blue-600 font-bold uppercase text-[9px]">
            <LayoutGrid className="w-6 h-6" /> Menu
          </button>
          <button onClick={!session ? handleAuth : () => {}} className="flex flex-col items-center gap-1 uppercase text-[9px] font-bold">
            <Phone className="w-6 h-6" /> Admin
          </button>
          
          <div className="relative -mt-20">
            <button 
                onClick={!session ? handleAuth : () => {}}
                className="w-16 h-16 bg-blue-600 rounded-[22px] flex items-center justify-center text-white shadow-2xl shadow-blue-400 border-[6px] border-[#F1F5F9] active:scale-90 transition-all"
            >
              {!session ? <Key className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
            </button>
          </div>

          <button className="flex flex-col items-center gap-1 uppercase text-[9px] font-bold">
            <Store className="w-6 h-6" /> Toko
          </button>
          <button onClick={!session ? handleAuth : handleLogout} className={`flex flex-col items-center gap-1 uppercase text-[9px] font-bold ${session ? 'text-rose-500' : ''}`}>
            {session ? <LogOut className="w-6 h-6" /> : <Users className="w-6 h-6" />}
            {session ? 'Logout' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;