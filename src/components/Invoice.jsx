import React from 'react';
import {
  Printer,
  MessageCircle,
  ArrowLeft,
  MapPin,
  Phone,
  Calendar,
  Hash,
  ShieldCheck,
  CheckCircle2,
  Share2
} from 'lucide-react';

const Invoice = ({ data, onBack }) => {
  // Cegah error jika data belum masuk
  if (!data) return null;

  const today = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const sendWhatsApp = () => {
    // Bersihkan nomor HP (Hanya angka)
    let phone = data.customer_phone ? data.customer_phone.replace(/[^0-9]/g, '') : '';
    if (phone.startsWith('0')) phone = '62' + phone.slice(1);

    const message = `*NOTA PENERIMAAN SERVIS - SERVIXPRO*%0A` +
      `--------------------------------------%0A` +
      `📌 *No. Nota:* ${data.id?.slice(0, 8).toUpperCase()}%0A` +
      `👤 *Pelanggan:* ${data.customer_name}%0A` +
      `📱 *Unit:* ${data.unit_name}${data.imei_sn ? ' (' + data.imei_sn + ')' : ''}%0A` +
      `🛠️ *Keluhan:* ${data.issue}%0A` +
      `💰 *Estimasi:* Rp ${Number(data.estimated_cost).toLocaleString('id-ID')}%0A` +
      `--------------------------------------%0A` +
      `Terima kasih telah mempercayakan servis Anda kepada kami.`;

    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 md:py-10 animate-in fade-in zoom-in-95 duration-300">
      {/* Tombol Navigasi */}
      <div className="max-w-md mx-auto p-4 flex gap-2 print:hidden">
        <button onClick={onBack} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <button onClick={() => window.print()} className="flex-1 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg">
          <Printer className="w-5 h-5" /> Cetak Nota
        </button>
        <button onClick={sendWhatsApp} className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg shadow-emerald-200">
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Konten Nota */}
      <div className="max-w-md mx-auto bg-white p-8 shadow-2xl md:rounded-[3rem] print:shadow-none print:p-0">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-2xl text-white mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 uppercase">ServixPro</h1>
          <p className="text-[10px] text-slate-500 font-bold tracking-widest mt-1">REPAIR SERVICE</p>
        </div>

        <div className="border-t-2 border-dashed border-slate-100 my-6"></div>

        <div className="space-y-4 mb-8 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold uppercase">No. Nota</span>
            <span className="font-black text-slate-800 tracking-widest">
              {/* Mengambil 8 karakter pertama dari ID Supabase dan menjadikannya HURUF BESAR */}
              {data?.id ? data.id.toString().slice(0, 8).toUpperCase() : 'LOADING...'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold uppercase">Tanggal</span>
            <span className="font-bold text-slate-800">{today}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold uppercase">Pelanggan</span>
            <span className="font-bold text-slate-800">{data.customer_name}</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-3xl p-5 mb-8 border border-slate-100">
          <p className="text-[10px] font-black text-blue-600 uppercase mb-3">Unit & Keluhan</p>
          <h3 className="text-sm font-black text-slate-800 mb-1">{data.unit_name}</h3>
          {data.imei_sn && <p className="text-[9px] font-bold text-slate-400 mb-2">IMEI/SN: {data.imei_sn}</p>}
          <p className="text-xs text-slate-500 italic">"{data.issue}"</p>
        </div>

        <div className="flex justify-between items-center bg-slate-900 text-white p-5 rounded-3xl shadow-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Estimasi</span>
          <p className="text-xl font-black">Rp {Number(data.estimated_cost).toLocaleString('id-ID')}</p>
        </div>

        <div className="mt-10 text-center text-[9px] text-slate-400 leading-relaxed uppercase font-bold tracking-tighter">
          Nota ini adalah bukti sah penerimaan unit.<br />Harap dibawa saat pengambilan.
        </div>
      </div>
    </div>
  );
};

export default Invoice;