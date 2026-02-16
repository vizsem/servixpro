import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { UIProvider } from './context/UIContext';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import PublicStorePage from './pages/PublicStorePage';
import TrackingPage from './pages/TrackingPage';
import { Skeleton } from './components/UI';
import { Zap } from 'lucide-react';
// Lazy loaded components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ServiceQueue = lazy(() => import('./pages/ServiceQueue'));
const AddService = lazy(() => import('./pages/AddService'));
const Profile = lazy(() => import('./pages/Profile'));
const StockManagement = lazy(() => import('./components/StockManagement'));
const FinanceReport = lazy(() => import('./components/FinanceReport'));
const HRDManagement = lazy(() => import('./components/HRDManagement'));
const ExpenseManagement = lazy(() => import('./components/ExpenseManagement'));
const StoreKatalog = lazy(() => import('./components/StoreKatalog'));

const LoadingFallback = () => (
    <div className="space-y-6 p-10">
      <Skeleton className="h-64 rounded-[2.5rem]" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
      </div>
    </div>
);

const BootLoading = () => (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="flex justify-center mb-10"><div className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-200 animate-bounce"><Zap size={32} fill="currentColor" /></div></div>
        <div className="space-y-4"><Skeleton className="h-4 w-1/2 mx-auto" /><Skeleton className="h-10 w-full" /><Skeleton className="h-64 w-full rounded-[2.5rem]" /></div>
        <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">ServixPro v4.0 • Booting Systems</p>
      </div>
    </div>
);

const RootRoute = () => {
    const { session, loading } = useAuth();
    if (loading) return <BootLoading />;
    return session ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};

const App = () => {
  return (
    <UIProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<RootRoute />} />
                <Route path="/tracking" element={<TrackingPage />} />
                <Route path="/public-store" element={<PublicStorePage />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/services" element={<ServiceQueue />} />
                  <Route path="/services/new" element={<AddService />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/stock" element={<StockManagement />} />
                  <Route path="/finance" element={<FinanceReport />} />
                  <Route path="/hrd" element={<HRDManagement />} />
                  <Route path="/expenses" element={<ExpenseManagement />} />
                  <Route path="/store-admin" element={<StoreKatalog />} />
                </Route>
                
                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Router>
        </DataProvider>
      </AuthProvider>
    </UIProvider>
  );
};

export default App;
