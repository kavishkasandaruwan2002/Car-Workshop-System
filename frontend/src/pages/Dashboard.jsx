import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { buildReportHTML, openPrint } from '../utils/report';
import { downloadApiFile } from '../utils/download';
import { apiRequest } from '../api/client';
import { ScrollReveal, StaggerContainer, StaggerItem, AnimatedCounter } from '@/components/ui/ScrollReveal';
import {
  Car,
  Wrench,
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Search,
  Edit,
  Trash2,
  X,
  Check,
  UserPlus,
  Key,
  FileText,
  Calendar,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useToast } from '../components/Toast';
import { getUsers, updateUser as updateUserApi, deleteUser as deleteUserApi, createUser, resetMechanicPasswordByNIC } from '../api/users';

const Dashboard = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const { show } = useToast();

  // Customers management state (owner only)
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [editedCustomer, setEditedCustomer] = useState({ name: '', email: '', phone: '', address: '', nic: '' });

  // Receptionists management (owner only)
  const [receptionists, setReceptionists] = useState([]);
  const [receptionistsLoading, setReceptionistsLoading] = useState(false);
  const [receptionistSearch, setReceptionistSearch] = useState('');
  const [editingReceptionistId, setEditingReceptionistId] = useState(null);
  const [editedReceptionist, setEditedReceptionist] = useState({ name: '', email: '', phone: '', address: '', nic: '' });
  const [newRec, setNewRec] = useState({ name: '', email: '', phone: '', address: '', nic: '', password: '' });

  // Mechanic password reset (owner only)
  const [mechanicNIC, setMechanicNIC] = useState('');

  // Create Owner/Mechanic user accounts (owner only)
  const [newOwner, setNewOwner] = useState({ name: '', email: '', nic: '', password: '' });
  const [newMechanicUser, setNewMechanicUser] = useState({ name: '', email: '', phone: '', nic: '', password: '' });

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiRequest('/appointments');
        const allAppointments = resp.data || [];
        const upcomingAppointments = allAppointments
          .filter(a => new Date(a.preferredDate) >= new Date())
          .sort((a, b) => new Date(a.preferredDate) - new Date(b.preferredDate));
        setAppointments(upcomingAppointments);
      } catch (e) {
        console.error('Failed to load appointments:', e);
      }
    })();
  }, []);

  useEffect(() => {
    if (state?.user?.role === 'owner') {
      fetchCustomers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerSearch]);

  useEffect(() => {
    if (state?.user?.role === 'owner') {
      fetchReceptionists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receptionistSearch]);

  async function fetchCustomers() {
    try {
      setCustomersLoading(true);
      const resp = await getUsers({ search: customerSearch, role: 'customer', limit: 100 });
      setCustomers(resp?.data || []);
    } catch (err) {
      show('Failed to load customers', 'error');
    } finally {
      setCustomersLoading(false);
    }
  }

  const beginEditCustomer = (c) => {
    setEditingCustomerId(c._id);
    setEditedCustomer({
      name: c.name || '',
      email: c.email || '',
      phone: c.phone || '',
      address: c.address || '',
      nic: c.nic || ''
    });
  };

  // Reports Download (Owner only)
  const downloadCarsReport = async () => {
    try { await downloadApiFile('/reports/cars', 'car-profiles-report.pdf'); }
    catch (e) { show(e?.message || 'Failed to download car profiles PDF', 'error'); }
  };
  const downloadJobsReport = async () => {
    try { await downloadApiFile('/reports/jobs', 'job-sheet-report.pdf'); }
    catch (e) { show(e?.message || 'Failed to download job sheet PDF', 'error'); }
  };
  const downloadInventoryReport = async () => {
    try { await downloadApiFile('/reports/inventory', 'inventory-report.pdf'); }
    catch (e) { show(e?.message || 'Failed to download inventory PDF', 'error'); }
  };
  const downloadMechanicsReport = async () => {
    try { await downloadApiFile('/reports/mechanics', 'mechanics-report.pdf'); }
    catch (e) { show(e?.message || 'Failed to download mechanics PDF', 'error'); }
  };
  const downloadPaymentsReport = async () => {
    try { await downloadApiFile('/reports/payments', 'payments-report.pdf'); }
    catch (e) { show(e?.message || 'Failed to download payments PDF', 'error'); }
  };

  async function fetchReceptionists() {
    try {
      setReceptionistsLoading(true);
      const resp = await getUsers({ search: receptionistSearch, role: 'receptionist', limit: 100 });
      setReceptionists(resp?.data || []);
    } catch (err) {
      show('Failed to load receptionists', 'error');
    } finally {
      setReceptionistsLoading(false);
    }
  }

  const beginEditReceptionist = (r) => {
    setEditingReceptionistId(r._id);
    setEditedReceptionist({
      name: r.name || '',
      email: r.email || '',
      phone: r.phone || '',
      address: r.address || '',
      nic: r.nic || ''
    });
  };

  const cancelEditReceptionist = () => {
    setEditingReceptionistId(null);
    setEditedReceptionist({ name: '', email: '', phone: '', address: '', nic: '' });
  };

  const saveReceptionist = async (id) => {
    try {
      await updateUserApi(id, { ...editedReceptionist, role: 'receptionist' });
      await fetchReceptionists();
      cancelEditReceptionist();
      show('Receptionist updated', 'success');
    } catch (err) {
      show('Failed to update receptionist', 'error');
    }
  };

  const deleteReceptionist = async (id) => {
    if (!window.confirm('Delete this receptionist?')) return;
    try {
      await deleteUserApi(id);
      await fetchReceptionists();
      show('Receptionist deleted', 'success');
    } catch (err) {
      show('Failed to delete receptionist', 'error');
    }
  };

  const handleNewRecChange = (e) => {
    const { name, value } = e.target;
    setNewRec((prev) => ({ ...prev, [name]: value }));
  };

  const addReceptionist = async () => {
    try {
      if (!newRec.name || !newRec.email) {
        show('Name and Email are required', 'error');
        return;
      }
      const payload = { ...newRec, role: 'receptionist' };
      if (!payload.password && payload.nic) payload.password = payload.nic;
      await createUser(payload);
      setNewRec({ name: '', email: '', phone: '', address: '', nic: '', password: '' });
      await fetchReceptionists();
      show('Receptionist added. Initial password is NIC.', 'success');
    } catch (err) {
      show(err?.message || 'Failed to add receptionist', 'error');
    }
  };

  const resetMechanicPassword = async () => {
    try {
      if (!mechanicNIC) {
        show('Please enter NIC', 'error');
        return;
      }
      await resetMechanicPasswordByNIC(mechanicNIC);
      setMechanicNIC('');
      show('Mechanic password reset to NIC', 'success');
    } catch (err) {
      show(err?.message || 'Failed to reset mechanic password', 'error');
    }
  };

  const cancelEditCustomer = () => {
    setEditingCustomerId(null);
    setEditedCustomer({ name: '', email: '', phone: '', address: '', nic: '' });
  };

  // Reports (Owner only)
  const generateCarsReport = async () => {
    try {
      const resp = await apiRequest('/cars');
      const cars = Array.isArray(resp?.data) ? resp.data : [];
      const columns = ['License Plate', 'Customer', 'Phone', 'Email', 'Make', 'Model', 'Year', 'Created'];
      const rows = cars.map(c => [
        c.licensePlate,
        c.customerName,
        c.customerPhone,
        c.customerEmail || '-',
        c.make,
        c.model,
        String(c.year || ''),
        new Date(c.createdAt || Date.now()).toLocaleDateString()
      ]);
      const html = buildReportHTML({ title: 'Car Profiles Report', columns, rows });
      openPrint(html, 'car-profiles-report.pdf');
    } catch (e) { show(e?.message || 'Failed to generate car profiles report', 'error'); }
  };

  const generateJobsReport = async () => {
    try {
      const resp = await apiRequest('/jobs');
      const jobs = Array.isArray(resp?.data) ? resp.data : [];
      const columns = ['Job ID', 'Car ID', 'Assigned Mechanic', 'Status', 'Estimated Completion'];
      const rows = jobs.map(j => [
        j.id || j._id || '-',
        (typeof j.car === 'object' ? j.car?.id || j.car?._id : j.car) || '-',
        j.assignedMechanic || '-',
        j.status,
        j.estimatedCompletion ? new Date(j.estimatedCompletion).toLocaleString() : '-'
      ]);
      const html = buildReportHTML({ title: 'Job Sheet Report', columns, rows });
      openPrint(html, 'job-sheet-report.pdf');
    } catch (e) { show(e?.message || 'Failed to generate job sheet report', 'error'); }
  };

  const generateInventoryReport = async () => {
    try {
      const resp = await apiRequest('/inventory');
      const items = Array.isArray(resp?.data) ? resp.data : [];
      const columns = ['Item', 'SKU', 'Quantity', 'Unit Price', 'Category', 'Updated'];
      const rows = items.map(it => [
        it.name || '-',
        it.sku || '-',
        String(it.quantity ?? ''),
        typeof it.price === 'number' ? it.price.toFixed(2) : '-',
        it.category || '-',
        new Date(it.updatedAt || it.createdAt || Date.now()).toLocaleDateString()
      ]);
      const html = buildReportHTML({ title: 'Inventory Report', columns, rows });
      openPrint(html, 'inventory-report.pdf');
    } catch (e) { show(e?.message || 'Failed to generate inventory report', 'error'); }
  };

  const generateMechanicsReport = async () => {
    try {
      const resp = await apiRequest('/mechanics');
      const list = Array.isArray(resp?.data) ? resp.data : [];
      const columns = ['Name', 'Email', 'Phone', 'Availability', 'Experience'];
      const rows = list.map(m => [
        m.name,
        m.email,
        m.phone || '-',
        m.availability || '-',
        m.experience || '-'
      ]);
      const html = buildReportHTML({ title: 'Mechanics Report', columns, rows });
      openPrint(html, 'mechanics-report.pdf');
    } catch (e) { show(e?.message || 'Failed to generate mechanics report', 'error'); }
  };

  const generatePaymentsReport = async () => {
    try {
      const resp = await apiRequest('/payments');
      const list = Array.isArray(resp?.data) ? resp.data : [];
      const columns = ['Payment ID', 'Customer', 'Amount', 'Method', 'Status', 'Date'];
      const rows = list.map(p => [
        p.id || p._id || '-',
        p.customerName || p.customer || '-',
        typeof p.amount === 'number' ? p.amount.toFixed(2) : '-',
        p.method || '-',
        p.status || '-',
        new Date(p.createdAt || Date.now()).toLocaleDateString()
      ]);
      const html = buildReportHTML({ title: 'Payments Report', columns, rows });
      openPrint(html, 'payments-report.pdf');
    } catch (e) { show(e?.message || 'Failed to generate payments report', 'error'); }
  };

  const saveCustomer = async (id) => {
    try {
      await updateUserApi(id, { ...editedCustomer, role: 'customer' });
      await fetchCustomers();
      cancelEditCustomer();
      show('Customer updated', 'success');
    } catch (err) {
      show('Failed to update customer', 'error');
    }
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await deleteUserApi(id);
      await fetchCustomers();
      show('Customer deleted', 'success');
    } catch (err) {
      show('Failed to delete customer', 'error');
    }
  };

  const stats = [
    {
      name: 'Registered Vehicles',
      value: String(state.cars.length),
      icon: Car,
      gradient: 'from-blue-500 to-cyan-500',
      shadow: 'shadow-blue-500/20'
    },
    {
      name: 'Active Repair Jobs',
      value: String(state.jobSheets.filter(job => job.status === 'in_progress').length),
      icon: Wrench,
      gradient: 'from-amber-500 to-orange-500',
      shadow: 'shadow-amber-500/20'
    },
    {
      name: 'Low Stock Alerts',
      value: String(state.inventory.filter(item => item.quantity <= item.minThreshold).length),
      icon: AlertTriangle,
      gradient: 'from-rose-500 to-red-500',
      shadow: 'shadow-rose-500/20'
    },
    {
      name: 'Total Revenue',
      value: `$${state.payments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)}`,
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-500',
      shadow: 'shadow-emerald-500/20'
    }
  ];

  const recentJobs = state.jobSheets.slice(0, 5);
  const lowStockItems = state.inventory.filter(item => item.quantity <= item.minThreshold);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <ScrollReveal variant="fade-down" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 p-6 rounded-3xl border border-blue-500/20 backdrop-blur-xl shadow-xl">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workshop Command Center</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {state.user.name}!
          </h1>
          <p className="mt-1 text-sm text-slate-400 font-light">
            Here's a real-time overview of garage operations, appointments, and inventory health.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/dashboard/jobs" className="btn-primary">
            <Wrench className="w-4 h-4" />
            <span>New Repair Job</span>
          </Link>
        </div>
      </ScrollReveal>

      {/* Stats Grid */}
      <StaggerContainer className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <StaggerItem key={stat.name} variant="scale-up">
              <div className={`glass-card p-6 relative overflow-hidden group hover:border-blue-400/40 transition-all duration-300 ${stat.shadow}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{stat.name}</p>
                    <h3 className="text-3xl font-extrabold text-white">
                      {stat.value.startsWith('$') ? stat.value : <AnimatedCounter target={stat.value} />}
                    </h3>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${stat.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Jobs */}
        <ScrollReveal variant="fade-right">
          <div className="glass-card p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Recent Job Sheets</h3>
              </div>
              <Link
                to="/dashboard/jobs"
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentJobs.length > 0 ? (
                recentJobs.map((job) => {
                  const car = state.cars.find(c => c.id === job.carId);
                  return (
                    <div key={job.id} className="flex items-center justify-between p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-white">
                          {car ? `${car.make} ${car.model}` : 'Unknown Vehicle'}
                        </p>
                        <p className="text-xs text-slate-400">
                          Mechanic: <span className="text-slate-200">{job.assignedMechanic || 'Unassigned'}</span>
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        job.status === 'completed' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {job.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">No recent job sheets.</div>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Low Stock Alert */}
        <ScrollReveal variant="fade-left">
          <div className="glass-card p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="text-lg font-bold text-white">Low Inventory Stock</h3>
              </div>
              <Link
                to="/dashboard/inventory"
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center"
              >
                <span>Inventory</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
            <div className="space-y-3">
              {lowStockItems.length > 0 ? (
                lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3.5 bg-rose-950/20 border border-rose-900/40 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-rose-200">{item.name}</p>
                      <p className="text-xs text-rose-400">
                        {item.quantity} units remaining (min: {item.minThreshold})
                      </p>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-rose-400 animate-pulse" />
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-slate-400">
                  <CheckCircle className="h-10 w-10 text-emerald-400 mb-2" />
                  <span className="text-sm font-medium text-slate-300">All inventory items are well-stocked</span>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Upcoming Appointments */}
        <ScrollReveal variant="fade-up" className="lg:col-span-2">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Upcoming Customer Appointments</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {appointments.length > 0 ? (
                appointments.slice(0, 6).map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-4 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-blue-500/40 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-white">{a.customerName} - <span className="text-cyan-400">{a.vehicle}</span></p>
                      <p className="text-xs text-slate-400">{a.serviceType} • {new Date(a.preferredDate).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => navigate('/dashboard/jobs', { state: { prefillFromAppointment: a } })}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all"
                    >
                      Create Sheet
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center p-8 text-slate-500 text-sm">No upcoming appointments registered.</div>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Customers Table (Owner only) */}
      {state?.user?.role === 'owner' && (
        <ScrollReveal variant="fade-up">
          <div className="glass-card p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-bold text-white">Customer Database</h3>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customers by name/email..."
                  className="input-field pl-10 py-2 text-sm"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
              </div>
            </div>
            {customersLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="spinner" />
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center p-8 text-slate-500">No customers found.</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-slate-900/90">
                    <tr>
                      <th className="table-header">Name</th>
                      <th className="table-header">Email</th>
                      <th className="table-header">Phone</th>
                      <th className="table-header">Address</th>
                      <th className="table-header">NIC</th>
                      <th className="table-header text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {customers.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="table-cell">
                          {editingCustomerId === c._id ? (
                            <input
                              type="text"
                              value={editedCustomer.name}
                              onChange={(e) => setEditedCustomer(prev => ({ ...prev, name: e.target.value }))}
                              className="input-field py-1 text-sm"
                            />
                          ) : (
                            <span className="font-bold text-white">{c.name}</span>
                          )}
                        </td>
                        <td className="table-cell">
                          {editingCustomerId === c._id ? (
                            <input
                              type="email"
                              value={editedCustomer.email}
                              onChange={(e) => setEditedCustomer(prev => ({ ...prev, email: e.target.value }))}
                              className="input-field py-1 text-sm"
                            />
                          ) : (
                            c.email
                          )}
                        </td>
                        <td className="table-cell">
                          {editingCustomerId === c._id ? (
                            <input
                              type="tel"
                              value={editedCustomer.phone}
                              onChange={(e) => setEditedCustomer(prev => ({ ...prev, phone: e.target.value }))}
                              className="input-field py-1 text-sm"
                            />
                          ) : (
                            c.phone || '—'
                          )}
                        </td>
                        <td className="table-cell">
                          {editingCustomerId === c._id ? (
                            <input
                              type="text"
                              value={editedCustomer.address}
                              onChange={(e) => setEditedCustomer(prev => ({ ...prev, address: e.target.value }))}
                              className="input-field py-1 text-sm"
                            />
                          ) : (
                            c.address || '—'
                          )}
                        </td>
                        <td className="table-cell">
                          {editingCustomerId === c._id ? (
                            <input
                              type="text"
                              value={editedCustomer.nic}
                              onChange={(e) => setEditedCustomer(prev => ({ ...prev, nic: e.target.value }))}
                              className="input-field py-1 text-sm"
                            />
                          ) : (
                            c.nic || '—'
                          )}
                        </td>
                        <td className="table-cell text-right">
                          {editingCustomerId === c._id ? (
                            <div className="flex justify-end space-x-2">
                              <button onClick={cancelEditCustomer} className="p-1 text-slate-400 hover:text-white" title="Cancel">
                                <X className="h-4 w-4" />
                              </button>
                              <button onClick={() => saveCustomer(c._id)} className="p-1 text-emerald-400 hover:text-emerald-300" title="Save">
                                <Check className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end space-x-3">
                              <button onClick={() => beginEditCustomer(c)} className="p-1 text-blue-400 hover:text-blue-300" title="Edit">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button onClick={() => deleteCustomer(c._id)} className="p-1 text-rose-400 hover:text-rose-300" title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </ScrollReveal>
      )}

      {/* Quick Export Reports */}
      {(state?.user?.role === 'owner' || state?.user?.role === 'receptionist') && (
        <ScrollReveal variant="fade-up">
          <div className="glass-card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Export Official Reports</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex gap-2 flex-wrap">
                <button onClick={generateCarsReport} className="btn-secondary text-xs">Print Car Profiles</button>
                <button onClick={downloadCarsReport} className="btn-secondary text-xs">Download PDF</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={generateJobsReport} className="btn-secondary text-xs">Print Job Sheets</button>
                <button onClick={downloadJobsReport} className="btn-secondary text-xs">Download PDF</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={generateInventoryReport} className="btn-secondary text-xs">Print Inventory</button>
                <button onClick={downloadInventoryReport} className="btn-secondary text-xs">Download PDF</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={generateMechanicsReport} className="btn-secondary text-xs">Print Mechanics</button>
                <button onClick={downloadMechanicsReport} className="btn-secondary text-xs">Download PDF</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={generatePaymentsReport} className="btn-secondary text-xs">Print Payments</button>
                <button onClick={downloadPaymentsReport} className="btn-secondary text-xs">Download PDF</button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Staff Management (Owner only) */}
      {state?.user?.role === 'owner' && (
        <ScrollReveal variant="fade-up">
          <div className="glass-card p-6 space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Staff & User Management</h3>

            {/* Reset Password */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center">
                <Key className="w-4 h-4 mr-2 text-amber-400" />
                Reset Mechanic Password to NIC
              </h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Enter Mechanic NIC Number"
                  className="input-field sm:w-80 py-2 text-sm"
                  value={mechanicNIC}
                  onChange={(e) => setMechanicNIC(e.target.value)}
                />
                <button onClick={resetMechanicPassword} className="btn-primary text-xs py-2">
                  <span>Reset Password</span>
                </button>
              </div>
            </div>

            {/* Create Mechanic Account */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center">
                <UserPlus className="w-4 h-4 mr-2 text-cyan-400" />
                Create New Mechanic Login Account
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <input placeholder="Full Name" className="input-field py-2 text-sm" value={newMechanicUser.name} onChange={(e) => setNewMechanicUser(prev => ({ ...prev, name: e.target.value }))} />
                <input placeholder="Email" type="email" className="input-field py-2 text-sm" value={newMechanicUser.email} onChange={(e) => setNewMechanicUser(prev => ({ ...prev, email: e.target.value }))} />
                <input placeholder="Phone" className="input-field py-2 text-sm" value={newMechanicUser.phone} onChange={(e) => setNewMechanicUser(prev => ({ ...prev, phone: e.target.value }))} />
                <input placeholder="NIC (Default Pass)" className="input-field py-2 text-sm" value={newMechanicUser.nic} onChange={(e) => setNewMechanicUser(prev => ({ ...prev, nic: e.target.value }))} />
                <input placeholder="Custom Password" type="password" className="input-field py-2 text-sm" value={newMechanicUser.password} onChange={(e) => setNewMechanicUser(prev => ({ ...prev, password: e.target.value }))} />
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={async () => {
                    try {
                      if (!newMechanicUser.name || !newMechanicUser.email) { show('Name and Email are required', 'error'); return; }
                      const payload = { ...newMechanicUser, role: 'mechanic' };
                      if (!payload.password && payload.nic) payload.password = payload.nic;
                      await createUser(payload);
                      setNewMechanicUser({ name: '', email: '', phone: '', nic: '', password: '' });
                      show('Mechanic account created.', 'success');
                    } catch (err) { show(err?.message || 'Failed to create mechanic account', 'error'); }
                  }}
                  className="btn-primary text-xs py-2"
                >
                  <UserPlus className="h-4 w-4 mr-1.5" />
                  <span>Create Mechanic</span>
                </button>
              </div>
            </div>

            {/* Create Owner Account */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center">
                <UserPlus className="w-4 h-4 mr-2 text-violet-400" />
                Create Owner Account
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <input placeholder="Full Name" className="input-field py-2 text-sm" value={newOwner.name} onChange={(e) => setNewOwner(prev => ({ ...prev, name: e.target.value }))} />
                <input placeholder="Email" type="email" className="input-field py-2 text-sm" value={newOwner.email} onChange={(e) => setNewOwner(prev => ({ ...prev, email: e.target.value }))} />
                <input placeholder="NIC" className="input-field py-2 text-sm" value={newOwner.nic} onChange={(e) => setNewOwner(prev => ({ ...prev, nic: e.target.value }))} />
                <input placeholder="Password" type="password" className="input-field py-2 text-sm" value={newOwner.password} onChange={(e) => setNewOwner(prev => ({ ...prev, password: e.target.value }))} />
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={async () => {
                    try {
                      if (!newOwner.name || !newOwner.email) { show('Name and Email are required', 'error'); return; }
                      const payload = { ...newOwner, role: 'owner' };
                      if (!payload.password && payload.nic) payload.password = payload.nic;
                      await createUser(payload);
                      setNewOwner({ name: '', email: '', nic: '', password: '' });
                      show('Owner account created.', 'success');
                    } catch (err) { show(err?.message || 'Failed to create owner account', 'error'); }
                  }}
                  className="btn-primary text-xs py-2"
                >
                  <UserPlus className="h-4 w-4 mr-1.5" />
                  <span>Create Owner</span>
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Quick Actions */}
      <ScrollReveal variant="fade-up">
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4">Quick Operations</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/dashboard/cars"
              className="flex items-center p-4 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800 transition-all duration-300 group"
            >
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform mr-4">
                <Car className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Add Vehicle</p>
                <p className="text-xs text-slate-400">Register new car</p>
              </div>
            </Link>

            <Link
              to="/dashboard/jobs"
              className="flex items-center p-4 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800 transition-all duration-300 group"
            >
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform mr-4">
                <Wrench className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Create Job Sheet</p>
                <p className="text-xs text-slate-400">Start repair job</p>
              </div>
            </Link>

            <Link
              to="/dashboard/inventory"
              className="flex items-center p-4 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 transition-all duration-300 group"
            >
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform mr-4">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Inventory Stock</p>
                <p className="text-xs text-slate-400">Manage parts & items</p>
              </div>
            </Link>

            <Link
              to="/dashboard/reports"
              className="flex items-center p-4 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-violet-500/50 hover:bg-slate-800 transition-all duration-300 group"
            >
              <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 group-hover:scale-110 transition-transform mr-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Analytics Reports</p>
                <p className="text-xs text-slate-400">View detailed stats</p>
              </div>
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default Dashboard;
