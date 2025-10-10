/**
 * STOCK REDUCTION MODAL - ENHANCED INVENTORY MANAGEMENT
 * 
 * This component provides a user-friendly interface for reducing stock levels.
 * It supports single item reduction and bulk operations with proper validation
 * and audit trail tracking.
 * 
 * Features:
 * - Single item stock reduction
 * - Bulk stock reduction
 * - Reason tracking (repair, sale, adjustment, damage, other)
 * - Job ID association
 * - Notes and comments
 * - Stock validation
 * - Audit trail
 */

import React, { useState } from 'react';
import { apiRequest } from '../api/client';
import {
  Package,          // Package icon
  Minus,           // Reduce icon
  AlertTriangle,   // Warning icon
  CheckCircle,     // Success icon
  X,               // Close icon
  FileText,        // Notes icon
  Wrench,          // Repair icon
  ShoppingCart,    // Sale icon
  Settings,        // Adjustment icon
  AlertCircle,     // Damage icon
  MoreHorizontal   // Other icon
} from 'lucide-react';

const StockReductionModal = ({ 
  isOpen, 
  onClose, 
  item, 
  onSuccess,
  mode = 'single' // 'single' or 'bulk'
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [formData, setFormData] = useState({
    quantity: '',
    reason: 'repair',
    jobId: '',
    notes: ''
  });
  
  const [bulkItems, setBulkItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // ============================================================================
  // REASON OPTIONS
  // ============================================================================
  
  const reasonOptions = [
    { value: 'repair', label: 'Used in Repair', icon: Wrench, color: 'text-blue-600' },
    { value: 'sale', label: 'Sold to Customer', icon: ShoppingCart, color: 'text-green-600' },
    { value: 'adjustment', label: 'Inventory Adjustment', icon: Settings, color: 'text-gray-600' },
    { value: 'damage', label: 'Damaged/Defective', icon: AlertCircle, color: 'text-red-600' },
    { value: 'other', label: 'Other', icon: MoreHorizontal, color: 'text-purple-600' }
  ];
  
  // ============================================================================
  // FORM HANDLING
  // ============================================================================
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleBulkItemChange = (index, field, value) => {
    setBulkItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };
  
  const addBulkItem = () => {
    setBulkItems(prev => [...prev, {
      itemId: '',
      itemName: '',
      quantity: '',
      reason: 'repair',
      notes: ''
    }]);
  };
  
  const removeBulkItem = (index) => {
    setBulkItems(prev => prev.filter((_, i) => i !== index));
  };
  
  // ============================================================================
  // VALIDATION
  // ============================================================================
  
  const validateForm = () => {
    if (mode === 'single') {
      if (!formData.quantity || formData.quantity <= 0) {
        setError('Please enter a valid quantity');
        return false;
      }
      if (item && formData.quantity > item.quantity) {
        setError(`Cannot reduce more than available stock (${item.quantity} units)`);
        return false;
      }
    } else {
      if (bulkItems.length === 0) {
        setError('Please add at least one item');
        return false;
      }
      for (const bulkItem of bulkItems) {
        if (!bulkItem.itemId || !bulkItem.quantity || bulkItem.quantity <= 0) {
          setError('All items must have valid ID and quantity');
          return false;
        }
      }
    }
    return true;
  };
  
  // ============================================================================
  // API CALLS
  // ============================================================================
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (mode === 'single') {
        // Single item reduction
        const response = await apiRequest(`/inventory/${item.id}/reduce`, {
          method: 'PUT',
          body: {
            quantity: Number(formData.quantity),
            reason: formData.reason,
            jobId: formData.jobId || undefined,
            notes: formData.notes || undefined
          }
        });
        
        setSuccess(true);
        onSuccess?.(response.data);
        
        // Reset form
        setFormData({
          quantity: '',
          reason: 'repair',
          jobId: '',
          notes: ''
        });
        
      } else {
        // Bulk reduction
        const response = await apiRequest('/inventory/bulk-reduce', {
          method: 'POST',
          body: {
            items: bulkItems.map(item => ({
              itemId: item.itemId,
              quantity: Number(item.quantity),
              reason: item.reason,
              notes: item.notes
            })),
            reason: formData.reason,
            notes: formData.notes
          }
        });
        
        setSuccess(true);
        onSuccess?.(response.data);
        
        // Reset form
        setBulkItems([]);
        setFormData({
          quantity: '',
          reason: 'repair',
          jobId: '',
          notes: ''
        });
      }
      
    } catch (err) {
      console.error('Stock reduction error:', err);
      setError(err.response?.data?.message || 'Failed to reduce stock');
    } finally {
      setLoading(false);
    }
  };
  
  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-red-100">
                    <Minus className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {mode === 'single' ? 'Reduce Stock' : 'Bulk Stock Reduction'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {mode === 'single' 
                        ? `Reduce stock for ${item?.name || 'selected item'}`
                        : 'Reduce stock for multiple items at once'
                      }
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}
              
              {/* Success Message */}
              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-sm text-green-600">
                      Stock reduced successfully!
                    </p>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {mode === 'single' ? (
                  // Single Item Form
                  <>
                    {/* Item Info */}
                    {item && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <Package className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-500">
                              Current Stock: {item.quantity} units | 
                              Min Threshold: {item.minThreshold} units
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity to Reduce *
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        min="0.01"
                        step="0.01"
                        required
                        className="input-field"
                        placeholder="Enter quantity to reduce"
                      />
                    </div>
                    
                    {/* Reason */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Reduction *
                      </label>
                      <select
                        name="reason"
                        value={formData.reason}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        {reasonOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Job ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job ID (Optional)
                      </label>
                      <input
                        type="text"
                        name="jobId"
                        value={formData.jobId}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Enter job ID if used in repair"
                      />
                    </div>
                    
                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (Optional)
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        className="input-field"
                        placeholder="Additional notes about this stock reduction"
                      />
                    </div>
                  </>
                ) : (
                  // Bulk Items Form
                  <>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">Items to Reduce</h4>
                      <button
                        type="button"
                        onClick={addBulkItem}
                        className="btn-primary text-sm"
                      >
                        Add Item
                      </button>
                    </div>
                    
                    {bulkItems.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No items added yet. Click "Add Item" to get started.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {bulkItems.map((bulkItem, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                Item {index + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeBulkItem(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Item ID *
                                </label>
                                <input
                                  type="text"
                                  value={bulkItem.itemId}
                                  onChange={(e) => handleBulkItemChange(index, 'itemId', e.target.value)}
                                  className="input-field text-sm"
                                  placeholder="Item ID"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Quantity *
                                </label>
                                <input
                                  type="number"
                                  value={bulkItem.quantity}
                                  onChange={(e) => handleBulkItemChange(index, 'quantity', e.target.value)}
                                  min="0.01"
                                  step="0.01"
                                  className="input-field text-sm"
                                  placeholder="Qty"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Reason
                                </label>
                                <select
                                  value={bulkItem.reason}
                                  onChange={(e) => handleBulkItemChange(index, 'reason', e.target.value)}
                                  className="input-field text-sm"
                                >
                                  {reasonOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Notes
                                </label>
                                <input
                                  type="text"
                                  value={bulkItem.notes}
                                  onChange={(e) => handleBulkItemChange(index, 'notes', e.target.value)}
                                  className="input-field text-sm"
                                  placeholder="Notes"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="btn-danger sm:ml-3 sm:w-auto w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Reducing Stock...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Minus className="h-4 w-4 mr-2" />
                    Reduce Stock
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary mt-3 sm:mt-0 sm:w-auto w-full"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockReductionModal;
