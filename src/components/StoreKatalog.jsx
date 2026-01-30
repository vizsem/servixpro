import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  Store, MapPin, Globe, Loader2, Plus,
  RefreshCw, FileUp, Download, Save, Edit3, Check, X, Package
} from 'lucide-react';

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

  // --- FUNGSI TAMBAH SATUAN ---
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
      setShowAddModal(false);
      setNewProduct({ name: '', price_buy: '', price_sell: '', category: 'Sparepart' });
      fetchStoreData();
    } else {
      alert("Gagal tambah produk: " + error.message);
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
      setShowAddLocationModal(false);
      setNewLocation({ name: '', type: 'Toko' });
      fetchStoreData();
    } else {
      alert("Gagal tambah cabang: " + error.message);
    }
  };

  // --- DOWNLOAD TEMPLATE CSV ---
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
      if (!error) fetchStoreData();
      else alert("Format CSV tidak sesuai template.");
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

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      {/* Header */}
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
              alert("Link katalog berhasil disalin ke clipboard!");
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
          <button onClick={() => setShowAddLocationModal(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-500 transition-all">
            <Plus size={14} /> Tambah Cabang
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-slate-900 text-white px-4 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2">
            <Plus size={14} /> Tambah Produk
          </button>
        </div>
      </div>

      {/* Kontrol Harga */}
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

      {/* Tabel Utama */}
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
              {allProducts.map(prod => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Cabang */}
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

      {/* Modal Tambah Satuan */}
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
    </div>
  );

};

export default StoreKatalog;