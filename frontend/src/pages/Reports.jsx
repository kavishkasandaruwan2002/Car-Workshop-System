import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiRequest } from '../api/client';
import { buildReportHTML, openPrint } from '../utils/report';
import { downloadApiFile } from '../utils/download';
import { useToast } from '../components/Toast';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Users,
  Wrench,
  Package,
  Download,
  Filter,
  Edit,
  Trash2
} from 'lucide-react';
import { BarChart as ReBarChart, Bar, XAxis } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/bar-chart';
import { Badge } from '@/components/ui/badge';

const Reports = () => {
  const { state, dispatch } = useApp();
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [selectedMechanic, setSelectedMechanic] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [formData, setFormData] = useState({
    jobSheetId: '',
    amount: '',
    date: '',
    status: 'paid',
    method: 'cash'
  });

  const { show } = useToast();

  // PDF Generation Functions
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

  // Calculate report data
  const getReportData = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filter data based on date range
    let filteredJobs = state.jobSheets;
    let filteredPayments = state.payments;
    
    if (dateRange === 'month') {
      filteredJobs = state.jobSheets.filter(job => {
        const jobDate = new Date(job.createdAt);
        return jobDate.getMonth() === currentMonth && jobDate.getFullYear() === currentYear;
      });
      filteredPayments = state.payments.filter(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
      });
    } else if (dateRange === 'year') {
      filteredJobs = state.jobSheets.filter(job => {
        const jobDate = new Date(job.createdAt);
        return jobDate.getFullYear() === currentYear;
      });
      filteredPayments = state.payments.filter(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate.getFullYear() === currentYear;
      });
    }

    // Filter by mechanic if selected
    if (selectedMechanic !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.assignedMechanic === selectedMechanic);
    }

    const totalRevenue = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const completedJobs = filteredJobs.filter(job => job.status === 'completed').length;
    const totalJobs = filteredJobs.length;
    const averageJobValue = totalJobs > 0 ? totalRevenue / totalJobs : 0;

    // Mechanic performance
    const mechanicStats = state.mechanics.map(mechanic => {
      const mechanicJobs = filteredJobs.filter(job => job.assignedMechanic === mechanic.name);
      const completedMechanicJobs = mechanicJobs.filter(job => job.status === 'completed').length;
      const mechanicRevenue = filteredPayments
        .filter(payment => {
          const job = state.jobSheets.find(j => j.id === payment.jobSheetId);
          return job && job.assignedMechanic === mechanic.name;
        })
        .reduce((sum, payment) => sum + payment.amount, 0);

      return {
        name: mechanic.name,
        totalJobs: mechanicJobs.length,
        completedJobs: completedMechanicJobs,
        revenue: mechanicRevenue,
        efficiency: mechanicJobs.length > 0 ? (completedMechanicJobs / mechanicJobs.length) * 100 : 0
      };
    });

    // Parts usage
    const partsUsage = state.inventory.map(item => {
      const usedInJobs = state.repairHistory.filter(repair => 
        repair.parts.includes(item.name)
      ).length;
      
      return {
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        used: usedInJobs,
        value: item.quantity * item.price
      };
    });

    return {
      totalRevenue,
      completedJobs,
      totalJobs,
      averageJobValue,
      mechanicStats,
      partsUsage,
      filteredPayments
    };
  };

  const reportData = getReportData();

  // Build monthly revenue data from filteredPayments (current dateRange scope)
  const monthlyRevenueMap = reportData.filteredPayments.reduce((acc, p) => {
    const d = new Date(p.date);
    const key = d.toLocaleString('en-US', { month: 'long' });
    acc[key] = (acc[key] || 0) + (typeof p.amount === 'number' ? p.amount : 0);
    return acc;
  }, {});

  const monthsOrder = [
    'January','February','March','April','May','June','July','August','September','October','November','December'
  ];
  const chartData = monthsOrder.map((m) => ({ month: m, revenue: monthlyRevenueMap[m] || 0 }));

  const chartConfig = {
    revenue: { label: 'Revenue', color: 'hsl(220 70% 50%)' },
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPayment) {
      dispatch({ type: 'UPDATE_PAYMENT', payload: { ...formData, id: editingPayment.id } });
    } else {
      dispatch({ type: 'ADD_PAYMENT', payload: formData });
    }
    setShowPaymentModal(false);
    setEditingPayment(null);
    setFormData({
      jobSheetId: '',
      amount: '',
      date: '',
      status: 'paid',
      method: 'cash'
    });
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setFormData(payment);
    setShowPaymentModal(true);
  };

  const handleDelete = (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      dispatch({ type: 'DELETE_PAYMENT', payload: paymentId });
    }
  };

  const canDelete = state.user.role === 'owner';

  const reportTabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'payments', name: 'Payments', icon: DollarSign },
    { id: 'mechanics', name: 'Mechanic Performance', icon: Users },
    { id: 'inventory', name: 'Parts Usage', icon: Package }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Financial insights and performance analytics
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <button className="btn-secondary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </button>
          <button className="btn-primary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="input-field"
        >
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>
        
        <select
          value={selectedMechanic}
          onChange={(e) => setSelectedMechanic(e.target.value)}
          className="input-field"
        >
          <option value="all">All Mechanics</option>
          {state.mechanics.map(mechanic => (
            <option key={mechanic.id} value={mechanic.name}>
              {mechanic.name}
            </option>
          ))}
        </select>
        
        <div className="flex items-center text-sm text-gray-600">
          <Filter className="h-4 w-4 mr-2" />
          {reportData.filteredPayments.length} payments found
        </div>
      </div>

      {/* PDF Reports Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Generate PDF Reports</h3>
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
        <p className="text-xs text-gray-500 mt-2">Generate reports open in a new tab and can be saved as PDF via the browser's print dialog. Download reports are generated server-side.</p>
      </div>

      {/* Report Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {reportTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedReport(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  selectedReport === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Report */}
      {selectedReport === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg bg-green-100">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">${reportData.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100">
                  <Wrench className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Jobs Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">{reportData.completedJobs}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg bg-yellow-100">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Average Job Value</p>
                  <p className="text-2xl font-semibold text-gray-900">${reportData.averageJobValue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg bg-purple-100">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {reportData.totalJobs > 0 ? Math.round((reportData.completedJobs / reportData.totalJobs) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Revenue Trend
                <Badge variant="outline" className="text-green-600 bg-green-500/10 border-none ml-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>
                    {reportData.totalJobs > 0 ? `${Math.round((reportData.completedJobs / Math.max(reportData.totalJobs,1)) * 100)}%` : '—'}
                  </span>
                </Badge>
              </CardTitle>
              <CardDescription>
                {dateRange === 'month' ? 'This month' : dateRange === 'year' ? 'This year' : 'All time'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="w-full">
                <ReBarChart data={chartData} accessibilityLayer>
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => String(value).slice(0, 3)}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent labelKey="revenue" />} />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" />
                </ReBarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payments Report */}
      {selectedReport === 'payments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Payment Records</h3>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="btn-primary flex items-center"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Add Payment
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">Job</th>
                    <th className="table-header">Amount</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Method</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.filteredPayments.map((payment) => {
                    const job = state.jobSheets.find(j => j.id === payment.jobSheetId);
                    const car = job ? state.cars.find(c => c.id === job.carId) : null;
                    
                    return (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="table-cell">
                          {car ? `${car.make} ${car.model}` : 'Unknown Job'}
                        </td>
                        <td className="table-cell font-medium text-green-600">
                          ${payment.amount.toFixed(2)}
                        </td>
                        <td className="table-cell">
                          {new Date(payment.date).toLocaleDateString()}
                        </td>
                        <td className="table-cell">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'paid' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="table-cell capitalize">{payment.method.replace('_', ' ')}</td>
                        <td className="table-cell">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(payment)}
                              className="text-gray-400 hover:text-blue-600"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(payment.id)}
                                className="text-gray-400 hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Mechanic Performance Report */}
      {selectedReport === 'mechanics' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Mechanic Performance</h3>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {reportData.mechanicStats.map((mechanic) => (
              <div key={mechanic.name} className="card">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">{mechanic.name}</h4>
                  <span className="text-sm text-gray-500">{mechanic.efficiency.toFixed(1)}% efficiency</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Jobs:</span>
                    <span className="font-medium">{mechanic.totalJobs}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completed:</span>
                    <span className="font-medium text-green-600">{mechanic.completedJobs}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Revenue Generated:</span>
                    <span className="font-medium text-green-600">${mechanic.revenue.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Efficiency</span>
                    <span>{mechanic.efficiency.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${mechanic.efficiency}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parts Usage Report */}
      {selectedReport === 'inventory' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Parts Usage Analysis</h3>
          
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">Part Name</th>
                    <th className="table-header">Category</th>
                    <th className="table-header">Current Stock</th>
                    <th className="table-header">Times Used</th>
                    <th className="table-header">Value</th>
                    <th className="table-header">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.partsUsage.map((part) => (
                    <tr key={part.name} className="hover:bg-gray-50">
                      <td className="table-cell font-medium">{part.name}</td>
                      <td className="table-cell">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {part.category}
                        </span>
                      </td>
                      <td className="table-cell">{part.quantity}</td>
                      <td className="table-cell">{part.used}</td>
                      <td className="table-cell font-medium">${part.value.toFixed(2)}</td>
                      <td className="table-cell">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          part.quantity === 0 
                            ? 'bg-red-100 text-red-800'
                            : part.quantity <= 5
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {part.quantity === 0 ? 'Out of Stock' : 
                           part.quantity <= 5 ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPaymentModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingPayment ? 'Edit Payment Record' : 'Add New Payment'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Sheet *
                      </label>
                      <select
                        name="jobSheetId"
                        value={formData.jobSheetId}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                      >
                        <option value="">Choose a job...</option>
                        {state.jobSheets.map(job => {
                          const car = state.cars.find(c => c.id === job.carId);
                          return (
                            <option key={job.id} value={job.id}>
                              {car ? `${car.make} ${car.model} - ${job.assignedMechanic}` : `Job ${job.id}`}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount *
                        </label>
                        <input
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                          className="input-field"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date *
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          required
                          className="input-field"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status *
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          required
                          className="input-field"
                        >
                          <option value="paid">Paid</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Payment Method *
                        </label>
                        <select
                          name="method"
                          value={formData.method}
                          onChange={handleInputChange}
                          required
                          className="input-field"
                        >
                          <option value="cash">Cash</option>
                          <option value="credit_card">Credit Card</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="check">Check</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn-primary sm:ml-3 sm:w-auto w-full"
                  >
                    {editingPayment ? 'Update' : 'Add'} Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentModal(false);
                      setEditingPayment(null);
                      setFormData({
                        jobSheetId: '',
                        amount: '',
                        date: '',
                        status: 'paid',
                        method: 'cash'
                      });
                    }}
                    className="btn-secondary mt-3 sm:mt-0 sm:w-auto w-full"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
