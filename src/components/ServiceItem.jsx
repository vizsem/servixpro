import React, { memo } from 'react';
import { Smartphone, Check, X, Edit3, Printer, Trash2 } from 'lucide-react';

const ServiceItem = memo(({ 
    service, 
    logs, 
    onShowPartPicker, 
    onDelete, 
    onUpdateStatus, 
    onSetActiveInvoice, 
    editingCostId, 
    setEditingCostId, 
    tempCost, 
    setTempCost, 
    onSaveCost 
}) => {
    const s = service;
    const isEditing = editingCostId === s.id;

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg w-fit uppercase tracking-tighter">Nota #{s.id?.slice(0, 8)}</span>
                    <h4 className="font-bold text-base text-slate-800">{s.unit_name}</h4>
                    <div className="flex gap-2 items-center">
                        <p className="text-[10px] text-slate-400 font-medium">Pemilik: <span className="text-slate-600 font-bold">{s.customer_name}</span></p>
                        <span className="text-[8px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">Teknisi: {s.technician_name || 'Umum'}</span>
                    </div>
                </div>
                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${s.status === 'Done' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>{s.status}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Keluhan Kerusakan</p>
                <p className="text-xs text-slate-600 italic leading-relaxed">"{s.issue}"</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed mt-4">
                    {s.customer_name} • {s.customer_phone}
                    {s.imei_sn && <span className="block text-blue-500 italic mt-0.5">SN/IMEI: {s.imei_sn}</span>}
                </p>
                <div className="mt-6 border-t border-slate-50 pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suku Cadang Terpasang</p>
                        <button onClick={() => onShowPartPicker(s)} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors">+ Tambah Part</button>
                    </div>
                    <div className="space-y-2">
                        {logs.length > 0 ? logs.map((log, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-50/50 p-2 rounded-xl text-[10px] font-bold">
                                <span className="text-slate-600">{log.spareparts?.name} (x{log.quantity})</span>
                                <span className="text-slate-400">Rp {(log.price_at_transaction * log.quantity).toLocaleString()}</span>
                            </div>
                        )) : <p className="text-[9px] text-slate-300 italic">Belum ada sparepart yang ditambahkan.</p>}
                    </div>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-6">
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Estimasi Biaya</p>
                        {isEditing ? (
                            <div className="flex items-center gap-2 mt-1">
                                <input type="number" value={tempCost} onChange={(e) => setTempCost(e.target.value)} className="w-24 bg-white border border-blue-200 rounded-lg px-2 py-1 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" autoFocus />
                                <button onClick={() => onSaveCost(s.id)} className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><Check size={14} /></button>
                                <button onClick={() => setEditingCostId(null)} className="p-1.5 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200 transition-colors"><X size={14} /></button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-black text-slate-800">Rp {Number(s.estimated_cost).toLocaleString()}</p>
                                <button onClick={() => { setEditingCostId(s.id); setTempCost(s.estimated_cost); }} className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={14} /></button>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => onSetActiveInvoice(s)} className="p-3 text-slate-300 hover:text-blue-500 transition-colors"><Printer size={20} /></button>
                        <button onClick={() => onDelete(s.id)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={20} /></button>
                        {s.status !== 'Done' && <button onClick={() => onUpdateStatus(s.id, s.status)} className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-slate-100">Update Status</button>}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ServiceItem;
