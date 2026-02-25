import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  Filter,
  X,
  DollarSign,
  Minus,
  Layers,
  Clock,
  ChevronRight,
  TrendingUp,
  Tag
} from 'lucide-react';
import StockReductionModal from '../components/StockReductionModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/Toast';

const Inventory = () => {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const { show } = useToast();
  const canManage = user?.role === 'owner' || user?.role === 'receptionist';
  const canDelete = user?.role === 'owner';
  const canEdit = user?.role === 'owner' || user?.role === 'receptionist';

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showStockReductionModal, setShowStockReductionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [stockReductionMode, setStockReductionMode] = useState('single');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    supplier: '',
    quantity: '',
    price: '',
    minThreshold: '',
    sku: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const resp = await apiRequest('/inventory');
        const list = Array.isArray(resp?.data) ? resp.data : [];
        const normalized = list.map(i => ({
          ...i,
          minThreshold: Number(i.minThreshold ?? 0),
          price: Number(i.price ?? 0),
          quantity: Number(i.quantity ?? 0),
          lastUpdated: i.lastUpdated || i.updatedAt || i.createdAt || new Date().toISOString()
        }));
        dispatch({ type: 'SET_INVENTORY', payload: normalized });
      } catch (e) {
        show('Failed to load inventory data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [dispatch]);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value || value.trim().length === 0) return 'Item name is required';
        if (value.trim().length < 2) return 'Item name too short';
        return null;
      case 'category':
        if (!value || value.trim().length === 0) return 'Category is required';
        return null;
      case 'supplier':
        if (!value || value.trim().length === 0) return 'Supplier is required';
        return null;
      case 'quantity':
        if (value === '' || value === null) return 'Quantity is required';
        if (Number(value) < 0) return 'Quantity cannot be negative';
        return null;
      case 'price':
        if (value === '' || value === null) return 'Price is required';
        if (Number(value) < 0) return 'Price cannot be negative';
        return null;
      default:
        return null;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        supplier: formData.supplier,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        minThreshold: Number(formData.minThreshold || 0),
        sku: formData.sku
      };

      if (editingItem) {
        const resp = await apiRequest(`/inventory/${editingItem.id || editingItem._id}`, {
          method: 'PUT',
          body: payload
        });
        dispatch({ type: 'UPDATE_INVENTORY_ITEM', payload: { ...resp.data, id: resp.data.id || resp.data._id } });
        show('Item updated successfully', 'success');
      } else {
        const resp = await apiRequest('/inventory', {
          method: 'POST',
          body: payload
        });
        dispatch({ type: 'ADD_INVENTORY_ITEM', payload: { ...resp.data, id: resp.data.id || resp.data._id } });
        show('Item added successfully', 'success');
      }
      setShowModal(false);
      setEditingItem(null);
    } catch (e) {
      show(e.message || 'Failed to save item', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await apiRequest(`/inventory/${id}`, { method: 'DELETE' });
      dispatch({ type: 'DELETE_INVENTORY_ITEM', payload: id });
      show('Item deleted successfully', 'success');
    } catch (e) {
      show('Failed to delete item', 'error');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      supplier: item.supplier,
      quantity: item.quantity,
      price: item.price,
      minThreshold: item.minThreshold,
      sku: item.sku || ''
    });
    setShowModal(true);
  };

  const handleReduceStock = (item) => {
    setSelectedItem(item);
    setStockReductionMode('single');
    setShowStockReductionModal(true);
  };

  const handleBulkReduceStock = () => {
    setStockReductionMode('bulk');
    setShowStockReductionModal(true);
  };

  const handleStockReductionSuccess = () => {
    // Inventory is already updated in global state via the modal's internal logic or we can refresh
    // For simplicity, let's assume the modal handles the state update via dispatch
  };

  const categories = [...new Set(state.inventory.map(item => item.category))];

  const filteredItems = state.inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    let matchesStock = true;
    if (stockFilter === 'low') matchesStock = item.quantity > 0 && item.quantity <= item.minThreshold;
    else if (stockFilter === 'out') matchesStock = item.quantity <= 0;
    else if (stockFilter === 'in_stock') matchesStock = item.quantity > item.minThreshold;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const lowStockItems = state.inventory.filter(item => item.quantity > 0 && item.quantity <= item.minThreshold);
  const outOfStockItems = state.inventory.filter(item => item.quantity <= 0);
  const totalValue = state.inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const getStockStatus = (item) => {
    if (item.quantity <= 0) return { status: 'out', label: 'Extinct', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
    if (item.quantity <= item.minThreshold) return { status: 'low', label: 'Critical', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { status: 'ok', label: 'Optimal', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10 pb-20"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black gradient-text tracking-tighter">Inventory Matrix</h1>
          <p className="mt-2 text-slate-500 font-medium text-lg">
            Strategic asset management and automated stock intelligence
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {canManage && (
            <button
              onClick={handleBulkReduceStock}
              className="btn-secondary group !bg-slate-900 !text-white hover:!bg-slate-800"
            >
              <Layers className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              Batch Process
            </button>
          )}
          {canManage && (
            <button
              onClick={() => {
                setEditingItem(null);
                setFormData({ name: '', category: '', supplier: '', quantity: '', price: '', minThreshold: '', sku: '' });
                setShowModal(true);
              }}
              className="btn-primary group shadow-xl shadow-blue-500/25"
            >
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
              Register Asset
            </button>
          )}
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Inventory', value: state.inventory.length, sub: 'Registered Parts', icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Critical Alerts', value: lowStockItems.length, sub: 'Action Required', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Stockouts', value: outOfStockItems.length, sub: 'Immediate Need', icon: X, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Portfolio Value', value: `${totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`, sub: 'Total Asset Worth', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className="premium-card group hover:scale-[1.02] transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:rotate-12 transition-transform shadow-sm`}>
                <stat.icon className="h-7 w-7" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                <p className="text-3xl font-black text-slate-800 dark:text-white mt-1 tracking-tighter">{stat.value}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.sub}</span>
              <ChevronRight className="h-3 w-3 text-slate-300 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters Hub */}
      <motion.div variants={itemVariants} className="glass-panel p-6 rounded-[2.5rem] flex flex-wrap items-center gap-6 shadow-2xl shadow-slate-200/50">
        <div className="relative flex-1 min-w-[300px] group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, SKU, or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field !pl-14 !h-14 font-bold !rounded-2xl"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="h-14 w-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
            <Filter className="h-5 w-5" />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field !h-14 !w-48 font-bold !rounded-2xl"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="input-field !h-14 !w-48 font-bold !rounded-2xl"
          >
            <option value="all">All Levels</option>
            <option value="in_stock">Healthy</option>
            <option value="low">Critical</option>
            <option value="out">Depleted</option>
          </select>
        </div>
      </motion.div>

      {/* Main Asset Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => {
            const status = getStockStatus(item);
            return (
              <motion.div
                key={item.id || item._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                variants={itemVariants}
                className="premium-card group hover:shadow-2xl hover:border-blue-500/20 transition-all !p-8"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center">
                    <div className="h-16 w-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center text-slate-500 group-hover:from-blue-600 group-hover:to-indigo-700 group-hover:text-white transition-all shadow-inner group-hover:rotate-6">
                      <Package className="h-8 w-8" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">{item.name}</h3>
                      <div className="flex items-center mt-1">
                        <Tag className="h-3 w-3 text-slate-400 mr-2" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.sku || 'NO SKU'}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${status.bg} ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Current Stock</p>
                    <p className={`text-4xl font-black text-center ${item.quantity <= item.minThreshold ? 'text-amber-600' : 'text-slate-800 dark:text-white'}`}>
                      {item.quantity}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Unit Price</p>
                    <p className="text-4xl font-black text-center text-emerald-600 tracking-tighter">
                      ${item.price.toFixed(0)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Industry Classification</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.category}</span>
                  </div>
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Supplier</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.supplier}</span>
                  </div>
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Safety Threshold</span>
                    <span className="text-sm font-bold text-amber-600 uppercase tracking-widest">{item.minThreshold} Units</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleReduceStock(item)}
                      className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-orange-500 hover:text-white rounded-xl transition-all shadow-sm"
                      title="Dispatch Stock"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    {canEdit && (
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                        title="Update Record"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(item.id || item._id)}
                        className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm"
                        title="Decouple Asset"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">
                      {editingItem ? 'Update System Resource' : 'Register New Resource'}
                    </h2>
                    <p className="text-slate-500 font-medium">Configure item parameters and thresholds</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-slate-200 transition-colors">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`input-field !h-14 font-bold ${formErrors.name ? '!border-red-500' : ''}`}
                        placeholder="e.g., Ceramic Brake Pads"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU Identification</label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        className="input-field !h-14 font-bold"
                        placeholder="e.g., BRK-CER-01"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="input-field !h-14 font-bold"
                        placeholder="e.g., Braking System"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Supplier</label>
                      <input
                        type="text"
                        name="supplier"
                        value={formData.supplier}
                        onChange={handleInputChange}
                        className="input-field !h-14 font-bold"
                        placeholder="e.g., Brembo SpA"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        className="input-field !h-14 font-bold text-center"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Price ($)</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="input-field !h-14 font-bold text-center"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Safety Min</label>
                      <input
                        type="number"
                        name="minThreshold"
                        value={formData.minThreshold}
                        onChange={handleInputChange}
                        className="input-field !h-14 font-bold text-center"
                      />
                    </div>
                  </div>

                  <div className="pt-8 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="btn-secondary flex-1 !h-16 font-black uppercase tracking-widest !rounded-2xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary flex-[2] !h-16 font-black uppercase tracking-widest !rounded-2xl shadow-xl shadow-blue-500/25"
                    >
                      {editingItem ? 'Update Matrix' : 'Initialize Asset'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
    </motion.div>
  );
};

export default Inventory;
