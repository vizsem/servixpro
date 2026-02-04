import React, { useState } from 'react';
import {
  X, User, Phone, Smartphone, AlertCircle,
  CheckCircle2, Loader2, Printer, Search, PenTool, Hash
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import Invoice from './Invoice';
import { Toast } from './UI';

const AddServiceForm = ({ onComplete, onClose }) => {
  // 1. State Tunggal sesuai kolom Database Anda
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    unit_name: '', // Menggunakan unit_name sesuai dashboard Supabase Anda
    imei_sn: '',
    issue: '',
    estimated_cost: '',
    status: 'Pending',
    technician_name: 'Umum'
  });

  const [loading, setLoading] = useState(false);
  const [savedData, setSavedData] = useState(null);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    try {
      // 2. Ambil Session User
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sesi berakhir. Silakan login kembali.");

      // 3. Simpan ke Database
      const { data, error } = await supabase
        .from('services')
        .insert([
          {
            user_id: session.user.id,
            customer_name: formData.customer_name,
            customer_phone: formData.customer_phone,
            unit_name: formData.unit_name,
            imei_sn: formData.imei_sn,
            issue: formData.issue,
            estimated_cost: parseInt(formData.estimated_cost) || 0,
            status: formData.status,
            technician_name: formData.technician_name
          }
        ])
        .select(); // Mengambil data yang baru saja dibuat untuk dikirim ke Invoice

      if (error) throw error;

      // 4. Jika Sukses, set savedData untuk memicu tampilan Invoice
      if (data && data.length > 0) {
        setSavedData(data[0]);

        // Reset form agar bersih saat user menekan 'Kembali' dari Invoice
        setFormData({
          customer_name: '',
          customer_phone: '',
          unit_name: '',
          imei_sn: '',
          issue: '',
          estimated_cost: '',
          status: 'Pending',
          technician_name: 'Umum'
        });

        // Menjalankan fungsi refresh data di Dashboard utama
        if (onComplete) onComplete();
      }
    } catch (err) {
      console.error("Gagal simpan:", err.message);
      setToast({ message: 'Gagal simpan: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const lookupCustomer = async () => {
    if (!formData.customer_phone) return;
    setLoading(true);
    const { data } = await supabase
      .from('services')
      .select('customer_name')
      .eq('customer_phone', formData.customer_phone)
      .order('created_at', { ascending: false }) // Get the most recent entry
      .limit(1)
      .maybeSingle();

    if (data?.customer_name) {
      setFormData(prev => ({ ...prev, customer_name: data.customer_name }));
    }
    setLoading(false);
  };

  // 5. LOGIKA TAMPILAN: Jika data sudah tersimpan, tampilkan Invoice
  // Ini akan menggantikan tampilan form secara otomatis
  if (savedData) {
    return (
      <Invoice
        data={savedData}
        onBack={() => setSavedData(null)}
      />
    );
  }

  // 6. TAMPILAN FORM INPUT
  return (
    <div className="p-4 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2.5rem] shadow-xl p-6 border border-slate-100 relative overflow-hidden">
        {/* Dekorasi Aksen */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-10 -mt-10"></div>

        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors">
          <X size={20} />
        </button>

        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200 text-white">
            <PenTool className="w-5 h-5" />
          </div>
          Input Servis Baru
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Nama Pelanggan */}
          <div className="group">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block tracking-widest">Nama Pelanggan</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text" required
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                placeholder="Nama Pelanggan"
                className="w-full bg-slate-50 border-2 border-transparent rounded-[1.2rem] py-3.5 pl-11 pr-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm outline-none font-bold"
              />
            </div>
          </div>

          {/* Input Nomor HP */}
          <div className="group relative">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block tracking-widest">WhatsApp Pelanggan</label>
            <div className="flex gap-2">
              <input
                required
                type="tel"
                placeholder="Contoh: 0812..."
                className="flex-1 bg-slate-50 border-2 border-transparent rounded-[1.2rem] py-3.5 px-5 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm outline-none font-bold"
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
              />
              <button
                type="button"
                onClick={lookupCustomer}
                className="bg-slate-100 p-3 rounded-xl text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                title="Cari riwayat nama pelanggan"
              >
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* Input Unit */}
          <div className="group">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block tracking-widest">Tipe Perangkat</label>
            <div className="relative">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text" required
                value={formData.unit_name}
                onChange={(e) => setFormData({ ...formData, unit_name: e.target.value })}
                placeholder="iPhone / Android / Laptop"
                className="w-full bg-slate-50 border-2 border-transparent rounded-[1.2rem] py-3.5 pl-11 pr-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm outline-none font-bold"
              />
            </div>
          </div>

          {/* Input IMEI/SN */}
          <div className="group">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block tracking-widest">IMEI / Serial Number</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                value={formData.imei_sn}
                onChange={(e) => setFormData({ ...formData, imei_sn: e.target.value })}
                placeholder="IMEI atau Nomor Seri (Opsional)"
                className="w-full bg-slate-50 border-2 border-transparent rounded-[1.2rem] py-3.5 pl-11 pr-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm outline-none font-bold"
              />
            </div>
          </div>

          {/* Input Keluhan */}
          <div className="group">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block tracking-widest">Detail Kerusakan</label>
            <textarea
              rows="2" required
              value={formData.issue}
              onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
              placeholder="Jelaskan kerusakan unit..."
              className="w-full bg-slate-50 border-2 border-transparent rounded-[1.2rem] py-3.5 px-5 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm outline-none resize-none font-bold"
            ></textarea>
          </div>

          {/* Input Teknisi */}
          <div className="group">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block tracking-widest">Pilih Teknisi</label>
            <select
              value={formData.technician_name}
              onChange={(e) => setFormData({ ...formData, technician_name: e.target.value })}
              className="w-full bg-slate-50 border-2 border-transparent rounded-[1.2rem] py-3.5 px-5 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm outline-none font-bold"
            >
              <option value="Umum">Umum / Toko</option>
              <option value="Teknisi 1">Teknisi 1</option>
              <option value="Teknisi 2">Teknisi 2</option>
              <option value="Teknisi 3">Teknisi 3</option>
            </select>
          </div>

          {/* Estimasi Biaya */}
          <div className="bg-slate-900 p-4 rounded-[1.5rem] shadow-xl border border-slate-800">
            <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block tracking-widest">Estimasi Biaya</label>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-blue-400">Rp</span>
              <input
                type="number" required
                value={formData.estimated_cost}
                onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                placeholder="0"
                className="w-full bg-transparent border-none p-0 text-2xl font-black text-white placeholder:text-slate-700 focus:ring-0 outline-none"
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-[1.2rem] font-black text-sm shadow-lg shadow-blue-200 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <><CheckCircle2 className="w-5 h-5" /> SIMPAN & TERBITKAN NOTA</>
            )}
          </button>
        </form>
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AddServiceForm;