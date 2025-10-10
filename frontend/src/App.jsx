import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/Toast';
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
import PaymentHistory from './pages/PaymentHistory';
import SplashDemoPage from './pages/SplashDemoPage';
import HoverGradientNavDemo from './pages/HoverGradientNavDemo';
import NotificationPopoverDemo from './pages/NotificationPopoverDemo';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ToastProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/splash-demo" element={<SplashDemoPage />} />
                <Route path="/hover-nav-demo" element={<HoverGradientNavDemo />} />
                <Route path="/notification-demo" element={<NotificationPopoverDemo />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['owner', 'receptionist']}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="cars" element={<CarProfile />} />
                  <Route path="jobs" element={<JobSheets />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="mechanics" element={<Mechanics />} />
                  <Route path="reports" element={<Reports />} />
                </Route>

                {/* Mechanic Route - Allow access for owners and mechanics for testing */}
                <Route
                  path="/mechanic"
                  element={
                    <ProtectedRoute allowedRoles={['mechanic', 'owner']}>
                      <MechanicView />
                    </ProtectedRoute>
                  }
                />

                {/* Customer Routes */}
                <Route
                  path="/customer"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/payments"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <PaymentHistory />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </Router>
        </ToastProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;

