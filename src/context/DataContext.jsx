import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const DataContext = createContext({});

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const { session } = useAuth();
    const [services, setServices] = useState([]);
    const [stockLogs, setStockLogs] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    const fetchAllData = useCallback(async () => {
        if (!session?.user?.id) return;
        
        setLoadingData(true);
        try {
            const userId = session.user.id;
            const [
                { data: sData },
                { data: lData },
                { data: lowStockData },
                { data: invData }
            ] = await Promise.all([
                supabase.from('services').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
                supabase.from('stock_logs').select('*, spareparts(name)').eq('user_id', userId).order('created_at', { ascending: false }),
                supabase.from('location_inventory').select('*, spareparts!inner(name, user_id)').eq('spareparts.user_id', userId).lt('quantity', 5).limit(5),
                supabase.from('location_inventory').select('*, spareparts!inner(*), locations(*)').eq('spareparts.user_id', userId)
            ]);

            if (sData) setServices(sData);
            if (lData) setStockLogs(lData);
            if (lowStockData) setLowStockItems(lowStockData.map(i => ({ name: i.spareparts?.name, quantity: i.quantity })));
            if (invData) setInventory(invData);
        } catch (error) {
            console.error("Error fetching data:", error.message);
        } finally {
            setLoadingData(false);
        }
    }, [session]);

    useEffect(() => {
        if (session) {
            fetchAllData();
        } else {
            setServices([]);
            setStockLogs([]);
            setInventory([]);
            setLowStockItems([]);
        }
    }, [session, fetchAllData]);

    const value = React.useMemo(() => ({
        services, 
        stockLogs, 
        lowStockItems, 
        inventory, 
        loadingData, 
        refreshData: fetchAllData 
    }), [services, stockLogs, lowStockItems, inventory, loadingData, fetchAllData]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
