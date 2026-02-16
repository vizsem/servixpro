import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicStore from '../components/PublicStore';
import { Skeleton } from '../components/UI';

const PublicStorePage = () => {
    const navigate = useNavigate();

    return (
        <Suspense fallback={<div className="p-10"><Skeleton className="h-64 rounded-[2.5rem]" /></div>}>
            <PublicStore onBack={() => navigate('/')} />
        </Suspense>
    );
};

export default PublicStorePage;
