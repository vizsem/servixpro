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
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '', stock_quantity: 0, price_buy: '', price_sell: '', category: 'Sparepart'
  });

  const isGudangPusat = selectedLocation?.type === 'Gudang' || selectedLocation?.name.toLowerCase().includes('pusat');

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const { data: locData } = await supabase.from('locations').select('*').eq('user_id', session.user.id);
      setLocations(locData || []);
      if (locData?.length > 0) {
        setSelectedLocation(locData[0]);
        fetchPartsByLocation(locData[0].id);
        fetchStockLogs(session.user.id);
      }
    } finally { setLoading(false); }
  };

  const fetchPartsByLocation = async (locId) => {
    const { data } = await supabase.from('location_inventory').select(`quantity, product_id, spareparts (*)`).eq('location_id', locId);
    setParts(data ? data.map(i => ({ ...i.spareparts, stock_at_location: i.quantity })) : []);
  };

  const fetchStockLogs = async (userId) => {
    const { data } = await supabase.from('stock_logs').select(`*, spareparts(name), locations(name)`).eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
    setLogs(data || []);
  };

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

        {isGudangPusat && (
          <button onClick={() => setShowAdd(true)} className="w-full md:w-auto bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all uppercase">
            <Plus size={16} /> Daftarkan Barang Baru
          </button>
        )}
      </div>

      {/* 2. GRID PRODUK */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parts.map(item => (
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
                  <button onClick={() => handleTransaction(item, -1)} className="h-12 w-12 bg-white text-rose-600 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 hover:bg-rose-600 hover:text-white transition-all"><Minus size={18}/></button>
                  {isGudangPusat && (
                    <button onClick={() => handleTransaction(item, 1)} className="h-12 w-12 bg-white text-blue-600 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 hover:bg-blue-600 hover:text-white transition-all"><Plus size={18}/></button>
                  )}
               </div>
            </div>
          </div>
        ))}
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
          <button className="p-3 bg-white border border-slate-200 rounded-2xl text-emerald-600 hover:bg-emerald-50"><FileSpreadsheet size={20}/></button>
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
                  <td className="px-8 py-5">
                    <p className="text-xs font-black text-slate-700 uppercase">{log.spareparts?.name}</p>
                    <p className="text-[9px] text-slate-400">{log.locations?.name}</p>
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
    </div>
  );
};

export default StockManagement;