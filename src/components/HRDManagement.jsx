import React, { useState, useEffect } from 'react';
import { supabase } from "../supabaseClient";
import {
  Users, Wallet, TrendingUp,
  CheckCircle2, ChevronRight, Calculator,
  DollarSign, Calendar, Banknote, History
} from 'lucide-react';

const HRDManagement = () => {
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({
    totalProfit: 0,
    techShare: 0,
    ownerShare: 0
  });
  const [techBreakdown, setTechBreakdown] = useState({});

  const TECH_PERCENT = 0.30; // 30% jatah teknisi

  const calculateShares = React.useCallback((data) => {
    const total = data.reduce((acc, curr) => acc + (Number(curr.estimated_cost) || 0), 0);
    const tech = total * TECH_PERCENT;
    setStats({
      totalProfit: total,
      techShare: tech,
      ownerShare: total - tech
    });

    // Breakdown per teknisi
    const breakdown = data.reduce((acc, curr) => {
      const name = curr.technician_name || 'Umum';
      if (!acc[name]) acc[name] = 0;
      acc[name] += (Number(curr.estimated_cost) * TECH_PERCENT);
      return acc;
    }, {});
    setTechBreakdown(breakdown);
  }, [TECH_PERCENT]);

  const fetchCommissionData = React.useCallback(async () => {
    // SINKRONISASI: Menggunakan 'Done' sesuai dengan App.jsx
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('status', 'Done')
      .eq('commission_status', 'Unpaid');

    if (!error && data) {
      setServices(data);
      calculateShares(data);
    }
  }, [calculateShares]);

  const isInitialMount = React.useRef(true);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (isInitialMount.current) {
      fetchCommissionData();
      isInitialMount.current = false;
    }
  }, [fetchCommissionData]);

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

        <div className="bg-violet-50 p-6 rounded-3xl border border-violet-100 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-violet-600 mb-1">
            <Calculator className="w-4 h-4" />
            <p className="text-[10px] font-bold uppercase">Skema Bagi Hasil</p>
          </div>
          <p className="text-sm font-bold text-violet-800 italic uppercase">Teknisi: {TECH_PERCENT * 100}% | Owner: {(1 - TECH_PERCENT) * 100}%</p>
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
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Jatah teknisi (30%)</th>
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
                      Rp {(item.estimated_cost * TECH_PERCENT).toLocaleString('id-ID')}
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