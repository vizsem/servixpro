import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, Clock, Package, BarChart3, LogOut, Zap, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Toast, BackToTop } from '../components/UI';

const DashboardLayout = () => {
    const { signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Simple toast state placeholder - ideally this should be in a global UI context
    // For now, we'll keep it local or rely on pages to show toasts
    // Or we can move ToastContext later. 
    // I'll leave Toast handling to individual pages for now or create a context if needed.
    // But the original App had it global. Let's make a simple Context for UI later if needed.

    const navItems = [
        { id: 'dashboard', path: '/dashboard', icon: LayoutGrid, label: 'Home' },
        { id: 'servis', path: '/services', icon: Clock, label: 'Servis' },
        { id: 'stok', path: '/stock', icon: Package, label: 'Stok' },
        { id: 'laporan', path: '/finance', icon: BarChart3, label: 'Laporan' },
        { id: 'profile', path: '/profile', icon: User, label: 'Profil' }
    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 transition-colors pb-24 lg:pb-0">
            <BackToTop />

            <nav className="fixed z-50 bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex justify-between items-center lg:top-0 lg:left-0 lg:bottom-0 lg:w-24 lg:flex-col lg:border-r lg:border-t-0 lg:px-0 lg:py-10 shadow-2xl lg:shadow-sm">
                <div className="hidden lg:flex flex-col items-center mb-10">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                        <Zap size={24} fill="currentColor" />
                    </div>
                </div>
                <div className="flex w-full justify-around lg:flex-col lg:gap-6 lg:w-auto">
                    {navItems.map((item) => (
                        <Link 
                            key={item.id} 
                            to={item.path} 
                            className={`flex flex-col lg:flex-row items-center gap-2 p-3 lg:p-4 rounded-2xl transition-all relative group ${isActive(item.path) ? 'text-blue-600 bg-blue-50 lg:bg-blue-600 lg:text-white lg:shadow-lg lg:shadow-blue-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                        >
                            <item.icon size={22} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                            <span className="text-[9px] lg:hidden font-black uppercase tracking-tighter">{item.label}</span>
                            {isActive(item.path) && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full lg:hidden" />}
                        </Link>
                    ))}
                </div>
                <button 
                    onClick={handleLogout} 
                    className="hidden lg:flex items-center justify-center p-4 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all mt-auto" 
                    title="Logout"
                >
                    <LogOut size={22} />
                </button>
            </nav>

            <div className="lg:ml-24 transition-all pb-32">
                <main className="max-w-7xl mx-auto p-4 lg:p-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
