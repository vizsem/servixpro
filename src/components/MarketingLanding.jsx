import React from 'react';
import {
    Zap, Smartphone, Package, BarChart3, Users,
    Search, Globe, TrendingDown, Check, ArrowRight,
    ShieldCheck, Clock, MessageSquare, Star,
    Store, Layout, ChevronRight
} from 'lucide-react';

const MarketingLanding = ({ onLogin, onTrack, onCatalog }) => {
    const features = [
        { title: "Dashboard Omzet", icon: <BarChart3 />, desc: "Pantau pendapatan harian dan bulanan secara real-time dengan grafik yang interaktif." },
        { title: "Kelola Stok Cabang", icon: <Package />, desc: "Kontrol inventori antar cabang dengan mudah. Sistem mutasi stok yang transparan." },
        { title: "Katalog Publik", icon: <Globe />, desc: "Berikan pelanggan link katalog produk Anda. Cek stok dan harga tanpa harus bertanya." },
        { title: "Tracking Servis", icon: <Search />, desc: "Pelanggan bisa cek status servis unit mereka secara mandiri via nomor nota/WhatsApp." },
        { title: "Profit Share", icon: <Users />, desc: "Hitung komisi teknisi secara otomatis berdasarkan bagi hasil yang Anda tentukan." },
        { title: "Biaya Operasional", icon: <TrendingDown />, desc: "Catat pengeluaran toko mulai dari listrik, sewa, hingga alat agar profit terpantau." },
        { title: "Multi-Sparepart", icon: <Layout />, desc: "Input banyak sparepart dalam satu nota servis. Stok otomatis berkurang sistematis." },
        { title: "WhatsApp Invoice", icon: <MessageSquare />, desc: "Kirim nota digital ke pelanggan dalam satu klik via WhatsApp. Hemat kertas & profesional." }
    ];

    const stores = [
        { name: "iFixit Solo", owner: "Andi Saputra", products: "iPhone 13, iPad Pro, Macbook Air", rating: 4.9 },
        { name: "Global Cell", owner: "Budi Jaya", products: "Samsung S23, Xiaomi 13T, Oppo Reno", rating: 4.8 },
        { name: "Bintang Servis", owner: "Siska Putri", products: "LCD Original, Baterai High Cap, IC Power", rating: 5.0 }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-700">

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/70 backdrop-blur-xl border-b border-white px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <Zap size={20} fill="currentColor" />
                        </div>
                        <h1 className="text-xl font-black tracking-tighter italic">SERVIX<span className="text-blue-600">PRO</span></h1>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-400">
                        <a href="#fitur" className="hover:text-blue-600 transition-colors">Fitur</a>
                        <a href="#harga" className="hover:text-blue-600 transition-colors">Harga</a>
                        <a href="#testimoni" className="hover:text-blue-600 transition-colors">Toko</a>
                    </div>
                    <button
                        onClick={onLogin}
                        className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95"
                    >
                        Mulai Sekarang
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 animate-bounce">
                        <Star size={14} fill="currentColor" /> Gratis 6 Bulan Pertama
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95] mb-8 bg-gradient-to-b from-slate-900 to-slate-700 bg-clip-text text-transparent italic">
                        KELOLA TOKO SERVIS <br /> DENGAN <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">SISTEM KELAS PRO.</span>
                    </h2>
                    <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
                        Dari pantau omzet hingga bagi hasil teknisi, ServixPro membantu ribuan pemilik toko servis handphone & gadget mengelola bisnis mereka secara otomatis.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={onLogin}
                            className="w-full md:w-auto bg-blue-600 text-white px-10 py-5 rounded-[2rem] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95"
                        >
                            Daftar Jadi Admin <ArrowRight size={18} />
                        </button>
                        <div className="flex gap-4">
                            <button
                                onClick={onTrack}
                                className="bg-white border-2 border-slate-100 text-slate-800 px-8 py-5 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all"
                            >
                                Lacak Servis
                            </button>
                            <button
                                onClick={onCatalog}
                                className="bg-white border-2 border-slate-100 text-slate-800 px-8 py-5 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all"
                            >
                                Cek Katalog
                            </button>
                        </div>
                    </div>
                </div>

                {/* Backdrop Ornaments */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-blue-400/10 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-400/10 blur-[100px] rounded-full"></div>
            </section>

            {/* Trust Section */}
            <section className="bg-white py-14 border-y border-slate-100 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-8">Dipercaya oleh pemilik toko di seluruh Indonesia</p>
                    <div className="flex flex-wrap justify-center gap-10 md:gap-20 opacity-30 grayscale contrast-125">
                        <div className="font-black text-2xl italic">APPLEFIX</div>
                        <div className="font-black text-2xl italic">GALAXYCENTRE</div>
                        <div className="font-black text-2xl italic">MACEPERT</div>
                        <div className="font-black text-2xl italic">DOKTERHP</div>
                        <div className="font-black text-2xl italic">GADGETLAB</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="fitur" className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Fitur Unggulan</h3>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic">EKOSISTEM BISNIS YANG <br /> <span className="text-blue-600">SANGAT LENGKAP.</span></h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((f, i) => (
                            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-blue-500 transition-all group shadow-sm hover:shadow-2xl hover:shadow-blue-500/5">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                    {f.icon}
                                </div>
                                <h4 className="text-lg font-black text-slate-800 mb-2">{f.title}</h4>
                                <p className="text-sm text-slate-400 font-medium leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Showcase Section */}
            <section id="testimoni" className="py-32 bg-slate-900 rounded-[3rem] md:rounded-[5rem] mx-4 md:mx-6 text-white overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.4em] mb-4">E-Katalog Showcase</h3>
                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-8 italic">PUNYA WEBSITE TOKO <br /> <span className="text-blue-400">TANPA RIBET.</span></h2>
                            <p className="text-slate-400 text-lg font-medium mb-12 leading-relaxed">
                                Setiap akun mendapatkan link katalog publik otomatis. Pelanggan bisa cek harga LCD, baterai, atau part lainnya dari smartphone mereka sendiri.
                            </p>
                            <div className="space-y-6">
                                {stores.map((s, i) => (
                                    <div key={i} className="flex gap-5 items-center bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-default">
                                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-black italic shadow-lg shadow-blue-500/20 text-xs tracking-tighter">S{i + 1}</div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h5 className="font-black text-sm">{s.name}</h5>
                                                <div className="flex items-center gap-1 text-orange-400 text-[10px]">
                                                    <Star size={10} fill="currentColor" /> {s.rating}
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Owner: {s.owner}</p>
                                        </div>
                                        <div className="ml-auto hidden md:block">
                                            <div className="text-[10px] text-emerald-400 font-black uppercase tracking-tighter bg-emerald-400/10 px-3 py-1 rounded-full">Active Store</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative flex justify-center">
                            <div className="w-full max-w-sm aspect-[9/16] bg-slate-800 rounded-[3rem] border-[10px] border-slate-700 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative group">
                                <div className="absolute top-0 inset-x-0 h-10 bg-slate-700 flex items-center justify-center">
                                    <div className="w-20 h-4 bg-slate-900 rounded-full"></div>
                                </div>
                                <div className="p-6 pt-14 h-full bg-slate-50">
                                    <div className="w-10 h-10 bg-blue-600 rounded-lg mb-4"></div>
                                    <div className="w-3/4 h-6 bg-slate-200 rounded mb-2"></div>
                                    <div className="w-1/2 h-4 bg-slate-100 rounded mb-8"></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[1, 2, 3, 4].map(n => (
                                            <div key={n} className="aspect-square bg-white rounded-2xl border border-slate-100 p-2">
                                                <div className="w-full h-2/3 bg-slate-50 rounded-lg mb-2"></div>
                                                <div className="w-full h-2 bg-slate-100 rounded mb-1"></div>
                                                <div className="w-1/2 h-2 bg-blue-100 rounded"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-slate-900 to-transparent pt-20">
                                    <div className="w-full bg-blue-600 py-3 rounded-xl text-center text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-500 transition-all">Tanya Admin</div>
                                </div>
                            </div>

                            {/* Floatings */}
                            <div className="absolute -right-8 top-1/4 bg-white text-slate-900 p-4 rounded-[1.5rem] shadow-2xl animate-bounce duration-[3s] hidden lg:block">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">New Inquiry</p>
                                <p className="text-xs font-black">"Stok LCD iP 11 ADA?"</p>
                            </div>
                            <div className="absolute -left-12 bottom-1/4 bg-emerald-500 text-white p-4 rounded-[1.5rem] shadow-2xl animate-pulse duration-[2s] hidden lg:block">
                                <p className="text-[9px] font-black opacity-70 uppercase tracking-widest mb-1">Success Transaction</p>
                                <p className="text-xs font-black">RP 750,000 RECEIVED</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/20 blur-[150px] rounded-full"></div>
            </section>

            {/* Pricing Section */}
            <section id="harga" className="py-32 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Investasi Bisnis</h3>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-8 italic">HARGA TERJANGKAU <br /> <span className="text-blue-600">UNTUK SEMUA LEVEL.</span></h2>

                    <div className="bg-emerald-50 text-emerald-600 inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-16 border border-emerald-100">
                        <ShieldCheck size={16} /> Promo: Gratis Sampai 6 Bulan Ke Depan!
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Monthly */}
                        <div className="bg-white p-12 rounded-[3rem] border border-slate-100 hover:border-slate-200 transition-all text-left group">
                            <h4 className="text-xl font-black text-slate-800 mb-2">Paket Bulanan</h4>
                            <p className="text-slate-400 text-sm mb-10 font-medium leading-relaxed">Fleksibel untuk toko yang baru memulai go-digital.</p>
                            <div className="flex items-end gap-1 mb-10">
                                <span className="text-4xl font-black text-slate-900 tracking-tighter">Rp 49.000</span>
                                <span className="text-slate-400 text-sm font-bold mb-1 italic">/ bulan</span>
                            </div>
                            <ul className="space-y-4 mb-12">
                                {["Semua Fitur Admin", "Unlimited Nota Servis", "Katalog Web Aktif", "Tracking Status Aktif"].map((item, idx) => (
                                    <li key={idx} className="flex gap-3 items-center text-xs font-bold text-slate-500">
                                        <Check size={16} className="text-emerald-500" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={onLogin} className="w-full bg-slate-900 text-white py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-100">
                                Mulai Gratis 6 Bulan <ChevronRight size={14} />
                            </button>
                        </div>

                        {/* Yearly */}
                        <div className="bg-blue-600 p-12 rounded-[3rem] text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 bg-blue-500 px-6 py-2 rounded-bl-3xl text-[9px] font-black uppercase tracking-widest">Paling Hemat</div>
                            <h4 className="text-xl font-black mb-2">Paket Tahunan</h4>
                            <p className="text-blue-100 text-sm mb-10 font-medium leading-relaxed">Investasi terbaik untuk pertumbuhan toko jangka panjang.</p>
                            <div className="flex items-end gap-1 mb-10">
                                <span className="text-4xl font-black text-white tracking-tighter">Rp 499.000</span>
                                <span className="text-blue-200 text-sm font-bold mb-1 italic">/ tahun</span>
                            </div>
                            <ul className="space-y-4 mb-12">
                                {["Semua Fitur Bulanan", "Hemat Biaya 15%", "Support Prioritas", "Grup Eksklusif Owner"].map((item, idx) => (
                                    <li key={idx} className="flex gap-3 items-center text-xs font-bold text-blue-100">
                                        <Check size={16} className="text-white" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={onLogin} className="w-full bg-white text-blue-600 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-50 transition-all active:scale-95 shadow-xl shadow-blue-800/10">
                                Pilih Tahunan <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto bg-slate-100 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none mb-8 italic">TUNGGU APA LAGI? <br /> <span className="text-blue-600">JOIN SERVIXPRO SEKARANG.</span></h2>
                        <p className="text-slate-500 text-lg font-medium mb-12 max-w-xl mx-auto leading-relaxed">
                            Ribuan nota telah diproses. Ratusan juta omzet telah tercatat. Giliran toko Anda yang menjadi lebih profesional.
                        </p>
                        <button
                            onClick={onLogin}
                            className="bg-blue-600 text-white px-12 py-6 rounded-[2rem] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 mx-auto"
                        >
                            Mulai Pakai Sekarang <Zap size={18} fill="currentColor" />
                        </button>
                    </div>
                    <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-4 border-blue-500/5 rounded-full"></div>
                    <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full"></div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-slate-100">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                            <Zap size={16} fill="currentColor" />
                        </div>
                        <h1 className="text-lg font-black tracking-tighter italic">SERVIX<span className="text-blue-600">PRO</span></h1>
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">&copy; 2026 SERVIXPRO MANAJEMEN. ALL RIGHTS RESERVED.</p>
                    <div className="flex gap-6 text-slate-400">
                        <button onClick={onCatalog} title="Lihat Katalog" className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
                            <Store size={18} />
                        </button>
                        <button onClick={onTrack} title="Lacak Status Servis" className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
                            <Clock size={18} />
                        </button>
                        <a href="https://wa.me/628123456789" target="_blank" rel="noopener noreferrer" title="Hubungi WhatsApp Admin" className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
                            <Smartphone size={18} />
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MarketingLanding;
