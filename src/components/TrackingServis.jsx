import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; 
import { Search, Package, Wrench, CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';

const TrackingServis = () => {
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!searchId) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1. Ambil SEMUA data (atau batasi) untuk filter ID pendek di sisi client
      // Karena Supabase tidak bisa mencari potongan UUID (slice) secara langsung via API standar
      const { data, error: dbError } = await supabase
        .from('services')
        .select('*');

      if (dbError) throw dbError;

      // 2. Logika Pencarian Pintar
      const searchLower = searchId.toLowerCase();
      const found = data.find(s => {
        const shortId = s.id ? s.id.toString().slice(0, 8).toLowerCase() : '';
        const name = s.customer_name ? s.customer_name.toLowerCase() : '';
        return shortId === searchLower || name.includes(searchLower);
      });

      if (!found) {
        setError("Data tidak ditemukan. Pastikan ID Nota (8 digit) atau Nama benar.");
      } else {
        setResult(found);
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat mencari data.");
    } finally {
      setLoading(false);
    }
  };

  const getSteps = (currentStatus) => {
    const statusMap = { 'Pending': 0, 'Checking': 1, 'Working': 2, 'Done': 3 };
    const currentIndex = statusMap[currentStatus] || 0;

    return [
      { label: "Diterima", icon: <Package className="w-5 h-5" />, status: currentIndex >= 0 ? "complete" : "pending" },
      { label: "Pengecekan", icon: <Search className="w-5 h-5" />, status: currentIndex >= 1 ? "complete" : currentIndex === 0 ? "active" : "pending" },
      { label: "Proses Servis", icon: <Wrench className="w-5 h-5" />, status: currentIndex >= 2 ? "complete" : currentIndex === 1 ? "active" : "pending" },
      { label: "Selesai", icon: <CheckCircle2 className="w-5 h-5" />, status: currentIndex === 3 ? "complete" : currentIndex === 2 ? "active" : "pending" },
    ];
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-blue-600 p-6 text-white text-center">
          <h2 className="text-xl font-bold flex justify-center items-center gap-2">
            <Search className="w-5 h-5" /> Tracking Unit
          </h2>
          <p className="text-blue-100 text-[10px] mt-1 uppercase tracking-widest font-bold">Cek Status Perbaikan Anda</p>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-8">
            <input 
              type="text" 
              placeholder="Contoh: A36CB1F7 atau Nama..." 
              className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all uppercase font-bold"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2 text-xs font-bold border border-red-100 animate-in fade-in">
              <XCircle size={16} /> {error}
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center p-5 bg-slate-900 rounded-2xl text-white relative overflow-hidden">
                <div className="z-10">
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">
                    ID NOTA: #{result.id?.slice(0,8).toUpperCase()}
                  </p>
                  <p className="text-sm font-black uppercase tracking-tight">{result.unit_name}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">Pelanggan: {result.customer_name}</p>
                </div>
                <div className="text-right z-10">
                  <span className="text-[10px] bg-blue-600 text-white px-3 py-1 rounded-full font-black uppercase shadow-lg shadow-blue-500/20">
                    {result.status || 'PENDING'}
                  </span>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="relative pl-8 space-y-8 py-4">
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100"></div>
                {getSteps(result.status).map((step, index) => (
                  <div key={index} className="relative flex items-center gap-4">
                    <div className={`absolute -left-[32px] w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-500 
                      ${step.status === 'complete' ? 'bg-emerald-500 text-white' : 
                        step.status === 'active' ? 'bg-blue-600 text-white ring-4 ring-blue-50' : 
                        'bg-slate-100 text-slate-300'}`}>
                      {step.status === 'complete' ? <CheckCircle2 size={18} /> : step.icon}
                    </div>
                    <p className={`text-sm font-bold ${step.status === 'pending' ? 'text-slate-300' : 'text-slate-800'}`}>
                      {step.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
                <Clock className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-blue-900 uppercase">Diagnosa Kerusakan:</p>
                  <p className="text-[10px] text-blue-700 italic mt-0.5">"{result.issue}"</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingServis;