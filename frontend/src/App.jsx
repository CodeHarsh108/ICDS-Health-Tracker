import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import SyncStatus from './components/SyncStatus';
import { initSyncListener } from './services/syncService';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Centers from './pages/Centers';
import Workers from './pages/Workers';
import Beneficiaries from './pages/Beneficiaries';
import BeneficiaryProfile from './pages/BeneficiaryProfile';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Loading ICDS Tracker...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />

      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/centers" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}>
            <Centers />
          </ProtectedRoute>
        } />
        <Route path="/workers" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}>
            <Workers />
          </ProtectedRoute>
        } />
        <Route path="/beneficiaries" element={<Beneficiaries />} />
        <Route path="/beneficiaries/:id" element={<BeneficiaryProfile />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
    </Routes>
  );
}

export default function App() {
  // Initialize offline sync listener on app start
  useEffect(() => {
    initSyncListener();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <SyncStatus />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: "'Manrope', sans-serif",
              fontSize: '0.875rem',
              borderRadius: '12px',
              padding: '12px 16px',
              boxShadow: '0 4px 20px rgba(27, 94, 32, 0.12)',
            },
            success: {
              iconTheme: { primary: '#1B5E20', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}