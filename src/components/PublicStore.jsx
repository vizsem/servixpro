import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
    Search, MapPin, Smartphone, ShoppingCart,
    ChevronRight, ArrowLeft, Loader2, Globe, Tag
} from 'lucide-react';

const PublicStore = ({ onBack }) => {
    const [products, setProducts] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');

    useEffect(() => {
        fetchPublicData();
    }, []);

    const fetchPublicData = async () => {
        try {
            setLoading(true);
            // Fetch data for the public view
            // In a real app, you might filter by a specific store ID from the URL
            const { data: prodData } = await supabase.from('spareparts').select('*').order('name');
            const { data: invData } = await supabase.from('location_inventory').select('*, locations(*)');
            const { data: locData } = await supabase.from('locations').select('*');

            setProducts(prodData || []);
            setInventory(invData || []);
            setLocations(locData || []);
        } catch (error) {
            console.error("Error fetching public data:", error);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['Semua', ...new Set(products.map(p => p.category))];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="animate-spin text-blue-600 mb-4 mx-auto" size={40} />
                <p className="text-slate-500 font-bold animate-pulse">Menyiapkan Katalog...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            {/* Navbar Publik */}
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 px-6 py-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                                <Globe className="text-blue-600" size={18} /> E-KATALOG <span className="text-blue-600">SERVIXPRO</span>
                            </h1>
                        </div>
                    </div>
                    <a
                        href="https://wa.me/628123456789"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all border border-emerald-100"
                    >
                        <Smartphone size={14} /> Tanya Admin
                    </a>
                </div>
            </nav>

            {/* Hero & Search */}
            <header className="bg-white border-b border-slate-100 px-6 py-12 md:py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter">
                        Cari Sparepart Gadget <br className="hidden md:block" /> <span className="text-blue-600">Cepat & Transparan.</span>
                    </h2>
                    <p className="text-slate-500 font-medium mb-10 max-w-xl mx-auto leading-relaxed">
                        Cek ketersediaan stok dan harga jasa pemasangan sparepart secara real-time di seluruh cabang toko kami.
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                        <div className="flex-1 relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                type="text"
                                placeholder="Cari LCD, Baterai, atau Konektor..."
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[1.5rem] py-4 pl-14 pr-6 text-sm font-bold outline-none transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] text-sm font-black outline-none shadow-xl shadow-slate-200"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>
            </header>

            {/* Product List */}
            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProducts.map(prod => {
                        const prodInventory = inventory.filter(i => i.product_id === prod.id);
                        const totalStock = prodInventory.reduce((acc, curr) => acc + curr.quantity, 0);

                        return (
                            <div key={prod.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100 transition-transform group-hover:scale-110 ${prod.category === 'LCD' ? 'bg-blue-600' :
                                            prod.category === 'Baterai' ? 'bg-emerald-500' : 'bg-slate-800'
                                        }`}>
                                        {prod.category === 'LCD' ? <Smartphone size={24} /> : <ShoppingCart size={24} />}
                                    </div>
                                    <span className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest">
                                        {prod.category}
                                    </span>
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight uppercase group-hover:text-blue-600 transition-colors">
                                        {prod.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mb-6">
                                        <Tag size={12} className="text-slate-300" />
                                        <p className="text-2xl font-black text-slate-900 tracking-tighter">
                                            Rp {prod.price_sell.toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Stock by Location */}
                                    <div className="space-y-3 mb-8">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ketersediaan Stok</p>
                                        {prodInventory.map(inv => (
                                            <div key={inv.location_id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={12} className={inv.quantity > 0 ? 'text-blue-500' : 'text-slate-300'} />
                                                    <span className={`text-[11px] font-bold ${inv.quantity > 0 ? 'text-slate-700' : 'text-slate-300'}`}>
                                                        {inv.locations?.name}
                                                    </span>
                                                </div>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${inv.quantity > 5 ? 'bg-emerald-50 text-emerald-600' :
                                                        inv.quantity > 0 ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-300'
                                                    }`}>
                                                    {inv.quantity > 0 ? `${inv.quantity} Ready` : 'Habis'}
                                                </span>
                                            </div>
                                        ))}
                                        {prodInventory.length === 0 && (
                                            <p className="text-[11px] text-slate-300 italic">Belum ada stok barang ini.</p>
                                        )}
                                    </div>
                                </div>

                                <a
                                    href={`https://wa.me/628123456789?text=Halo ServixPro, saya ingin tanya ketersediaan ${prod.name} seharga Rp ${prod.price_sell.toLocaleString()}.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-xl shadow-slate-100 group-hover:shadow-blue-100"
                                >
                                    Tanya Pasang <ChevronRight size={14} />
                                </a>
                            </div>
                        );
                    })}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Search size={40} />
                        </div>
                        <p className="text-slate-400 font-bold">Maaf, produk tidak ditemukan.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedCategory('Semua'); }}
                            className="mt-4 text-blue-600 text-sm font-black uppercase hover:underline"
                        >
                            Reset Pencarian
                        </button>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="max-w-6xl mx-auto px-6 py-10 border-t border-slate-100 mt-20 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                    Powered by ServixPro &copy; 2026
                </p>
            </footer>
        </div>
    );
};

export default PublicStore;
