import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap } from 'lucide-react';

const LoadingScreen = () => (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="flex justify-center mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-200 animate-bounce">
                <Zap size={32} fill="currentColor" />
            </div>
        </div>
        <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">ServixPro v4.0 • Loading...</p>
      </div>
    </div>
);

const ProtectedRoute = ({ children }) => {
    const { session, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingScreen />;
    }

    if (!session) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
