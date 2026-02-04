import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  TrendingUp, TrendingDown, Wallet, PieChart,
  ArrowUpRight, Loader2, Printer, RefreshCw, Package, XCircle
} from 'lucide-react';
import { Skeleton, EmptyState } from './UI';

const FinanceReport = () => {
  const [loading, setLoading] = useState(true);
  const [dataServis, setDataServis] = useState([]);
  const [dataStockLogs, setDataStockLogs] = useState([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    operationalExpense: 0,
    netProfit: 0
  });
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const fetchFinanceData = React.useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 1. Ambil Data Pemasukan (Servis Selesai)
      const { data: services, error: sError } = await supabase
        .from('services')
        .select('unit_name, customer_name, estimated_cost, created_at, status')
        .eq('user_id', session.user.id)
        .eq('status', 'Done')
        .gte('created_at', `${dateRange.start}T00:00:00`)
        .lte('created_at', `${dateRange.end}T23:59:59`)
        .order('created_at', { ascending: false });

      if (sError) throw sError;

      // 2. Ambil Data Log Stok Keluar (Modal)
      // Pastikan relasi spareparts(name, price_buy) sudah benar di database
      // Ganti bagian query stock_logs dengan ini
      const { data: logs, error: lError } = await supabase
        .from('stock_logs')
        .select('*, spareparts(price_buy, name)')
        .eq('user_id', session.user.id) // Keep user_id filter
        .eq('type', 'Keluar')
        .gte('created_at', `${dateRange.start}T00:00:00`)
        .lte('created_at', `${dateRange.end}T23:59:59`)
        .order('created_at', { ascending: false }); // Keep order clause

      if (lError) throw lError;

      // 3. Ambil data pengeluaran operasional
      const { data: expData, error: expError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', session.user.id) // Add user_id filter
        .gte('date', dateRange.start)
        .lte('date', dateRange.end)
        .order('date', { ascending: false }); // Add order clause

      if (expError) throw expError;

      // 4. Kalkulasi Angka
      const income = services?.reduce((acc, curr) => acc + (Number(curr.estimated_cost) || 0), 0) || 0;
      const stockExpense = logs?.reduce((acc, curr) => acc + (Number(curr.spareparts?.price_buy || 0) * curr.quantity), 0) || 0;
      const operationalExpense = expData?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;

      const totalExp = stockExpense + operationalExpense;

      setStats({
        totalIncome: income,
        totalExpense: totalExp,
        operationalExpense: operationalExpense,
        netProfit: income - totalExp
      });

      setDataServis(services || []);
      setDataStockLogs(logs || []);

    } catch (error) {
      console.error('Gagal mengambil laporan:', error.message);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchFinanceData();
  }, [dateRange, fetchFinanceData]);

  const handlePrint = () => window.print();

  if (loading) return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center px-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-64" />
      </div>
      <Skeleton className="h-64 w-full rounded-[2.5rem]" />
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-[2rem]" />)}
      </div>
    </div>
  );

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6 pb-24 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center px-2 no-print">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Laporan Keuangan</h2>
          <p className="text-slate-500 text-xs font-medium">Data terpusat jasa dan sparepart</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 text-[10px] font-bold outline-none border-r border-slate-100"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 text-[10px] font-bold outline-none"
            />
          </div>
          <button onClick={fetchFinanceData} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCw size={18} />
          </button>
          <button onClick={handlePrint} className="bg-slate-900 text-white px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 hover:bg-slate-800 transition-all">
            <Printer size={16} /> Cetak
          </button>
        </div>
      </div>

      <div id="printable-area" className="space-y-6">
        {/* Card Utama */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-white/5">
          <div className="relative z-10">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Estimasi Laba Bersih</p>
            <h2 className="text-5xl font-black mb-10 tracking-tighter">
              Rp {stats.netProfit.toLocaleString('id-ID')}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-3xl">
                <div className="flex items-center gap-2 mb-1 text-emerald-400">
                  <TrendingUp size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Omzet</span>
                </div>
                <p className="text-lg font-bold">Rp {stats.totalIncome.toLocaleString('id-ID')}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-3xl">
                <div className="flex items-center gap-2 mb-1 text-rose-400">
                  <TrendingDown size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pengeluaran</span>
                </div>
                <p className="text-lg font-bold">Rp {stats.totalExpense.toLocaleString('id-ID')}</p>
                <p className="text-[9px] text-slate-500 font-bold mt-2">Ops: {stats.operationalExpense.toLocaleString()} | Stok: {(stats.totalExpense - stats.operationalExpense).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <PieChart className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 rotate-12" />
        </div>

        {/* Tabel Sparepart Keluar (Log Modal) */}
        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 bg-rose-50/20 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-rose-500" />
              <h3 className="font-bold text-slate-800 text-sm">Produk Keluar (Modal)</h3>
            </div>
            <span className="text-[10px] font-black text-rose-600 bg-rose-100 px-3 py-1 rounded-full uppercase">Audit Stok</span>
          </div>

          <div className="divide-y divide-slate-50">
            {dataStockLogs.length > 0 ? dataStockLogs.map((log) => (
              <div key={log.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <TrendingDown className="text-rose-400 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-none mb-1">
                      {log.spareparts?.name || "Produk dihapus"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {new Date(log.created_at).toLocaleDateString('id-ID')} • {log.notes || 'Update Katalog'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-rose-600">
                    -Rp {((log.spareparts?.price_buy || 0) * log.quantity).toLocaleString('id-ID')}
                  </p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                    {log.quantity} Unit x Rp {log.spareparts?.price_buy?.toLocaleString()}
                  </p>
                </div>
              </div>
            )) : (
              <EmptyState
                icon={Package}
                title="Log Stok Kosong"
                desc="Tidak ada catatan pengeluaran sparepart untuk periode ini."
              />
            )}
          </div>
        </div>

        {/* List Transaksi Jasa */}
        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm italic">Rincian Pemasukan Jasa</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {dataServis.length > 0 ? dataServis.map((trx, index) => (
              <div key={index} className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-xs">
                    {trx.unit_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-none mb-1">{trx.unit_name}</p>
                    <p className="text-[10px] text-slate-400 font-medium italic">Cust: {trx.customer_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-800">Rp {Number(trx.estimated_cost).toLocaleString('id-ID')}</p>
                  <p className="text-[9px] text-emerald-500 font-bold uppercase">Selesai</p>
                </div>
              </div>
            )) : (
              <div className="py-10">
                <EmptyState
                  icon={TrendingUp}
                  title="Belum Ada Pendapatan"
                  desc="Tidak ada unit servis yang selesai (Done) pada periode ini."
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 text-blue-700 flex items-start gap-4 no-print">
        <Wallet className="w-6 h-6 text-blue-400 shrink-0" />
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest">Informasi Laba Bersih</h4>
          <p className="text-[11px] leading-relaxed mt-1 font-medium text-blue-600/80">
            Laba dihitung dari <strong>Total Omzet Jasa</strong> yang sudah Done, dikurangi <strong>Total Harga Beli</strong> produk yang dikeluarkan melalui sistem Katalog/Stok.
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white; padding: 0; margin: 0; }
          #printable-area { width: 100%; max-width: none; }
          .rounded-[2.5rem], .rounded-[2rem], .rounded-3xl { border-radius: 1rem !important; }
        }
      `}} />
    </div>
  );
};

export default FinanceReport;