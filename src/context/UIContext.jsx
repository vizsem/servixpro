import React, { createContext, useState, useContext, useCallback } from 'react';
import { Toast } from '../components/UI';

const UIContext = createContext({});

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
    }, []);

    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    return (
        <UIContext.Provider value={{ showToast }}>
            {children}
            {toast && <Toast {...toast} onClose={hideToast} />}
        </UIContext.Provider>
    );
};
