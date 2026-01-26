import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Lock, Mail, Loader2 } from 'lucide-react';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <Lock className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-800">ServixPro</h1>
          <p className="text-slate-400 text-sm mt-1">Management System Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="email" 
              placeholder="Email Admin" 
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 text-sm"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 text-sm"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Masuk ke System"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;