import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
    Clock, ArrowLeft, Smartphone, Check, X, MapPin, Search 
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { EmptyState, Toast } from '../components/UI';
import Invoice from '../components/Invoice';
import ServiceItem from '../components/ServiceItem';

const ServiceQueue = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { services, stockLogs, inventory, refreshData } = useData();
    const { session } = useAuth();
    
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [statusFilter] = useState('All');
    const [activeInvoice, setActiveInvoice] = useState(null);
    const [showPartPicker, setShowPartPicker] = useState(null);
    const [pickerSearch, setPickerSearch] = useState('');
    const [editingCostId, setEditingCostId] = useState(null);
    const [tempCost, setTempCost] = useState('');
    const [toast, setToast] = useState(null);

    const showNotify = useCallback((message, type = 'success') => {
        setToast({ message, type });
    }, []);

    const updateStatus = useCallback(async (id, currentStatus) => {
        const statusSequence = ['Pending', 'Checking', 'Working', 'Done'];
        const nextStatus = statusSequence[statusSequence.indexOf(currentStatus) + 1];
        if (nextStatus) {
            const { error } = await supabase.from('services').update({ status: nextStatus }).eq('id', id);
            if (!error) refreshData();
        }
    }, [refreshData]);

    const handleSaveCost = useCallback(async (id) => {
        const { error } = await supabase.from('services').update({ estimated_cost: Number(tempCost) }).eq('id', id);
        if (!error) showNotify("Nominal berhasil diperbarui");
        else showNotify("Gagal update nominal: " + error.message, 'error');
        setEditingCostId(null);
    }, [tempCost, showNotify]);

    const handleDelete = useCallback(async (id) => {
        if (confirm('Hapus unit ini?')) { 
            await supabase.from('services').delete().eq('id', id);
            refreshData();
        }
    }, [refreshData]);

    const handleAddPart = useCallback(async (item) => {
        if (!session || !showPartPicker) return;
        
        await supabase.from('location_inventory')
            .update({ quantity: item.quantity - 1 })
            .eq('product_id', item.product_id)
            .eq('location_id', item.location_id);
            
        await supabase.from('stock_logs').insert([{ 
            user_id: session.user.id, 
            product_id: item.product_id, 
            location_id: item.location_id, 
            type: 'Keluar', 
            quantity: 1, 
            price_at_transaction: item.spareparts.price_sell, 
            reference_invoice: showPartPicker.id, 
            notes: `[TRANSFER] ${item.locations?.name || 'Cabang'} -> Servis: ${showPartPicker.unit_name}` 
        }]);
        
        const newCost = Number(showPartPicker.estimated_cost) + Number(item.spareparts.price_sell); 
        await supabase.from('services').update({ estimated_cost: newCost }).eq('id', showPartPicker.id); 
        
        setShowPartPicker(null); 
        refreshData();
    }, [session, showPartPicker, refreshData]);

    const filteredServices = useMemo(() => {
        return services.filter(s => {
            const matchesSearch = s.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  s.unit_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  s.id?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [services, searchTerm, statusFilter]);

    // Pre-calculate logs for each service to avoid O(N*M) in render
    const logsByService = useMemo(() => {
        const map = {};
        stockLogs.forEach(log => {
            if (log.reference_invoice) {
                if (!map[log.reference_invoice]) map[log.reference_invoice] = [];
                map[log.reference_invoice].push(log);
            }
        });
        return map;
    }, [stockLogs]);

    const groupedInventory = useMemo(() => {
        return inventory.filter(item => item.spareparts?.name?.toLowerCase().includes(pickerSearch.toLowerCase()))
            .reduce((acc, curr) => { 
                const name = curr.spareparts.name; 
                if (!acc[name]) acc[name] = []; 
                acc[name].push(curr); 
                return acc; 
            }, {});
    }, [inventory, pickerSearch]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
            
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800 tracking-tight">
                    <Clock size={22} className="text-blue-600" /> Antrean Unit Masuk
                </h2>
                <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                    <ArrowLeft size={24} />
                </button>
            </div>
            
            <div className="relative">
                 <input 
                    type="text" 
                    placeholder="Filter..." 
                    className="w-full bg-white border border-slate-100 rounded-xl py-3 px-4 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredServices.length > 0 ? filteredServices.map(s => (
                    <ServiceItem
                        key={s.id}
                        service={s}
                        logs={logsByService[s.id] || []}
                        onShowPartPicker={setShowPartPicker}
                        onDelete={handleDelete}
                        onUpdateStatus={updateStatus}
                        onSetActiveInvoice={setActiveInvoice}
                        editingCostId={editingCostId}
                        setEditingCostId={setEditingCostId}
                        tempCost={tempCost}
                        setTempCost={setTempCost}
                        onSaveCost={handleSaveCost}
                    />
                )) : <div className="col-span-full"><EmptyState icon={Smartphone} title="Antrean Kosong" desc="Belum ada unit servis yang masuk hari ini." actionText="Buat Antrean" onAction={() => navigate('/services/new')} /></div>}
            </div>

            {showPartPicker && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl relative animate-in zoom-in-95 overflow-hidden">
                        <button onClick={() => setShowPartPicker(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X size={20} /></button>
                        <h2 className="text-2xl font-bold mb-8 tracking-tight text-slate-800">Pilih Sparepart</h2>
                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input type="text" placeholder="Cari nama sparepart..." value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all" />
                        </div>
                        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {Object.entries(groupedInventory).map(([partName, variants]) => (
                                <div key={partName} className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{partName}</p>
                                    <div className="space-y-2">
                                        {variants.map((item) => (
                                            <button key={item.product_id + item.location_id} disabled={item.quantity <= 0} onClick={() => handleAddPart(item)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border-2 ${item.quantity > 0 ? 'bg-white border-transparent hover:border-blue-500 hover:shadow-lg' : 'bg-slate-100 border-transparent opacity-50 cursor-not-allowed'}`}>
                                                <div className="text-left">
                                                    <p className="text-[10px] font-black text-slate-800 flex items-center gap-2"><MapPin size={10} className="text-blue-500" />{item.locations?.name || 'Toko Utama'}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold mt-1">Tersedia: {item.quantity} Unit</p>
                                                </div>
                                                <div className="text-right"><p className="text-xs font-black text-blue-600">Rp {item.spareparts.price_sell.toLocaleString()}</p></div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {inventory.length === 0 && <p className="text-center py-10 text-xs text-slate-400 italic">Data inventori belum tersedia.</p>}
                        </div>
                    </div>
                </div>
            )}

            {activeInvoice && (
                <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
                    <Invoice data={activeInvoice} onBack={() => setActiveInvoice(null)} />
                </div>
            )}
        </div>
    );
};

export default ServiceQueue;
