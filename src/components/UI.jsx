import React from 'react';
import { AlertCircle, CheckCircle2, Package, ChevronUp } from 'lucide-react';

export const Skeleton = ({ className }) => (
    <div className={`skeleton ${className}`} />
);

// eslint-disable-next-line no-unused-vars
export const EmptyState = ({ icon: Icon, title, desc, actionText, onAction }) => {
    return (
        <div className="flex flex-col items-center justify-center p-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-6">
                <Icon size={40} />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2 uppercase italic tracking-tight">{title}</h3>
            <p className="text-xs text-slate-400 font-medium max-w-xs mb-8 leading-relaxed">{desc}</p>
            {onAction && (
                <button onClick={onAction} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all">
                    {actionText}
                </button>
            )}
        </div>
    );
};

export const Toast = ({ message, type = 'success', onClose }) => {
    React.useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-10 duration-500">
            <div className={`${type === 'error' ? 'bg-rose-600' : 'bg-slate-900'} text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10`}>
                {type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} className="text-emerald-400" />}
                <span className="text-[10px] font-black uppercase tracking-widest">{message}</span>
            </div>
        </div>
    );
};

export const Breadcrumbs = ({ items }) => (
    <nav className="flex items-center gap-2 mb-6 px-2 overflow-x-auto scrollbar-none whitespace-nowrap">
        {items.map((item, idx) => (
            <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-300 text-[10px]">/</span>}
                <button
                    onClick={item.onClick}
                    disabled={!item.onClick}
                    className={`text-[10px] font-black uppercase tracking-widest transition-colors ${item.onClick ? 'text-blue-600 hover:text-blue-800' : 'text-slate-400'}`}
                >
                    {item.label}
                </button>
            </React.Fragment>
        ))}
    </nav>
);

export const BackToTop = () => {
    const [visible, setVisible] = React.useState(false);

    React.useEffect(() => {
        const toggleVisible = () => setVisible(window.scrollY > 300);
        window.addEventListener('scroll', toggleVisible);
        return () => window.removeEventListener('scroll', toggleVisible);
    }, []);

    if (!visible) return null;

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-6 lg:bottom-10 lg:right-10 z-[60] bg-slate-900 text-white p-4 rounded-2xl shadow-2xl hover:bg-black active:scale-90 transition-all animate-in fade-in slide-in-from-bottom-5"
        >
            <ChevronUp size={20} />
        </button>
    );
};
