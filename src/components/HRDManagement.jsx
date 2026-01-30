import React, { useState, useEffect } from 'react';
import { supabase } from "../supabaseClient";
import {
  Users, Wallet, TrendingUp,
  CheckCircle2, ChevronRight, Calculator,
  DollarSign, Calendar, Banknote, History
} from 'lucide-react';

const HRDManagement = () => {
  const [services, setServices] = useState([]);
  const [techPercent, setTechPercent] = useState(0.30); // Default 30%
  const [stats, setStats] = useState({
    totalProfit: 0,
    techShare: 0,
    ownerShare: 0
  });
  const [techBreakdown, setTechBreakdown] = useState({});
  const [updating, setUpdating] = useState(false);

  const calculateShares = React.useCallback((data, percent) => {
    const total = data.reduce((acc, curr) => acc + (Number(curr.estimated_cost) || 0), 0);
    const tech = total * percent;
    setStats({
      totalProfit: total,
      techShare: tech,
      ownerShare: total - tech
    });

    // Breakdown per teknisi
    const breakdown = data.reduce((acc, curr) => {
      const name = curr.technician_name || 'Umum';
      if (!acc[name]) acc[name] = 0;
      acc[name] += (Number(curr.estimated_cost) * percent);
      return acc;
    }, {});
    setTechBreakdown(breakdown);
  }, []);

  const fetchCommissionData = React.useCallback(async (percent) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // SINKRONISASI: Menggunakan 'Done' sesuai dengan App.jsx
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('status', 'Done')
      .eq('commission_status', 'Unpaid');

    if (!error && data) {
      setServices(data);
      calculateShares(data, percent);
    }
  }, [calculateShares]);

  const fetchSettings = React.useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('user_id', session.user.id)
      .eq('key', 'tech_percent')
      .single();

    if (data?.value) {
      const p = parseInt(data.value) / 100;
      setTechPercent(p);
      fetchCommissionData(p);
    } else {
      fetchCommissionData(techPercent);
    }
  }, [fetchCommissionData, techPercent]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateTechPercent = async () => {
    const newVal = prompt("Masukkan persentase jatah teknisi (0-100):", techPercent * 100);
    if (newVal === null) return;

    const pInt = parseInt(newVal);
    if (isNaN(pInt) || pInt < 0 || pInt > 100) return alert("Persentase tidak valid!");

    setUpdating(true);
    const { data: { session } } = await supabase.auth.getSession();

    const { error } = await supabase
      .from('settings')
      .upsert({
        user_id: session.user.id,
        key: 'tech_percent',
        value: pInt.toString()
      }, { onConflict: 'user_id, key' });

    if (!error) {
      const newPercent = pInt / 100;
      setTechPercent(newPercent);
      calculateShares(services, newPercent);
    } else {
      alert("Gagal menyimpan pengaturan: " + error.message);
    }
    setUpdating(false);
  };

  const handlePayout = async () => {
    if (services.length === 0) return alert("Tidak ada saldo jatah teknisi untuk ditarik.");

    if (window.confirm(`Proses pembayaran gaji sebesar Rp ${stats.techShare.toLocaleString()}?`)) {
      const ids = services.map(s => s.id);

      const { error } = await supabase
        .from('services')
        .update({ commission_status: 'Paid' })
        .in('id', ids);

      if (!error) {
        alert("Gaji berhasil ditandai sebagai Lunas!");
        fetchCommissionData();
      } else {
        alert("Gagal memproses pembayaran: " + error.message);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <Users className="text-violet-600 w-7 h-7" /> Profit share
          </h2>
          <p className="text-slate-500 text-xs font-bold mt-1">Gaji & jasa teknisi</p>
        </div>

        <button
          onClick={handlePayout}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg hover:bg-emerald-500 transition-all active:scale-95"
        >
          <Banknote className="w-4 h-4" /> Bayar gaji lunas
        </button>
      </div>

      {/* Ringkasan Gaji */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Piutang gaji teknisi</p>
          <h3 className="text-2xl font-black text-slate-800">Rp {stats.techShare.toLocaleString('id-ID')}</h3>
          <div className="mt-3 flex items-center gap-2 text-rose-500 font-bold text-[9px] uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Belum terbayar
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <TrendingUp className="absolute -right-2 -bottom-2 w-16 h-16 opacity-10 text-emerald-400" />
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-60">Omzet unit selesai</p>
          <h3 className="text-2xl font-black">Rp {stats.totalProfit.toLocaleString('id-ID')}</h3>
        </div>

        <div className="bg-violet-50 p-6 rounded-3xl border border-violet-100 flex flex-col justify-center relative group">
          <div className="flex items-center gap-2 text-violet-600 mb-1">
            <Calculator className="w-4 h-4" />
            <p className="text-[10px] font-bold uppercase">Skema Bagi Hasil</p>
          </div>
          <p className="text-sm font-bold text-violet-800 italic uppercase">
            Teknisi: {Math.round(techPercent * 100)}% | Owner: {Math.round((1 - techPercent) * 100)}%
          </p>
          <button
            disabled={updating}
            onClick={updateTechPercent}
            className="absolute top-4 right-4 text-[9px] font-black text-violet-400 uppercase hover:text-violet-600 underline opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {updating ? 'Saving...' : 'Ubah Skema'}
          </button>
        </div>
      </div>

      {/* Breakdown per Teknisi */}
      {Object.keys(techBreakdown).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(techBreakdown).map(([name, amount]) => (
            <div key={name} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{name}</p>
              <p className="text-sm font-black text-slate-800">Rp {amount.toLocaleString('id-ID')}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabel Rincian */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h4 className="font-bold text-slate-800 italic">Antrean pembayaran gaji</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Unit servis</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Teknisi</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Biaya total</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Jatah teknisi ({Math.round(techPercent * 100)}%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800 uppercase">{item.unit_name}</p>
                    <p className="text-[10px] text-slate-500 font-medium italic">{item.customer_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-600">{item.technician_name || 'Umum'}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">
                    Rp {Number(item.estimated_cost).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-emerald-600 text-sm font-bold">
                      Rp {(item.estimated_cost * techPercent).toLocaleString('id-ID')}
                    </span>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-slate-400 font-medium text-xs italic">Semua gaji sudah lunas terbayar</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HRDManagement;