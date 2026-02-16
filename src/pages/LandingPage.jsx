import React from 'react';
import { useNavigate } from 'react-router-dom';
import MarketingLanding from '../components/MarketingLanding';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const navigate = useNavigate();
    const { signInWithGoogle } = useAuth();

    return (
        <MarketingLanding
            onLogin={signInWithGoogle}
            onTrack={() => navigate('/tracking')}
            onCatalog={() => navigate('/public-store')}
        />
    );
};

export default LandingPage;
