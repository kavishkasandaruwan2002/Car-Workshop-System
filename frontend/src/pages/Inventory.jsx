/**
 * INVENTORY MANAGEMENT SYSTEM
 * 
 * This component handles the complete  // ============================================================================
  // DATA LOADING - FETCH INVENTORY ON COMPONENT MOUNT
  // ============================================================================
  
  useEffect(() => {
    // Fetch inventory data when component mounts
    (async () => {
      try {
        // Call backend API to get all inventory items
        const resp = await apiRequest('/inventory');
        
        // Ensure we have a valid array (fallback to empty array)
        const list = Array.isArray(resp?.data) ? resp.data : [];
        
        // Normalize data - ensure all numeric fields are proper numbers
        // and handle missing timestamps
        const normalized = list.map(i => ({
          ...i,
          minThreshold: Number(i.minThreshold ?? 0),    // Convert to number, default 0
          price: Number(i.price ?? 0),                  // Convert to number, default 0
          quantity: Number(i.quantity ?? 0),            // Convert to number, default 0
          // Use the most recent timestamp available for lastUpdated
          lastUpdated: i.lastUpdated || i.updatedAt || i.createdAt || new Date().toISOString()
        }));
        
        // Update global state with normalized inventory data
        dispatch({ type: 'SET_INVENTORY', payload: normalized });
      } catch (e) {
        // Silently handle errors (could be network issues, unauthorized access, etc.)
        // In production, you might want to show a toast notification here
      }
    })();
  }, [dispatch]); // Re-run if dispatch function changesement functionality for the garage system.
 * It provides CRUD operations for spare parts and automotive components with role-based access control.
 * 
 * Features:
 * - View all inventory items with pagination and search
 * - Add new inventory items (owner/receptionist only)
 * - Edit existing items (owner/receptionist only) 
 * - Delete items (owner only)
 * - Real-time stock level monitoring with alerts
 * - Category-based filtering and search
 * - Automatic low stock and out-of-stock notifications
 * - Role-based UI adaptation
 */

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';      // Global state management for inventory data
import { useAuth } from '../context/AuthContext';    // User authentication and role information
import { apiRequest } from '../api/client';          // HTTP client for backend communication
import {
  Plus,          // Add new item icon
  Search,        // Search functionality icon
  Edit,          // Edit item icon
  Trash2,        // Delete item icon
  Package,       // Generic package/item icon
  AlertTriangle, // Low stock warning icon
  Filter,        // Filter functionality icon
  X,             // Out of stock indicator icon
  DollarSign,    // Price/value display icon
  Hash,          // Quantity indicator icon
  Minus,         // Reduce stock icon
  Layers         // Bulk operations icon
} from 'lucide-react';
import StockReductionModal from '../components/StockReductionModal';

