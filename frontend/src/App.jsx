import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider, useToast } from './components/Toast';
import { setApiErrorHandler } from './api/client';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import CarProfile from './pages/CarProfile';
import JobSheets from './pages/JobSheets';
import Inventory from './pages/Inventory';
import Mechanics from './pages/Mechanics';
import Reports from './pages/Reports';
import MechanicView from './pages/MechanicView';
import CustomerDashboard from './pages/CustomerDashboard';
import Invoices from './pages/Invoices';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Inner App component to access toast context
const AppContent = () => {
  const { show } = useToast();
  const location = useLocation();

  useEffect(() => {
    setApiErrorHandler((err) => {
      show(err.message || 'Network operation failed', 'error');
    });
  }, [show]);

  return (
    <div className="App">
      <div className="bg-blue-600 text-white text-center py-2 font-black text-xs uppercase tracking-widest fixed top-0 left-0 right-0 z-[1000]">
        PUEFIX GARAGE SYSTEM - OPERATIONAL
      </div>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
          <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
          <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['owner', 'receptionist']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="cars" element={<PageTransition><CarProfile /></PageTransition>} />
            <Route path="jobs" element={<PageTransition><JobSheets /></PageTransition>} />
            <Route path="inventory" element={<PageTransition><Inventory /></PageTransition>} />
            <Route path="mechanics" element={<PageTransition><Mechanics /></PageTransition>} />
            <Route path="reports" element={<PageTransition><Reports /></PageTransition>} />
            <Route path="invoices" element={<PageTransition><Invoices /></PageTransition>} />
          </Route>

          {/* Specialized Views */}
          <Route
            path="/mechanic"
            element={
              <ProtectedRoute allowedRoles={['mechanic', 'owner']}>
                <PageTransition><MechanicView /></PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <PageTransition><CustomerDashboard /></PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer/invoices"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <PageTransition><Invoices /></PageTransition>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <AppProvider>
            <AppContent />
          </AppProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;

