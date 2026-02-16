import React from 'react';
import { useNavigate } from 'react-router-dom';
import AddServiceForm from '../components/AddServiceForm';
import { useData } from '../context/DataContext';

const AddService = () => {
    const navigate = useNavigate();
    const { refreshData } = useData();

    const handleComplete = async () => {
        await refreshData();
        navigate('/services');
    };

    const handleClose = () => {
        navigate('/dashboard'); // Or back to services? Defaulting to dashboard as per previous flow roughly
    };

    return <AddServiceForm onComplete={handleComplete} onClose={handleClose} />;
};

export default AddService;
