import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  Store, MapPin, Globe, Loader2, Plus,
  RefreshCw, FileUp, Download, Save, Edit3, Check, X, Package,
  ArrowRightLeft, History, AlertCircle, Clock
} from 'lucide-react';
import { Skeleton, EmptyState, Toast } from './UI';

const StoreKatalog = () => {
  const [locations, setLocations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [editedPrices, setEditedPrices] = useState({});
  const [newProduct, setNewProduct] = useState({
    name: '', price_buy: '', price_sell: '', category: 'Sparepart'
  });
  const [newLocation, setNewLocation] = useState({
    name: '', type: 'Toko'
  });
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [transferLogs, setTransferLogs] = useState([]);
  const [transferData, setTransferData] = useState({
    product_id: '', source_location_id: '', destination_location_id: '', quantity: 1
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [
        { data: locData },
        { data: prodData },
        { data: invData }
      ] = await Promise.all([
        supabase.from('locations').select('*').eq('user_id', session.user.id),
        supabase.from('spareparts').select('*').eq('user_id', session.user.id).order('name'),
        supabase.from('location_inventory').select('*')
      ]);

      setLocations(locData || []);
      setAllProducts(prodData || []);
      setInventory(invData || []);
    } catch (error) {
      console.error("Gagal sinkronisasi:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransferLogs = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data, error } = await supabase
      .from('stock_logs')
      .select('*, spareparts(name), locations(*)')
      .eq('user_id', session.user.id)
      .eq('type', 'Keluar')
      .ilike('notes', '%[TRANSFER]%')
      .order('created_at', { ascending: false });
    if (!error) setTransferLogs(data);
  };

  const handleAddSingleProduct = async (e) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from('spareparts').insert([{
      ...newProduct,
      user_id: session.user.id,
      price_buy: parseFloat(newProduct.price_buy),
      price_sell: parseFloat(newProduct.price_sell)
    }]);

    if (!error) {
      setToast({ message: "Produk baru berhasil terdaftar" });
      setShowAddModal(false);
      setNewProduct({ name: '', price_buy: '', price_sell: '', category: 'Sparepart' });
      fetchStoreData();
    } else {
      setToast({ message: "Gagal tambah produk: " + error.message, type: 'error' });
    }
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from('locations').insert([{
      ...newLocation,
      user_id: session.user.id
    }]);

    if (!error) {
      setToast({ message: "Cabang baru berhasil terdaftar" });
      setShowAddLocationModal(false);
      setNewLocation({ name: '', type: 'Toko' });
      fetchStoreData();
    } else {
      setToast({ message: "Gagal tambah cabang: " + error.message, type: 'error' });
    }
  };

  const downloadTemplate = () => {
    const headers = "nama_barang,stok_awal,stok_minimum,harga_beli,harga_jual,kategori\n";
    const example = "LCD iPhone 11,10,2,450000,750000,LCD\nBaterai Samsung A51,15,3,150000,250000,Baterai";
    const blob = new Blob([headers + example], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_stok_katalog.csv';
    a.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const { data: { session } } = await supabase.auth.getSession();
    if (!file || !session) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const rows = text.split('\n').slice(1);
      const bulkData = rows.filter(row => row.trim() !== '').map(row => {
        const cols = row.split(',');
        return {
          user_id: session.user.id,
          name: cols[0],
          price_buy: parseFloat(cols[3]) || 0,
          price_sell: parseFloat(cols[4]) || 0,
          category: cols[5]?.trim() || 'Sparepart'
        };
      });

      const { error } = await supabase.from('spareparts').insert(bulkData);
      if (!error) {
        setToast({ message: "Import CSV berhasil" });
        fetchStoreData();
      } else {
        setToast({ message: "Format CSV tidak sesuai template.", type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  const updateLocalStock = async (productId, locationId, currentQty, adjustment) => {
    const newQty = Math.max(0, currentQty + adjustment);
    const { error } = await supabase
      .from('location_inventory')
      .upsert({ product_id: productId, location_id: locationId, quantity: newQty }, { onConflict: 'product_id, location_id' });
    if (!error) fetchStoreData();
  };

  const saveAllPrices = async () => {
    setLoading(true);
    for (const id in editedPrices) {
      await supabase.from('spareparts').update({ price_sell: parseFloat(editedPrices[id]) }).eq('id', id);
    }
    setIsEditingPrice(false);
    setEditedPrices({});
    fetchStoreData();
  };

  const handleTransferStock = async (e) => {
    e.preventDefault();
    const { product_id, source_location_id, destination_location_id, quantity } = transferData;
    const qtyNum = parseInt(quantity);

    if (source_location_id === destination_location_id) return setToast({ message: "Asal dan tujuan tidak boleh sama.", type: 'error' });

    const sourceInv = inventory.find(i => i.product_id === product_id && i.location_id === source_location_id);
    if (!sourceInv || sourceInv.quantity < qtyNum) return setToast({ message: "Stok di asal tidak mencukupi.", type: 'error' });

    const { data: { session } } = await supabase.auth.getSession();

    await supabase.from('location_inventory').update({ quantity: sourceInv.quantity - qtyNum }).eq('product_id', product_id).eq('location_id', source_location_id);

    const destInv = inventory.find(i => i.product_id === product_id && i.location_id === destination_location_id);
    await supabase.from('location_inventory').upsert({
      product_id,
      location_id: destination_location_id,
      quantity: (destInv ? destInv.quantity : 0) + qtyNum
    }, { onConflict: 'product_id, location_id' });

    const sourceName = locations.find(l => l.id === source_location_id)?.name;
    const destName = locations.find(l => l.id === destination_location_id)?.name;
    const productName = allProducts.find(p => p.id === product_id)?.name;

    await supabase.from('stock_logs').insert([{
      user_id: session.user.id,
      product_id: product_id,
      location_id: source_location_id,
      type: 'Keluar',
      quantity: qtyNum,
      price_at_transaction: allProducts.find(p => p.id === product_id)?.price_sell || 0,
      notes: `[TRANSFER] ${productName} (${qtyNum}) dikirim dari ${sourceName} ke ${destName}`
    }]);

    setToast({ message: "Transfer stok berhasil!" });
    setShowTransferModal(false);
    fetchStoreData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="flex flex-col md:flex-row justify-between gap-4 px-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 tracking-tight">
            <Globe className="text-blue-600 w-7 h-7" /> Katalog dan Multi Cabang
          </h2>
          <p className="text-slate-500 text-sm mt-1">Kelola distribusi stok dan harga seluruh toko</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const url = window.location.origin + window.location.pathname + '#katalog';
              navigator.clipboard.writeText(url);
              setToast({ message: "Link katalog berhasil disalin ke clipboard!" });
            }}
            className="bg-blue-50 text-blue-600 border border-blue-100 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-blue-100 transition-all"
          >
            <Globe size={14} /> Bagikan Katalog
          </button>
          <button onClick={downloadTemplate} className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2 hover:bg-slate-50">
            <Download size={14} /> Template CSV
          </button>
          <label className="cursor-pointer bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2 hover:bg-slate-50">
            <FileUp size={14} className="text-blue-600" /> Import Masal
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
          <button onClick={() => { setShowHistoryModal(true); fetchTransferLogs(); }} className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2 hover:bg-slate-50">
            <History size={14} className="text-orange-500" /> Riwayat Distribusi
          </button>
          <button onClick={() => setShowTransferModal(true)} className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-500 transition-all">
            <ArrowRightLeft size={14} /> Transfer Stok
          </button>
          <button onClick={() => setShowAddLocationModal(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-500 transition-all">
            <Plus size={14} /> Tambah Cabang
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-slate-900 text-white px-4 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2">
            <Plus size={14} /> Tambah Produk
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-2 px-2">
        <button onClick={() => setIsEditingPrice(!isEditingPrice)} className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${isEditingPrice ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-white border border-slate-200 text-slate-600'}`}>
          <Edit3 size={14} /> {isEditingPrice ? 'Batal Edit Harga' : 'Edit Harga Masal'}
        </button>
        {isEditingPrice && (
          <button onClick={saveAllPrices} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2">
            <Check size={14} /> Simpan Perubahan Harga
          </button>
        )}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="px-8 py-5">Informasi Produk</th>
                <th className="px-8 py-5 text-center">Harga Jual</th>
                {locations.map(loc => (
                  <th key={loc.id} className="px-6 py-5 text-center border-l border-slate-100">{loc.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i}>
                    <td className="px-8 py-4"><Skeleton className="h-10 w-48" /></td>
                    <td className="px-8 py-4"><Skeleton className="h-6 w-24 mx-auto" /></td>
                    {locations.map(loc => (
                      <td key={loc.id} className="px-6 py-4 border-l border-slate-100"><Skeleton className="h-8 w-20 mx-auto" /></td>
                    ))}
                  </tr>
                ))
              ) : allProducts.length > 0 ? allProducts.map(prod => (
                <tr key={prod.id} className="hover:bg-slate-50/50">
                  <td className="px-8 py-4">
                    <p className="font-bold text-slate-800 text-sm">{prod.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{prod.category}</p>
                  </td>
                  <td className="px-8 py-4 text-center">
                    {isEditingPrice ? (
                      <input
                        type="number"
                        className="w-28 text-center bg-white border border-blue-200 rounded-lg py-1.5 text-xs font-bold text-blue-600 outline-none"
                        defaultValue={prod.price_sell}
                        onChange={(e) => setEditedPrices({ ...editedPrices, [prod.id]: e.target.value })}
                      />
                    ) : (
                      <p className="text-xs font-bold text-slate-700 font-mono">Rp {prod.price_sell?.toLocaleString()}</p>
                    )}
                  </td>
                  {locations.map(loc => {
                    const inv = inventory.find(i => i.product_id === prod.id && i.location_id === loc.id);
                    const qty = inv ? inv.quantity : 0;
                    return (
                      <td key={loc.id} className="px-6 py-4 border-l border-slate-100">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => updateLocalStock(prod.id, loc.id, qty, -1)} className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600">-</button>
                          <span className={`text-sm font-bold w-6 text-center ${qty === 0 ? 'text-slate-200' : 'text-slate-800'}`}>{qty}</span>
                          <button onClick={() => updateLocalStock(prod.id, loc.id, qty, 1)} className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600">+</button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              )) : (
                <tr>
                  <td colSpan={locations.length + 2}>
                    <EmptyState
                      icon={Package}
                      title="Katalog Kosong"
                      desc="Belum ada produk yang didaftarkan ke katalog utama."
                      actionText="Tambah Produk"
                      onAction={() => setShowAddModal(true)}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddLocationModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleAddLocation} className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><MapPin size={20} className="text-blue-600" /> Tambah Cabang Baru</h3>
              <button type="button" onClick={() => setShowAddLocationModal(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Nama Cabang / Toko</label>
                <input required placeholder="Contoh: Toko Pusat / Cabang Bekasi" className="w-full bg-slate-50 p-4 rounded-xl outline-none border border-transparent focus:border-blue-500 transition-all text-sm font-bold" value={newLocation.name} onChange={e => setNewLocation({ ...newLocation, name: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Tipe Lokasi</label>
                <select className="w-full bg-slate-50 p-4 rounded-xl outline-none text-sm font-bold" value={newLocation.type} onChange={e => setNewLocation({ ...newLocation, type: e.target.value })}>
                  <option value="Toko">Toko (Cabang)</option>
                  <option value="Gudang">Gudang (Penerimaan Stok)</option>
                </select>
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold mt-6 shadow-lg shadow-blue-100 active:scale-95 transition-all uppercase text-[10px] tracking-widest">Daftarkan Cabang</button>
          </form>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleAddSingleProduct} className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Package size={20} className="text-blue-600" /> Tambah Produk Baru</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            <div className="space-y-4">
              <input required placeholder="Nama Produk (Contoh: LCD iPhone 11)" className="w-full bg-slate-50 p-4 rounded-xl outline-none border border-transparent focus:border-blue-500 transition-all text-sm" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" placeholder="Harga Beli" className="w-full bg-slate-50 p-4 rounded-xl outline-none text-sm" value={newProduct.price_buy} onChange={e => setNewProduct({ ...newProduct, price_buy: e.target.value })} />
                <input required type="number" placeholder="Harga Jual" className="w-full bg-slate-50 p-4 rounded-xl outline-none text-sm" value={newProduct.price_sell} onChange={e => setNewProduct({ ...newProduct, price_sell: e.target.value })} />
              </div>
              <select className="w-full bg-slate-50 p-4 rounded-xl outline-none text-sm" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                <option>Sparepart</option><option>LCD</option><option>Baterai</option><option>Konektor</option><option>Aksesori</option>
              </select>
            </div>
            <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold mt-6 shadow-lg shadow-blue-100 active:scale-95 transition-all">Simpan ke Katalog</button>
          </form>
        </div>
      )}

      {showTransferModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleTransferStock} className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><ArrowRightLeft size={20} className="text-indigo-600" /> Transfer Stok Antar Gudang</h3>
              <button type="button" onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Pilih Produk</label>
                <select required className="w-full bg-slate-50 p-4 rounded-xl outline-none text-sm font-bold" value={transferData.product_id} onChange={e => setTransferData({ ...transferData, product_id: e.target.value })}>
                  <option value="">-- Pilih Produk --</option>
                  {allProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Dari Lokasi</label>
                  <select required className="w-full bg-slate-50 p-4 rounded-xl outline-none text-sm font-bold text-rose-600" value={transferData.source_location_id} onChange={e => setTransferData({ ...transferData, source_location_id: e.target.value })}>
                    <option value="">-- Asal --</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Ke Lokasi</label>
                  <select required className="w-full bg-slate-50 p-4 rounded-xl outline-none text-sm font-bold text-emerald-600" value={transferData.destination_location_id} onChange={e => setTransferData({ ...transferData, destination_location_id: e.target.value })}>
                    <option value="">-- Tujuan --</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Jumlah Barang</label>
                <input required type="number" min="1" className="w-full bg-slate-50 p-4 rounded-xl outline-none border border-transparent focus:border-indigo-500 text-sm font-bold" value={transferData.quantity} onChange={e => setTransferData({ ...transferData, quantity: e.target.value })} />
              </div>
            </div>
            <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold mt-6 shadow-lg shadow-indigo-100 active:scale-95 transition-all text-[10px] tracking-widest uppercase">Proses Pemindahan</button>
          </form>
        </div>
      )}

      {showHistoryModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><History size={20} className="text-orange-500" /> Riwayat Distribusi Stok</h3>
              <button type="button" onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            <div className="overflow-y-auto space-y-3 pr-2 scrollbar-thin">
              {transferLogs.length > 0 ? transferLogs.map((log, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-orange-500">
                    <ArrowRightLeft size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-800">{log.notes}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                        <Clock size={10} /> {new Date(log.created_at).toLocaleString('id-ID')}
                      </p>
                      <span className="text-[9px] font-bold bg-white px-2 py-0.5 rounded-full border border-slate-100 text-slate-500 uppercase">Transfer</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-20">
                  <AlertCircle size={40} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-sm text-slate-400 italic">Belum ada riwayat pemindahan barang.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default StoreKatalog;