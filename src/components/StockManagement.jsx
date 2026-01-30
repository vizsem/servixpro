import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  Package, Plus, Minus, Search, MapPin,
  X, Loader2, Warehouse, History, FileSpreadsheet, AlertCircle, ShoppingCart
} from 'lucide-react';

const StockManagement = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [parts, setParts] = useState([]);
  const [logs, setLogs] = useState([]);

  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'LCD',
    price_buy: 0,
    price_sell: 0,
    initial_stock: 0
  });

  const isGudangPusat = selectedLocation?.type === 'Gudang' || selectedLocation?.name.toLowerCase().includes('pusat');

  const fetchPartsByLocation = React.useCallback(async (locId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Ambil Semua Produk di Katalog & Inventory di Lokasi ini secara paralel
      const [allPartsRes, localInvRes] = await Promise.all([
        supabase.from('spareparts').select('*').eq('user_id', session.user.id).order('name'),
        supabase.from('location_inventory').select('*').eq('location_id', locId)
      ]);

      if (allPartsRes.data) {
        const merged = allPartsRes.data.map(part => {
          const invEntry = localInvRes.data?.find(i => i.product_id === part.id);
          return {
            ...part,
            stock_at_location: invEntry ? invEntry.quantity : 0
          };
        });
        setParts(merged);
      }
    } catch (err) {
      console.error("Gagal sinkronisasi stok:", err.message);
    }
  }, []);

  const fetchStockLogs = React.useCallback(async (userId) => {
    const { data } = await supabase.from('stock_logs').select(`*, spareparts(name), locations(name)`).eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
    setLogs(data || []);
  }, []);

  const fetchInitialData = React.useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: locData } = await supabase.from('locations').select('*').eq('user_id', session.user.id);
      setLocations(locData || []);
      if (locData?.length > 0) {
        setSelectedLocation(locData[0]);
        fetchPartsByLocation(locData[0].id);
        fetchStockLogs(session.user.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fetchPartsByLocation, fetchStockLogs]);


  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  const handleTransaction = async (item, amount) => {
    const newQty = item.stock_at_location + amount;
    const type = amount < 0 ? 'Keluar' : 'Masuk';
    let invoiceRef = "";

    if (newQty < 0) return alert("Stok tidak mencukupi di lokasi ini!");

    if (type === 'Keluar') {
      invoiceRef = prompt("Masukkan Nomor Invoice / Nama Pelanggan:", "INV-");
      if (!invoiceRef) return; // Batalkan jika tidak diisi
    }

    const { data: { session } } = await supabase.auth.getSession();

    // 1. Update Stok di Lokasi
    const { error: invError } = await supabase.from('location_inventory').upsert({
      product_id: item.id, location_id: selectedLocation.id, quantity: newQty
    }, { onConflict: 'product_id, location_id' });

    if (!invError) {
      // 2. Catat Log Transaksi Lengkap
      await supabase.from('stock_logs').insert([{
        user_id: session.user.id,
        product_id: item.id,
        location_id: selectedLocation.id,
        type: type,
        quantity: Math.abs(amount),
        price_at_transaction: item.price_sell, // Simpan harga jual saat transaksi
        reference_invoice: invoiceRef,
        notes: type === 'Keluar' ? `Pemakaian servis (${invoiceRef})` : `Restock manual`
      }]);

      fetchPartsByLocation(selectedLocation.id);
      fetchStockLogs(session.user.id);
    }
  };

  const handleAddPart = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // 1. Tambah ke spareparts
      const { data: part, error: pError } = await supabase
        .from('spareparts')
        .insert([{
          name: formData.name,
          category: formData.category,
          price_buy: formData.price_buy,
          price_sell: formData.price_sell
        }])
        .select()
        .single();

      if (pError) throw pError;

      // 2. Inisialisasi stok di lokasi terpilih
      await supabase.from('location_inventory').insert([{
        product_id: part.id,
        location_id: selectedLocation.id,
        quantity: formData.initial_stock
      }]);

      // 3. Catat Log
      await supabase.from('stock_logs').insert([{
        user_id: session.user.id,
        product_id: part.id,
        location_id: selectedLocation.id,
        type: 'Masuk',
        quantity: formData.initial_stock,
        notes: 'Stok awal barang baru'
      }]);

      setShowAdd(false);
      fetchPartsByLocation(selectedLocation.id);
      setFormData({ name: '', category: 'LCD', price_buy: 0, price_sell: 0, initial_stock: 0 });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Waktu", "Invoice", "Barang", "Tipe", "Harga", "Qty", "Subtotal"];
    const rows = logs.map(log => [
      new Date(log.created_at).toLocaleString(),
      log.reference_invoice || '-',
      log.spareparts?.name,
      log.type,
      log.price_at_transaction,
      log.quantity,
      log.price_at_transaction * log.quantity
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan_stok_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredParts = parts.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* 1. ROLE INFO & SELECTOR */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${isGudangPusat ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
            <Warehouse size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-800">
              {selectedLocation?.name}
            </h2>
            <div className="flex gap-2 mt-1">
              <select
                className="text-[10px] font-bold uppercase bg-slate-100 px-3 py-1 rounded-lg outline-none"
                value={selectedLocation?.id}
                onChange={(e) => {
                  const loc = locations.find(l => l.id === e.target.value);
                  setSelectedLocation(loc);
                  fetchPartsByLocation(loc.id);
                }}
              >
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg uppercase border border-slate-100">
                {isGudangPusat ? 'Mode: Full Access' : 'Mode: Read & Use Only'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 max-w-md relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input
            type="text"
            placeholder="Cari sparepart..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        {isGudangPusat && (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full md:w-auto bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all uppercase"
          >
            <Plus size={16} /> Daftarkan Barang Baru
          </button>
        )}
      </div>

      {/* 2. GRID PRODUK */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParts.length > 0 ? filteredParts.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:border-blue-500 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[9px] font-bold bg-slate-50 text-slate-400 px-3 py-1 rounded-full uppercase">{item.category}</span>
              <p className="text-xs font-black text-slate-800">Rp {item.price_sell?.toLocaleString()}</p>
            </div>
            <h3 className="text-lg font-black text-slate-800 uppercase leading-tight mb-6">{item.name}</h3>

            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-3xl mb-4">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Sisa Stok</p>
                <p className={`text-2xl font-black ${item.stock_at_location <= 2 ? 'text-rose-600' : 'text-slate-900'}`}>{item.stock_at_location}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleTransaction(item, -1)} className="h-12 w-12 bg-white text-rose-600 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 hover:bg-rose-600 hover:text-white transition-all"><Minus size={18} /></button>
                {isGudangPusat && (
                  <button onClick={() => handleTransaction(item, 1)} className="h-12 w-12 bg-white text-blue-600 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 hover:bg-blue-600 hover:text-white transition-all"><Plus size={18} /></button>
                )}
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center">
            <Package className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-medium italic">Barang tidak ditemukan atau stok kosong di lokasi ini.</p>
          </div>
        )}
      </div>

      {/* 3. LAPORAN TRANSAKSI (MUTASI) */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden mt-10">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-black italic uppercase text-slate-800 flex items-center gap-2">
              <History className="text-blue-600" size={18} /> Laporan Mutasi & Keluar Barang
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Mencatat harga jual & nomor invoice transaksi</p>
          </div>
          <button
            onClick={exportToCSV}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            <FileSpreadsheet size={20} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white">
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-5">Waktu / Ref</th>
                <th className="px-8 py-5">Barang</th>
                <th className="px-8 py-5">Tipe</th>
                <th className="px-8 py-5 text-right">Harga Jual</th>
                <th className="px-8 py-5 text-right">Qty</th>
                <th className="px-8 py-5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5">
                    <p className="text-[11px] font-bold text-slate-800">{new Date(log.created_at).toLocaleTimeString('id-ID')}</p>
                    <p className="text-[9px] text-blue-500 font-bold uppercase">{log.reference_invoice || '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-700">{log.spareparts?.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin size={10} className="text-blue-400" />
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{log.locations?.name || 'Utama'}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase ${log.type === 'Keluar' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right font-bold text-slate-600">Rp {log.price_at_transaction?.toLocaleString()}</td>
                  <td className="px-8 py-5 text-right font-black text-slate-800">{log.quantity}</td>
                  <td className="px-8 py-5 text-right font-black text-blue-600">Rp {(log.price_at_transaction * log.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MODAL ADD NEW */}
      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl relative animate-in zoom-in-95">
            <button onClick={() => setShowAdd(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X size={20} /></button>
            <h2 className="text-2xl font-bold mb-8 tracking-tight text-slate-800">Daftarkan Barang</h2>

            <form onSubmit={handleAddPart} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Nama Barang</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-blue-100" placeholder="Contoh: LCD iPhone 12 Original" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Kategori</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm outline-none">
                    <option>LCD</option>
                    <option>Baterai</option>
                    <option>Konektor</option>
                    <option>IC</option>
                    <option>Alat Kerja</option>
                    <option>Aksesoris</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Stok Awal</label>
                  <input required type="number" value={formData.initial_stock} onChange={e => setFormData({ ...formData, initial_stock: parseInt(e.target.value) })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Harga Beli</label>
                  <input required type="number" value={formData.price_buy} onChange={e => setFormData({ ...formData, price_buy: parseInt(e.target.value) })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Harga Jual</label>
                  <input required type="number" value={formData.price_sell} onChange={e => setFormData({ ...formData, price_sell: parseInt(e.target.value) })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm outline-none" />
                </div>
              </div>

              <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 mt-6 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Simpan Barang Baru'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;