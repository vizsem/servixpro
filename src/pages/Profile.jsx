import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Save, LogOut } from 'lucide-react';
import { Toast } from '../components/UI';

const Profile = () => {
    const { session, signOut } = useAuth();
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [toast, setToast] = useState(null);

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: password });
            if (error) throw error;
            setToast({ message: "Password berhasil diperbarui!", type: "success" });
            setPassword('');
        } catch (error) {
            setToast({ message: error.message, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Profil Pengguna</h1>
            
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <User size={40} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Terdaftar</p>
                        <p className="text-xl font-black text-slate-800">{session?.user?.email}</p>
                        <p className="text-xs text-slate-500 mt-1">User ID: {session?.user?.id}</p>
                    </div>
                </div>

                <div className="border-t border-slate-50 pt-8">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Lock size={20} className="text-blue-500" /> Ganti Password
                    </h3>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Password Baru</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="Minimal 6 karakter"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-blue-100 font-bold"
                                minLength={6}
                                required
                            />
                        </div>
                        <button 
                            disabled={loading}
                            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <Save size={16} /> Update Password
                        </button>
                    </form>
                </div>

                <div className="border-t border-slate-50 pt-8">
                    <button 
                        onClick={signOut}
                        className="w-full bg-rose-50 text-rose-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                    >
                        <LogOut size={16} /> Keluar Aplikasi
                    </button>
                </div>
            </div>
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
};

export default Profile;
