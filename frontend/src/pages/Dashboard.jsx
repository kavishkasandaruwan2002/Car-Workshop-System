import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { buildReportHTML, openPrint } from '../utils/report';
import { downloadApiFile } from '../utils/download';
import { apiRequest } from '../api/client';
import {
  Car,
  Wrench,
  Package,
  DollarSign,
  DownloadCloud,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Search,
  Edit,
  Trash2,
  X,
  Check,
  UserPlus,
  Key
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
        // Filter for upcoming appointments (future dates only) and sort by date
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
        new Date(p.createdAt || Date.now()).toLocaleString()
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
      name: 'Total Cars',
      value: state.cars.length,
      icon: Car,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Active Jobs',
      value: state.jobSheets.filter(job => job.status === 'in_progress').length,
      icon: Wrench,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      name: 'Low Stock Items',
      value: state.inventory.filter(item => item.quantity <= item.minThreshold).length,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      name: 'Total Revenue',
      value: `$${state.payments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  const recentJobs = state.jobSheets.slice(0, 5);
  const lowStockItems = state.inventory.filter(item => item.quantity <= item.minThreshold);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {state.user.name}! Here's what's happening at your workshop.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Jobs */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Jobs</h3>
            <Link
              to="/dashboard/jobs"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentJobs.map((job) => {
              const car = state.cars.find(c => c.id === job.carId);
              return (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {car ? `${car.make} ${car.model}` : 'Unknown Car'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Assigned to: {job.assignedMechanic}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {job.status === 'completed' ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Low Stock Alert</h3>
            <Link
              to="/dashboard/inventory"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Manage inventory
            </Link>
          </div>
          <div className="space-y-3">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} remaining (min: {item.minThreshold})
                    </p>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center p-6 text-gray-500">
                <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
                <span>All items are well stocked</span>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Appointments</h3>
          </div>
          <div className="space-y-3">
            {appointments.length > 0 ? (
              appointments.slice(0, 6).map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{a.customerName} - {a.vehicle}</p>
                    <p className="text-xs text-gray-500">{a.serviceType} on {new Date(a.preferredDate).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => navigate('/dashboard/jobs', { state: { prefillFromAppointment: a } })}
                    className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                  >
                    Create Job Sheet
                  </button>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center p-6 text-gray-500">
                <span>No upcoming appointments</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customers (Owner only) */}
      {state?.user?.role === 'owner' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Customers</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-64"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
            </div>
          </div>
          {customersLoading ? (
            <div className="flex justify-center items-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center p-8 text-gray-500">No customers found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIC</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCustomerId === c._id ? (
                          <input
                            type="text"
                            value={editedCustomer.name}
                            onChange={(e) => setEditedCustomer(prev => ({ ...prev, name: e.target.value }))}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">{c.name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCustomerId === c._id ? (
                          <input
                            type="email"
                            value={editedCustomer.email}
                            onChange={(e) => setEditedCustomer(prev => ({ ...prev, email: e.target.value }))}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{c.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCustomerId === c._id ? (
                          <input
                            type="tel"
                            value={editedCustomer.phone}
                            onChange={(e) => setEditedCustomer(prev => ({ ...prev, phone: e.target.value }))}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{c.phone || '—'}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCustomerId === c._id ? (
                          <input
                            type="text"
                            value={editedCustomer.address}
                            onChange={(e) => setEditedCustomer(prev => ({ ...prev, address: e.target.value }))}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{c.address || '—'}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCustomerId === c._id ? (
                          <input
                            type="text"
                            value={editedCustomer.nic}
                            onChange={(e) => setEditedCustomer(prev => ({ ...prev, nic: e.target.value }))}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{c.nic || '—'}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingCustomerId === c._id ? (
                          <div className="flex justify-end space-x-2">
                            <button onClick={cancelEditCustomer} className="text-gray-400 hover:text-gray-600" title="Cancel">
                              <X className="h-5 w-5" />
                            </button>
                            <button onClick={() => saveCustomer(c._id)} className="text-green-600 hover:text-green-900" title="Save">
                              <Check className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-3">
                            <button onClick={() => beginEditCustomer(c)} className="text-blue-600 hover:text-blue-900" title="Edit">
                              <Edit className="h-5 w-5" />
                            </button>
                            <button onClick={() => deleteCustomer(c._id)} className="text-red-600 hover:text-red-900" title="Delete">
                              <Trash2 className="h-5 w-5" />
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
      )}

      {/* Reports (Owner and Receptionist) */}
      {(state?.user?.role === 'owner' || state?.user?.role === 'receptionist') && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Reports</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="flex gap-2 flex-wrap">
              <button onClick={generateCarsReport} className="btn-secondary">Generate Car Profiles PDF</button>
              <button onClick={downloadCarsReport} className="btn-secondary">Download Car Profiles PDF</button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={generateJobsReport} className="btn-secondary">Generate Job Sheet PDF</button>
              <button onClick={downloadJobsReport} className="btn-secondary">Download Job Sheet PDF</button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={generateInventoryReport} className="btn-secondary">Generate Inventory PDF</button>
              <button onClick={downloadInventoryReport} className="btn-secondary">Download Inventory PDF</button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={generateMechanicsReport} className="btn-secondary">Generate Mechanics PDF</button>
              <button onClick={downloadMechanicsReport} className="btn-secondary">Download Mechanics PDF</button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={generatePaymentsReport} className="btn-secondary">Generate Payments PDF</button>
              <button onClick={downloadPaymentsReport} className="btn-secondary">Download Payments PDF</button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Reports open in a new tab and can be saved as PDF via the browser's print dialog.</p>
        </div>
      )}

      {/* Receptionists (Owner only) */}
      {state?.user?.role === 'owner' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Receptionists</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search receptionists..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-64"
                  value={receptionistSearch}
                  onChange={(e) => setReceptionistSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Add Receptionist */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <input name="name" value={newRec.name} onChange={handleNewRecChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder="Name" />
              <input name="email" value={newRec.email} onChange={handleNewRecChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder="Email" type="email" />
              <input name="phone" value={newRec.phone} onChange={handleNewRecChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder="Phone" />
              <input name="address" value={newRec.address} onChange={handleNewRecChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder="Address" />
              <input name="nic" value={newRec.nic} onChange={handleNewRecChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder="NIC (used as password)" />
              <input name="password" value={newRec.password} onChange={handleNewRecChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder="Password (defaults to NIC)" />
            </div>
            <div className="mt-3 flex justify-end">
              <button onClick={addReceptionist} className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                <UserPlus className="h-4 w-4 mr-2" /> Add Receptionist
              </button>
            </div>
          </div>

          {receptionistsLoading ? (
            <div className="flex justify-center items-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          ) : receptionists.length === 0 ? (
            <div className="text-center p-8 text-gray-500">No receptionists found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIC</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {receptionists.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingReceptionistId === r._id ? (
                          <input value={editedReceptionist.name} onChange={(e)=>setEditedReceptionist(prev=>({...prev,name:e.target.value}))} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">{r.name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingReceptionistId === r._id ? (
                          <input type="email" value={editedReceptionist.email} onChange={(e)=>setEditedReceptionist(prev=>({...prev,email:e.target.value}))} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                        ) : (
                          <div className="text-sm text-gray-900">{r.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingReceptionistId === r._id ? (
                          <input value={editedReceptionist.phone} onChange={(e)=>setEditedReceptionist(prev=>({...prev,phone:e.target.value}))} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                        ) : (
                          <div className="text-sm text-gray-900">{r.phone || '—'}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingReceptionistId === r._id ? (
                          <input value={editedReceptionist.address} onChange={(e)=>setEditedReceptionist(prev=>({...prev,address:e.target.value}))} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                        ) : (
                          <div className="text-sm text-gray-900">{r.address || '—'}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingReceptionistId === r._id ? (
                          <input value={editedReceptionist.nic} onChange={(e)=>setEditedReceptionist(prev=>({...prev,nic:e.target.value}))} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                        ) : (
                          <div className="text-sm text-gray-900">{r.nic || '—'}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingReceptionistId === r._id ? (
                          <div className="flex justify-end space-x-2">
                            <button onClick={cancelEditReceptionist} className="text-gray-400 hover:text-gray-600" title="Cancel"><X className="h-5 w-5" /></button>
                            <button onClick={()=>saveReceptionist(r._id)} className="text-green-600 hover:text-green-900" title="Save"><Check className="h-5 w-5" /></button>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-3">
                            <button onClick={()=>beginEditReceptionist(r)} className="text-blue-600 hover:text-blue-900" title="Edit"><Edit className="h-5 w-5" /></button>
                            <button onClick={()=>deleteReceptionist(r._id)} className="text-red-600 hover:text-red-900" title="Delete"><Trash2 className="h-5 w-5" /></button>
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
      )}

      {/* Mechanic (Owner only) */}
      {state?.user?.role === 'owner' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Mechanic - Reset Initial Password</h3>
          </div>
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <input
              type="text"
              placeholder="Enter Mechanic NIC"
              className="block w-full md:w-80 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              value={mechanicNIC}
              onChange={(e)=>setMechanicNIC(e.target.value)}
            />
            <button onClick={resetMechanicPassword} className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
              <Key className="h-4 w-4 mr-2" /> Reset to NIC
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">This will set the mechanic's password to their NIC.</p>

          {/* Add Mechanic Account */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-800 mb-3">Create Mechanic Login Account</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              <input placeholder="Name" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" value={newMechanicUser.name} onChange={(e)=>setNewMechanicUser(prev=>({...prev,name:e.target.value}))} />
              <input placeholder="Email" type="email" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" value={newMechanicUser.email} onChange={(e)=>setNewMechanicUser(prev=>({...prev,email:e.target.value}))} />
              <input placeholder="Phone" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" value={newMechanicUser.phone} onChange={(e)=>setNewMechanicUser(prev=>({...prev,phone:e.target.value}))} />
              <input placeholder="NIC (used as password)" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" value={newMechanicUser.nic} onChange={(e)=>setNewMechanicUser(prev=>({...prev,nic:e.target.value}))} />
              <input placeholder="Password (defaults to NIC)" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" value={newMechanicUser.password} onChange={(e)=>setNewMechanicUser(prev=>({...prev,password:e.target.value}))} />
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={async ()=>{
                  try{
                    if(!newMechanicUser.name || !newMechanicUser.email){ show('Name and Email are required','error'); return; }
                    const payload={...newMechanicUser, role:'mechanic'};
                    if(!payload.password && payload.nic) payload.password = payload.nic;
                    await createUser(payload);
                    setNewMechanicUser({ name:'', email:'', phone:'', nic:'', password:'' });
                    show('Mechanic account created. Initial password is NIC.','success');
                  }catch(err){ show(err?.message || 'Failed to create mechanic account','error'); }
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <UserPlus className="h-4 w-4 mr-2"/> Create Mechanic Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Owners (Owner only) */}
      {state?.user?.role === 'owner' && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Owners</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-800 mb-3">Create Owner Account</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <input placeholder="Name" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" value={newOwner.name} onChange={(e)=>setNewOwner(prev=>({...prev,name:e.target.value}))} />
              <input placeholder="Email" type="email" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" value={newOwner.email} onChange={(e)=>setNewOwner(prev=>({...prev,email:e.target.value}))} />
              <input placeholder="NIC (used as password)" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" value={newOwner.nic} onChange={(e)=>setNewOwner(prev=>({...prev,nic:e.target.value}))} />
              <input placeholder="Password (defaults to NIC)" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" value={newOwner.password} onChange={(e)=>setNewOwner(prev=>({...prev,password:e.target.value}))} />
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={async ()=>{
                  try{
                    if(!newOwner.name || !newOwner.email){ show('Name and Email are required','error'); return; }
                    const payload={...newOwner, role:'owner'};
                    if(!payload.password && payload.nic) payload.password = payload.nic;
                    await createUser(payload);
                    setNewOwner({ name:'', email:'', nic:'', password:'' });
                    show('Owner account created. Initial password is NIC.','success');
                  }catch(err){ show(err?.message || 'Failed to create owner account','error'); }
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <UserPlus className="h-4 w-4 mr-2"/> Create Owner Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/dashboard/cars"
            className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <Car className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-primary-900">Add New Car</p>
              <p className="text-xs text-primary-600">Register vehicle</p>
            </div>
          </Link>
          
          <Link
            to="/dashboard/jobs"
            className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <Wrench className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-orange-900">Create Job Sheet</p>
              <p className="text-xs text-orange-600">Start new repair</p>
            </div>
          </Link>
          
          <Link
            to="/dashboard/inventory"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Package className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-900">Manage Inventory</p>
              <p className="text-xs text-green-600">Update stock</p>
            </div>
          </Link>
          
          <Link
            to="/dashboard/reports"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-purple-900">View Reports</p>
              <p className="text-xs text-purple-600">Analytics & insights</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
