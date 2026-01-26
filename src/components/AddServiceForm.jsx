import React, { useState } from 'react';
import { 
  User, Smartphone, PenTool, Phone,
  CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import Invoice from './Invoice'; 

const AddServiceForm = ({ onComplete }) => {
  // 1. State Tunggal sesuai kolom Database Anda
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    unit_name: '', // Menggunakan unit_name sesuai dashboard Supabase Anda
    issue: '',
    estimated_cost: '',
    status: 'Pending'
  });
  
  const [loading, setLoading] = useState(false);
  const [savedData, setSavedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

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
            issue: formData.issue,
            estimated_cost: parseInt(formData.estimated_cost) || 0,
            status: formData.status
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
          issue: '', 
          estimated_cost: '', 
          status: 'Pending' 
        });
        
        // Menjalankan fungsi refresh data di Dashboard utama
        if (onComplete) onComplete(); 
      }
    } catch (err) {
      console.error("Gagal simpan:", err.message);
      setErrorMsg('Gagal simpan: ' + err.message);
    } finally {
      setLoading(false);
    }
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
        
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200 text-white">
            <PenTool className="w-5 h-5" />
          </div>
          Input Servis Baru
        </h2>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-xs font-bold leading-tight">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Nama Pelanggan */}
          <div className="group">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block tracking-widest">Nama Pelanggan</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text" required
                value={formData.customer_name}
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                placeholder="Nama Pelanggan" 
                className="w-full bg-slate-50 border-2 border-transparent rounded-[1.2rem] py-3.5 pl-11 pr-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm outline-none font-bold" 
              />
            </div>
          </div>

          {/* Input Nomor HP */}
          <div className="group">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block tracking-widest">No. WhatsApp</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="tel" required
                value={formData.customer_phone}
                onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                placeholder="0812xxxx (Aktif WA)" 
                className="w-full bg-slate-50 border-2 border-transparent rounded-[1.2rem] py-3.5 pl-11 pr-4 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm outline-none font-bold text-emerald-700" 
              />
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
                onChange={(e) => setFormData({...formData, unit_name: e.target.value})}
                placeholder="iPhone / Android / Laptop" 
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
              onChange={(e) => setFormData({...formData, issue: e.target.value})}
              placeholder="Jelaskan kerusakan unit..." 
              className="w-full bg-slate-50 border-2 border-transparent rounded-[1.2rem] py-3.5 px-5 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm outline-none resize-none font-bold"
            ></textarea>
          </div>

          {/* Estimasi Biaya */}
          <div className="bg-slate-900 p-4 rounded-[1.5rem] shadow-xl border border-slate-800">
            <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block tracking-widest">Estimasi Biaya</label>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-blue-400">Rp</span>
              <input 
                type="number" required
                value={formData.estimated_cost}
                onChange={(e) => setFormData({...formData, estimated_cost: e.target.value})}
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
    </div>
  );
};

export default AddServiceForm;