import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
    DollarSign, Plus, Trash2, Calendar,
    Tag, Loader2, AlertCircle, TrendingDown
} from 'lucide-react';

const ExpenseManagement = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Operasional',
        date: new Date().toISOString().split('T')[0]
    });

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .eq('user_id', session.user.id)
                .order('date', { ascending: false });

            if (error) throw error;
            setExpenses(data || []);
        } catch (err) {
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const { error } = await supabase.from('expenses').insert([{
                user_id: session.user.id,
                title: formData.title,
                amount: parseInt(formData.amount),
                category: formData.category,
                date: formData.date
            }]);

            if (error) throw error;
            setShowAdd(false);
            setFormData({ title: '', amount: '', category: 'Operasional', date: new Date().toISOString().split('T')[0] });
            fetchExpenses();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Hapus nota pengeluaran ini?')) {
            await supabase.from('expenses').delete().eq('id', id);
            fetchExpenses();
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-center px-2">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <TrendingDown className="text-rose-600 w-7 h-7" /> Pengeluaran
                    </h2>
                    <p className="text-slate-500 text-xs font-bold mt-1">Biaya operasional & toko</p>
                </div>
                <button
                    onClick={() => setShowAdd(true)}
                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all"
                >
                    <Plus size={16} /> Catat Pengeluaran
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {expenses.map((ex) => (
                    <div key={ex.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative group transition-all hover:shadow-md">
                        <button
                            onClick={() => handleDelete(ex.id)}
                            className="absolute top-6 right-6 text-slate-300 hover:text-rose-500 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                                <DollarSign size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{ex.category}</p>
                                <h3 className="text-sm font-black text-slate-800 uppercase line-clamp-1">{ex.title}</h3>
                            </div>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Jumlah</p>
                                <p className="text-lg font-black text-slate-800">Rp {ex.amount.toLocaleString()}</p>
                            </div>
                            <p className="text-[10px] font-bold text-slate-300">{new Date(ex.date).toLocaleDateString('id-ID')}</p>
                        </div>
                    </div>
                ))}
                {expenses.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center">
                        <TrendingDown className="mx-auto text-slate-100 mb-4" size={64} />
                        <p className="text-slate-400 font-medium italic">Belum ada catatan pengeluaran.</p>
                    </div>
                )}
            </div>

            {showAdd && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-10 shadow-2xl relative animate-in zoom-in-95">
                        <button onClick={() => setShowAdd(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900">
                            <Plus className="rotate-45" size={20} />
                        </button>
                        <h2 className="text-xl font-bold mb-6 tracking-tight text-slate-800">Catat Pengeluaran</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Keterangan</label>
                                <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 text-sm outline-none font-bold" placeholder="Contoh: Bayar Listrik" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Kategori</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 text-sm outline-none font-bold">
                                    <option>Operasional</option>
                                    <option>Sewa Tempat</option>
                                    <option>Gaji Karyawan</option>
                                    <option>Alat Kerja</option>
                                    <option>Lainnya</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Nominal (Rp)</label>
                                    <input required type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 text-sm outline-none font-bold" placeholder="0" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Tanggal</label>
                                    <input required type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-xs outline-none font-bold" />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-rose-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100 mt-4 hover:bg-rose-700 transition-all">
                                Simpan Pengeluaran
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseManagement;
