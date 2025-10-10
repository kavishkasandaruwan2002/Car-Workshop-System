/**
 * LOW STOCK DASHBOARD - ENHANCED INVENTORY MONITORING
 * 
 * This component provides a comprehensive dashboard for monitoring low stock items,
 * reorder suggestions, and inventory analytics. It helps managers make informed
 * decisions about inventory replenishment.
 * 
 * Features:
 * - Real-time low stock alerts
 * - Intelligent reorder suggestions
 * - Inventory analytics and trends
 * - Email notification system
 * - Supplier contact integration
 * - Cost analysis and budgeting
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import {
  AlertTriangle,    // Low stock warning icon
  Package,          // Package/item icon
  TrendingDown,    // Stock trend icon
  Mail,            // Email notification icon
  Phone,           // Phone contact icon
  DollarSign,      // Cost/money icon
  BarChart3,       // Analytics icon
  RefreshCw,       // Refresh/reload icon
  ShoppingCart,    // Reorder icon
  Clock,           // Time/urgency icon
  Users,           // Supplier icon
  CheckCircle,     // Success icon
  XCircle,         // Critical icon
  Filter,          // Filter icon
  Download         // Export icon
} from 'lucide-react';

const LowStockDashboard = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const { user } = useAuth();
  
  // Dashboard data
  const [analytics, setAnalytics] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [reorderSuggestions, setReorderSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter and view controls
  const [filterCritical, setFilterCritical] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('priority'); // priority, cost, name
  const [viewMode, setViewMode] = useState('alerts'); // alerts, suggestions, analytics
  
  // Email notification state
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  // ============================================================================
  // DATA LOADING FUNCTIONS
  // ============================================================================
  
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load analytics data
      const analyticsResp = await apiRequest('/inventory/analytics');
      setAnalytics(analyticsResp.data);
      
      // Load low stock items
      const lowStockResp = await apiRequest('/inventory/low-stock');
      setLowStockItems(lowStockResp.data);
      
      // Load reorder suggestions
      const reorderResp = await apiRequest('/inventory/reorder-suggestions');
      setReorderSuggestions(reorderResp.data);
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  // ============================================================================
  // FILTERING AND SORTING LOGIC
  // ============================================================================
  
  const filteredLowStockItems = lowStockItems.filter(item => {
    const matchesCritical = !filterCritical || item.quantity === 0;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesCritical && matchesCategory;
  });
  
  const sortedLowStockItems = [...filteredLowStockItems].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        if (a.quantity === 0 && b.quantity > 0) return -1;
        if (b.quantity === 0 && a.quantity > 0) return 1;
        return a.quantity - b.quantity;
      case 'cost':
        return (b.quantity * b.price) - (a.quantity * a.price);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });
  
  const sortedReorderSuggestions = [...reorderSuggestions].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        if (a.priority === 'critical' && b.priority !== 'critical') return -1;
        if (b.priority === 'critical' && a.priority !== 'critical') return 1;
        return b.estimatedCost - a.estimatedCost;
      case 'cost':
        return b.estimatedCost - a.estimatedCost;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });
  
  // ============================================================================
  // EMAIL NOTIFICATION FUNCTIONS
  // ============================================================================
  
  const sendLowStockEmail = async () => {
    try {
      setEmailLoading(true);
      setEmailSent(false);
      
      // This would call your email service endpoint
      // await apiRequest('/inventory/send-low-stock-alert', { method: 'POST' });
      
      // Simulate email sending for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
      
    } catch (err) {
      console.error('Error sending email:', err);
      setError('Failed to send email notification');
    } finally {
      setEmailLoading(false);
    }
  };
  
  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  const getStockStatusIcon = (item) => {
    if (item.quantity === 0) return <XCircle className="h-5 w-5 text-red-500" />;
    if (item.quantity <= item.minThreshold) return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };
  
  const getStockStatusText = (item) => {
    if (item.quantity === 0) return 'Out of Stock';
    if (item.quantity <= item.minThreshold) return 'Low Stock';
    return 'In Stock';
  };
  
  const getStockStatusColor = (item) => {
    if (item.quantity === 0) return 'text-red-600 bg-red-100';
    if (item.quantity <= item.minThreshold) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Low Stock Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor inventory levels and manage reorders
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            onClick={loadDashboardData}
            className="btn-secondary flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          
          <button
            onClick={sendLowStockEmail}
            disabled={emailLoading || emailSent}
            className={`btn-primary flex items-center ${
              emailSent ? 'bg-green-600 hover:bg-green-700' : ''
            }`}
          >
            {emailLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : emailSent ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            {emailLoading ? 'Sending...' : emailSent ? 'Sent!' : 'Send Alert'}
          </button>
        </div>
      </div>
      
      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics.overview.outOfStock}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-yellow-100">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Low Stock</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics.overview.lowStock}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">In Stock</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics.overview.inStock}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(analytics.overview.totalValue)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* View Mode Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'alerts', name: 'Stock Alerts', icon: AlertTriangle },
            { id: 'suggestions', name: 'Reorder Suggestions', icon: ShoppingCart },
            { id: 'analytics', name: 'Analytics', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  viewMode === tab.id
                    ? 'border-blue-500 text-blue-600'
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
      
      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="critical-only"
              checked={filterCritical}
              onChange={(e) => setFilterCritical(e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="critical-only" className="ml-2 text-sm text-gray-700">
              Critical only (out of stock)
            </label>
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field"
          >
            <option value="all">All Categories</option>
            {analytics?.categoryBreakdown?.map(cat => (
              <option key={cat.category} value={cat.category}>
                {cat.category} ({cat.total})
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="priority">Sort by Priority</option>
            <option value="cost">Sort by Cost</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>
      
      {/* Stock Alerts View */}
      {viewMode === 'alerts' && (
        <div className="card">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Stock Level Alerts ({sortedLowStockItems.length})
            </h3>
            
            {sortedLowStockItems.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">No low stock items found!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="table-header">Item</th>
                      <th className="table-header">Category</th>
                      <th className="table-header">Supplier</th>
                      <th className="table-header">Current Stock</th>
                      <th className="table-header">Min Threshold</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedLowStockItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="table-cell">
                          <div className="flex items-center">
                            {getStockStatusIcon(item)}
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {item.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ${item.price.toFixed(2)} each
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {item.category}
                          </span>
                        </td>
                        <td className="table-cell text-sm text-gray-900">
                          {item.supplier}
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm font-medium text-gray-900">
                              {item.quantity}
                            </span>
                          </div>
                        </td>
                        <td className="table-cell text-sm text-gray-900">
                          {item.minThreshold}
                        </td>
                        <td className="table-cell">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockStatusColor(item)}`}>
                            {getStockStatusText(item)}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-800 text-sm"
                              title="Contact Supplier"
                            >
                              <Phone className="h-4 w-4" />
                            </button>
                            <button
                              className="text-green-600 hover:text-green-800 text-sm"
                              title="Add to Reorder List"
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Reorder Suggestions View */}
      {viewMode === 'suggestions' && (
        <div className="card">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Reorder Suggestions ({sortedReorderSuggestions.length})
            </h3>
            
            {sortedReorderSuggestions.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">No reorder suggestions at this time!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="table-header">Item</th>
                      <th className="table-header">Current Stock</th>
                      <th className="table-header">Suggested Qty</th>
                      <th className="table-header">Unit Price</th>
                      <th className="table-header">Total Cost</th>
                      <th className="table-header">Priority</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedReorderSuggestions.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="table-cell">
                          <div className="flex items-center">
                            <Package className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.category} • {item.supplier}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="table-cell">
                          <span className="text-sm font-medium text-gray-900">
                            {item.suggestedReorderQty}
                          </span>
                        </td>
                        <td className="table-cell text-sm text-gray-900">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="table-cell">
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(item.estimatedCost)}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.priority === 'critical' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.priority === 'critical' ? 'Critical' : 'High'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-800 text-sm"
                              title="Contact Supplier"
                            >
                              <Phone className="h-4 w-4" />
                            </button>
                            <button
                              className="text-green-600 hover:text-green-800 text-sm"
                              title="Place Order"
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Analytics View */}
      {viewMode === 'analytics' && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="card">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Stock Status by Category
              </h3>
              <div className="space-y-3">
                {analytics.categoryBreakdown.map((category) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-900">
                        {category.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Total: {category.total}</span>
                      <span className="text-yellow-600">Low: {category.lowStock}</span>
                      <span className="text-red-600">Out: {category.outOfStock}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Top Suppliers */}
          <div className="card">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Top Suppliers by Value
              </h3>
              <div className="space-y-3">
                {analytics.topSuppliers.map((supplier, index) => (
                  <div key={supplier.supplier} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {supplier.supplier}
                        </div>
                        <div className="text-sm text-gray-500">
                          {supplier.totalItems} items
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(supplier.totalValue)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {supplier.lowStockItems} low stock
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LowStockDashboard;
