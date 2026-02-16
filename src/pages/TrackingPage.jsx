import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TrackingServis from '../components/TrackingServis';
import { Skeleton } from '../components/UI';

const TrackingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white border-b p-4 flex items-center gap-3">
                <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-xl">
                    <ArrowLeft size={20} />
                </button>
                <span className="font-bold">Lacak Status</span>
            </nav>
            <Suspense fallback={<div className="p-10"><Skeleton className="h-64 rounded-[2.5rem]" /></div>}>
                <TrackingServis />
            </Suspense>
        </div>
    );
};

export default TrackingPage;
