import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { buildReportHTML, openPrint } from '../utils/report';
import { downloadApiFile } from '../utils/download';
import { apiRequest } from '../api/client';
import { useToast } from '../components/Toast';
import {
  getUsers,
  updateUser as updateUserApi,
  deleteUser as deleteUserApi,
  createUser,
  resetMechanicPasswordByNIC
} from '../api/users';

import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, FileBarChart, Settings, Plus, Download } from 'lucide-react';

// Tab Components
import OverviewTab from './DashboardTabs/OverviewTab';
import UserManagementTab from './DashboardTabs/UserManagementTab';
import ReportsTab from './DashboardTabs/ReportsTab';

const Dashboard = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { show } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);

  // Customers/Receptionists State
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [receptionists, setReceptionists] = useState([]);
  const [receptionistsLoading, setReceptionistsLoading] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptsResp, invResp] = await Promise.all([
          apiRequest('/appointments'),
          apiRequest('/invoices')
        ]);

        const upcoming = (apptsResp.data || [])
          .filter(a => new Date(a.preferredDate) >= new Date())
          .sort((a, b) => new Date(a.preferredDate) - new Date(b.preferredDate));

        setAppointments(upcoming);
        dispatch({ type: 'SET_INVOICES', payload: invResp.data || [] });
      } catch (e) {
        console.error('Initial fetch failed:', e);
      }
    };
    fetchData();
  }, [dispatch]);

  const fetchCustomers = useCallback(async () => {
    try {
      setCustomersLoading(true);
      const resp = await getUsers('customer');
      setCustomers(resp.data || []);
    } catch (e) {
      show('Failed to load customers', 'error');
    } finally {
      setCustomersLoading(false);
    }
  }, [show]);

  const fetchReceptionists = useCallback(async () => {
    try {
      setReceptionistsLoading(true);
      const resp = await getUsers('receptionist');
      setReceptionists(resp.data || []);
    } catch (e) {
      show('Failed to load staff', 'error');
    } finally {
      setReceptionistsLoading(false);
    }
  }, [show]);

  useEffect(() => {
    if (activeTab === 'users' && state?.user?.role === 'owner') {
      fetchCustomers();
      fetchReceptionists();
    }
  }, [activeTab, state?.user?.role, fetchCustomers, fetchReceptionists]);

  // Report Generators
  const genReport = async (endpoint, title, cols, mapper, filename) => {
    try {
      const resp = await apiRequest(endpoint);
      const data = Array.isArray(resp?.data) ? resp.data : [];
      const rows = data.map(mapper);
      const html = buildReportHTML({ title, columns: cols, rows });
      openPrint(html, filename);
    } catch (e) {
      show(`Failed to generate ${title}`, 'error');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
    { id: 'users', label: 'Staff & Clients', icon: Users, role: ['owner'] },
    { id: 'reports', label: 'Intelligence', icon: FileBarChart, role: ['owner', 'receptionist'] },
  ].filter(t => !t.role || t.role.includes(state?.user?.role));

  return (
    <div className="min-h-screen space-y-12">
      {/* Header section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-2">Management Dashboard</p>
          <h1 className="text-6xl font-black text-slate-800 dark:text-white tracking-tighter">
            Mission <span className="gradient-text">Control</span>
          </h1>
        </motion.div>

        <div className="flex gap-4 p-1.5 glass-panel rounded-[1.5rem] w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/40'
                  : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Tab Content */}
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <OverviewTab
                state={state}
                appointments={appointments}
                navigate={navigate}
              />
            )}

            {activeTab === 'users' && (
              <UserManagementTab
                customers={customers}
                receptionists={receptionists}
                onResetMechanicPassword={(nic) => {
                  resetMechanicPasswordByNIC(nic).then(() => show('Password reset success', 'success'));
                }}
                show={show}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsTab
                onGenerateCars={() => genReport('/cars', 'Car Profiles', ['Plate', 'Owner', 'Make', 'Model'], c => [c.licensePlate, c.customerName, c.make, c.model], 'cars.pdf')}
                onGenerateJobs={() => genReport('/jobs', 'Workshop Jobs', ['ID', 'Status', 'Date'], j => [j.id, j.status, new Date(j.createdAt).toLocaleDateString()], 'jobs.pdf')}
                onGenerateInventory={() => genReport('/inventory', 'Inventory Status', ['Item', 'Qty', 'Price'], i => [i.name, i.quantity, i.price], 'inventory.pdf')}
                onGenerateMechanics={() => genReport('/mechanics', 'Staff Directory', ['Name', 'Email', 'Role'], m => [m.name, m.email, 'Mechanic'], 'staff.pdf')}
                onGeneratePayments={() => genReport('/payments', 'Financials', ['ID', 'Amount', 'Status'], p => [p.id, p.amount, p.status], 'earnings.pdf')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