const Inventory = () => {
  // ============================================================================
  // STATE MANAGEMENT AND HOOKS
  // ============================================================================
  
  // Global application state for inventory data
  const { state, dispatch } = useApp();
  
  // Current user authentication and role information
  const { user } = useAuth();
  
  // Role-based permission checks
  const canManage = user?.role === 'owner' || user?.role === 'receptionist';  // Owners and receptionists can add items
  
  // ============================================================================
  // LOCAL COMPONENT STATE
  // ============================================================================
  
  // Modal control for add/edit item form
  const [showModal, setShowModal] = useState(false);
  
  // Currently editing item (null when adding new item)
  const [editingItem, setEditingItem] = useState(null);
  
  // Stock reduction modal states
  const [showStockReductionModal, setShowStockReductionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [stockReductionMode, setStockReductionMode] = useState('single'); // 'single' or 'bulk'
  
  // Search functionality - filters items by name or supplier
  const [searchTerm, setSearchTerm] = useState('');
  
  // Category filtering - shows items from specific category
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Stock level filtering - filters by stock status (all/in_stock/low/out)
  const [stockFilter, setStockFilter] = useState('all');
  
  // Form data for add/edit operations
  const [formData, setFormData] = useState({
    name: '',           // Item name (required)
    category: '',       // Item category (e.g., Engine, Brake System)
    supplier: '',       // Supplier name (required)
    quantity: '',       // Current stock quantity
    price: '',          // Unit price
    minThreshold: ''    // Minimum stock level for alerts
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState({});

  // Form validation state
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiRequest('/inventory');// Call backend
        const list = Array.isArray(resp?.data) ? resp.data : [];
        const normalized = list.map(i => ({
          ...i,
          minThreshold: Number(i.minThreshold ?? 0),
          price: Number(i.price ?? 0),
          quantity: Number(i.quantity ?? 0),
          lastUpdated: i.lastUpdated || i.updatedAt || i.createdAt || new Date().toISOString()
        }));
        dispatch({ type: 'SET_INVENTORY', payload: normalized });// Update global state
      } catch (e) {}
    })();
  }, [dispatch]);

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================
  
  /**
   * Validates a single form field
   * @param {string} name - Field name
   * @param {string} value - Field value
   * @returns {string|null} Error message or null if valid
   */
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value || value.trim().length === 0) {
          return 'Item name is required';
        }
        if (value.trim().length < 2) {
          return 'Item name must be at least 2 characters';
        }
        if (value.trim().length > 100) {
          return 'Item name must be less than 100 characters';
        }
        // Check for duplicate names (excluding current item when editing)
        const existingItem = state.inventory.find(item => 
          item.name.toLowerCase() === value.trim().toLowerCase() && 
          item.id !== editingItem?.id
        );
        if (existingItem) {
          return 'An item with this name already exists';
        }
        return null;

      case 'category':
        if (!value || value.trim().length === 0) {
          return 'Category is required';
        }
        if (value.trim().length < 2) {
          return 'Category must be at least 2 characters';
        }
        if (value.trim().length > 50) {
          return 'Category must be less than 50 characters';
        }
        return null;

      case 'supplier':
        if (!value || value.trim().length === 0) {
          return 'Supplier is required';
        }
        if (value.trim().length < 2) {
          return 'Supplier must be at least 2 characters';
        }
        if (value.trim().length > 100) {
          return 'Supplier must be less than 100 characters';
        }
        return null;

      case 'quantity':
        if (!value && value !== '0') {
          return 'Quantity is required';
        }
        const qty = Number(value);
        if (isNaN(qty)) {
          return 'Quantity must be a valid number';
        }
        if (qty < 0) {
          return 'Quantity cannot be negative';
        }
        if (qty > 999999) {
          return 'Quantity cannot exceed 999,999';
        }
        if (!Number.isInteger(qty)) {
          return 'Quantity must be a whole number';
        }
        return null;

      case 'price':
        if (!value && value !== '0') {
          return 'Price is required';
        }
        const price = Number(value);
        if (isNaN(price)) {
          return 'Price must be a valid number';
        }
        if (price < 0) {
          return 'Price cannot be negative';
        }
        if (price > 999999) {
          return 'Price cannot exceed $999,999';
        }
        // Check for reasonable decimal places (max 2)
        if (value.includes('.') && value.split('.')[1]?.length > 2) {
          return 'Price can have maximum 2 decimal places';
        }
        return null;

      case 'minThreshold':
        if (!value && value !== '0') {
          return 'Minimum threshold is required';
        }
        const threshold = Number(value);
        if (isNaN(threshold)) {
          return 'Minimum threshold must be a valid number';
        }
        if (threshold < 0) {
          return 'Minimum threshold cannot be negative';
        }
        if (threshold > 999999) {
          return 'Minimum threshold cannot exceed 999,999';
        }
        if (!Number.isInteger(threshold)) {
          return 'Minimum threshold must be a whole number';
        }
        // Logical validation: threshold should not exceed quantity (warning, not error)
        const currentQty = Number(formData.quantity || 0);
        if (currentQty > 0 && threshold > currentQty) {
          return 'Minimum threshold is higher than current quantity';
        }
        return null;

      default:
        return null;
    }
  };

  /**
   * Validates all form fields
   * @returns {Object} Object with field names as keys and error messages as values
   */
  const validateForm = () => {
    const errors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });
    return errors;
  };

  /**
   * Checks if the form is valid (no errors)
   * @returns {boolean} True if form is valid
   */
  const isFormValid = () => {
    const errors = validateForm();
    return Object.keys(errors).length === 0;
  };

  // ============================================================================
  // DATA PROCESSING AND CALCULATIONS
  // ============================================================================
  
  // Extract unique categories from inventory for filter dropdown
  // Creates array of unique category names, filtering out empty strings
  const categories = [...new Set(state.inventory.map(item => item.category || ''))];

  // Advanced filtering system - combines search, category, and stock level filters (validations)
  const filteredItems = state.inventory.filter(item => {
    // TEXT SEARCH - matches item name or supplier (case-insensitive)
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    // CATEGORY FILTER - shows all categories or specific selected category
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    // STOCK LEVEL FILTER - filters by stock status
    const matchesStock = stockFilter === 'all' || 
      (stockFilter === 'low' && item.quantity > 0 && item.quantity <= item.minThreshold) ||      // Low stock items (excludes out of stock)
      (stockFilter === 'out' && item.quantity === 0) ||                     // Out of stock items
      (stockFilter === 'in_stock' && item.quantity > item.minThreshold);    // Well-stocked items
    
    // Item must match ALL filter criteria to be displayed
    return matchesSearch && matchesCategory && matchesStock;
  });

  // ============================================================================
  // DASHBOARD STATISTICS CALCULATIONS
  // ============================================================================
  
  // LOW STOCK ALERT - items that have stock but are at or below minimum threshold
  const lowStockItems = state.inventory.filter(item => 
    Number(item.quantity) > 0 && Number(item.quantity) <= Number(item.minThreshold)
  );
  
  // OUT OF STOCK - items with zero quantity (critical alert)
  const outOfStockItems = state.inventory.filter(item => Number(item.quantity) === 0);
  
  // TOTAL INVENTORY VALUE - sum of (quantity × unit price) for all items
  const totalValue = state.inventory.reduce((sum, item) => 
    sum + (item.quantity * item.price), 0
  );

  // ============================================================================
  // FORM HANDLING FUNCTIONS
  // ============================================================================
  
  // Handle form input changes - updates formData state with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value  // Dynamically update the field that changed
    }));

    // Real-time validation - validate field as user types (after a brief delay)
    if (isValidating || formErrors[name]) {
      const error = validateField(name, value);
      setFormErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  // Handle field blur - validate when user leaves field
  const handleFieldBlur = (e) => {
    const { name, value } = e.target;
    setIsValidating(true);
    const error = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // ============================================================================
  // CRUD OPERATIONS - CREATE AND UPDATE
  // ============================================================================
  
  // Handle form submission for both creating new items and editing existing ones
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    
    // Enable validation mode
    setIsValidating(true);
    
    // Validate entire form
    const errors = validateForm();
    setFormErrors(errors);
    
    // Stop submission if validation fails
    if (!isFormValid()) {
      // Scroll to first error field
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.focus();
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    try {
      // Prepare payload - convert string inputs to proper number types
      const payload = {
        ...formData,
        // Trim text fields
        name: formData.name.trim(),
        category: formData.category.trim(),
        supplier: formData.supplier.trim(),
        // Convert numeric fields
        quantity: Number(formData.quantity || 0),        // Ensure quantity is a number
        price: Number(formData.price || 0),              // Ensure price is a number
        minThreshold: Number(formData.minThreshold || 0) // Ensure threshold is a number
      };
      
      if (editingItem) {
        // UPDATE EXISTING ITEM - PUT request to /inventory/:id
        console.log('Updating item with ID:', editingItem.id, 'Payload:', payload); // Debug log
        const resp = await apiRequest(`/inventory/${editingItem.id}`, { 
          method: 'PUT', 
          body: payload 
        });
        console.log('Update response:', resp); // Debug log
        // Update global state with modified item
        dispatch({ type: 'UPDATE_INVENTORY_ITEM', payload: resp.data });
      } else {
        // CREATE NEW ITEM - POST request to /inventory
        const resp = await apiRequest('/inventory', { 
          method: 'POST', 
          body: payload 
        });
        // Add new item to global state
        dispatch({ type: 'ADD_INVENTORY_ITEM', payload: resp.data });
      }
      
      // Reset form and close modal after successful operation
      setShowModal(false);
      setEditingItem(null);
      setFormData({
        name: '',
        category: '',
        supplier: '',
        quantity: '',
        price: '',
        minThreshold: ''
      });
      setFormErrors({});
      setIsValidating(false);
      
    } catch (e) {
      // Handle API errors (validation, network, authorization, etc.)
      console.error('Error saving item:', e); // Debug log
      console.error('Error response:', e.response); // Debug log
      if (e.response?.data?.errors) {
        // Server-side validation errors
        setFormErrors(e.response.data.errors);
      } else if (e.response?.data?.message) {
        // Generic server error
        setFormErrors({ general: e.response.data.message });
      } else {
        // Network or other errors
        setFormErrors({ general: 'Failed to save item. Please try again.' });
      }
    }
  };

  // ============================================================================
  // CRUD OPERATIONS - EDIT PREPARATION
  // ============================================================================
  
  // Prepare item for editing - populate form with existing data
  const handleEdit = (item) => {
    console.log('Edit button clicked for item:', item); // Debug log
    setEditingItem(item);           // Set current item being edited
    // Pre-fill form with existing data - convert numbers to strings for form inputs
    const formDataForEdit = {
      name: item.name || '',
      category: item.category || '',
      supplier: item.supplier || '',
      quantity: String(item.quantity || ''),
      price: String(item.price || ''),
      minThreshold: String(item.minThreshold || '')
    };
    console.log('Setting form data for edit:', formDataForEdit); // Debug log
    setFormData(formDataForEdit);
    setFormErrors({});              // Clear any previous validation errors
    setIsValidating(false);         // Reset validation state
    setShowModal(true);             // Open modal for editing
  };

  // ============================================================================
  // CRUD OPERATIONS - DELETE
  // ============================================================================
  
  // Delete inventory item with confirmation
  const handleDelete = async (itemId) => {
    // Show confirmation dialog to prevent accidental deletions
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        // Send DELETE request to backend
        await apiRequest(`/inventory/${itemId}`, { method: 'DELETE' });
        
        // Remove item from global state
        dispatch({ type: 'DELETE_INVENTORY_ITEM', payload: itemId });
      } catch (e) {
        // Handle errors (network issues, authorization, etc.)
        // In production, you might want to show error messages
      }
    }
  };

  // ============================================================================
  // STOCK REDUCTION FUNCTIONS
  // ============================================================================
  
  // Handle single item stock reduction
  const handleReduceStock = (item) => {
    setSelectedItem(item);
    setStockReductionMode('single');
    setShowStockReductionModal(true);
  };
  
  // Handle bulk stock reduction
  const handleBulkReduceStock = () => {
    setSelectedItem(null);
    setStockReductionMode('bulk');
    setShowStockReductionModal(true);
  };
  
  // Handle successful stock reduction
  const handleStockReductionSuccess = (data) => {
    // Refresh inventory data
    dispatch({ type: 'SET_INVENTORY', payload: state.inventory.map(item => 
      item.id === data.id ? data : item
    )});
    
    // Close modal
    setShowStockReductionModal(false);
    setSelectedItem(null);
  };

  // ============================================================================
  // STOCK STATUS LOGIC - CRITICAL BUSINESS LOGIC FOR INVENTORY MONITORING
  // ============================================================================
  
  /**
   * Determines the stock status and visual styling for inventory items
   * This is the core logic for inventory monitoring and alerts
   * 
   * @param {Object} item - Inventory item object
   * @returns {Object} Status object with display properties
   */
  const getStockStatus = (item) => {
    // CRITICAL: Out of Stock - Zero inventory (Red alert)
    if (item.quantity === 0) return { 
      status: 'out', 
      color: 'text-red-600',      // Red text color
      bg: 'bg-red-100'            // Light red background
    };
    
    // WARNING: Low Stock - At or below minimum threshold (Yellow warning)
    if (item.quantity <= item.minThreshold) return { 
      status: 'low', 
      color: 'text-yellow-600',   // Yellow text color
      bg: 'bg-yellow-100'         // Light yellow background
    };
    
    // NORMAL: Good Stock - Above minimum threshold (Green, all good)
    return { 
      status: 'good', 
      color: 'text-green-600',    // Green text color
      bg: 'bg-green-100'          // Light green background
    };
  };

  // ============================================================================
  // ROLE-BASED PERMISSIONS - SECURITY CONTROLS
  // ============================================================================
  // color-bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded
  // Permission checks based on user role for UI security
  const canDelete = user?.role === 'owner';     // Only owners can delete items
  const canEdit = user?.role === 'owner' || user?.role === 'receptionist';       // Owners and receptionists can edit items
  // Note: canManage (for adding items) is defined earlier and includes 'owner' and 'receptionist' roles

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage spare parts and track stock levels
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {canManage && (
            <button
              onClick={() => {
                setEditingItem(null);       // Clear editing state
                setFormData({               // Reset form data
                  name: '',
                  category: '',
                  supplier: '',
                  quantity: '',
                  price: '',
                  minThreshold: ''
                });
                setFormErrors({});          // Clear validation errors
                setIsValidating(false);     // Reset validation state
                setShowModal(true);         // Open modal
              }}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Item
            </button>
          )}
          
          {canManage && (
            <button
              onClick={handleBulkReduceStock}
              className="flex items-center bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
            >
              <Layers className="h-4 w-4 mr-2" />
              Bulk Reduce
            </button>
          )}
        </div>
        

        
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Items</p>
              <p className="text-2xl font-semibold text-gray-900">{state.inventory.length}</p>
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
              <p className="text-2xl font-semibold text-gray-900">{lowStockItems.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-red-100">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Out of Stock</p>
              <p className="text-2xl font-semibold text-gray-900">{outOfStockItems.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-semibold text-gray-900">${totalValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-field"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="input-field"
        >
          <option value="all">All Stock Levels</option>
          <option value="in_stock">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
        
        <div className="flex items-center text-sm text-gray-600">
          <Filter className="h-4 w-4 mr-2" />
          {filteredItems.length} items found
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">
              Low Stock Alert: {lowStockItems.length} items need attention
            </h3>
          </div>
          <div className="mt-2 text-sm text-yellow-700">
            {lowStockItems.slice(0, 3).map(item => item.name).join(', ')}
            {lowStockItems.length > 3 && ` and ${lowStockItems.length - 3} more...`}
          </div>
        </div>

        
      )}
      

      {/* Inventory Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Item</th>
                <th className="table-header">Category</th>
                <th className="table-header">Supplier</th>
                <th className="table-header">Quantity</th>
                <th className="table-header">Price</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const stockStatus = getStockStatus(item);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">Min: {item.minThreshold}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="table-cell text-sm text-gray-900">{item.supplier}</td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <Hash className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">{item.quantity}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      {/* STOCK STATUS BADGE - Visual indicator of inventory health */}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                        {/* Convert internal status codes to user-friendly text */}
                        {stockStatus.status === 'out' ? 'Out of Stock' :     /* Red - Critical (quantity = 0) */
                         stockStatus.status === 'low' ? 'Low Stock' :        /* Yellow - Warning (quantity <= threshold) */
                         'In Stock'}                                         {/* Green - Normal (quantity > threshold) */}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        {canEdit && (
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-gray-400 hover:text-blue-600"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {canManage && (
                          <button
                            onClick={() => handleReduceStock(item)}
                            className="text-gray-400 hover:text-orange-600"
                            title="Reduce Stock"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(item.id)}
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

      {/* Add/Edit Item Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
                  </h3>
                  
                  <div className="space-y-4">
                    {/* General error message */}
                    {formErrors.general && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-600">{formErrors.general}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        onBlur={handleFieldBlur}
                        required
                        className={`input-field ${formErrors.name ? 'border-red-300 ring-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        onBlur={handleFieldBlur}
                        required
                        className={`input-field ${formErrors.category ? 'border-red-300 ring-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                        placeholder="e.g., Engine, Brake System, Electrical"
                      />
                      {formErrors.category && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Supplier *
                      </label>
                      <input
                        type="text"
                        name="supplier"
                        value={formData.supplier}
                        onChange={handleInputChange}
                        onBlur={handleFieldBlur}
                        required
                        className={`input-field ${formErrors.supplier ? 'border-red-300 ring-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                      />
                      {formErrors.supplier && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.supplier}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          onBlur={handleFieldBlur}
                          required
                          min="0"
                          className={`input-field ${formErrors.quantity ? 'border-red-300 ring-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                        />
                        {formErrors.quantity && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price *
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          onBlur={handleFieldBlur}
                          required
                          min="0"
                          step="0.01"
                          className={`input-field ${formErrors.price ? 'border-red-300 ring-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                        />
                        {formErrors.price && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Threshold *
                      </label>
                      <input
                        type="number"
                        name="minThreshold"
                        value={formData.minThreshold}
                        onChange={handleInputChange}
                        onBlur={handleFieldBlur}
                        required
                        min="0"
                        className={`input-field ${formErrors.minThreshold ? 'border-red-300 ring-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                        placeholder="Alert when stock falls below this number"
                      />
                      {formErrors.minThreshold && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.minThreshold}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn-primary sm:ml-3 sm:w-auto w-full"
                  >
                    {editingItem ? 'Update' : 'Add'} Item
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                      setFormData({
                        name: '',
                        category: '',
                        supplier: '',
                        quantity: '',
                        price: '',
                        minThreshold: ''
                      });
                      setFormErrors({});
                      setIsValidating(false);
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

      {/* Stock Reduction Modal */}
      <StockReductionModal
        isOpen={showStockReductionModal}
        onClose={() => {
          setShowStockReductionModal(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        mode={stockReductionMode}
        onSuccess={handleStockReductionSuccess}
      />
    </div>
  );
};

export default Inventory;
