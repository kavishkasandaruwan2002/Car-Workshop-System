import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { 
  CreditCard, 
  DollarSign, 
  History, 
  Plus,
  CheckCircle,
  AlertCircle,
  Calendar,
  Receipt,
  Download,
  Trash2,
  Edit
} from 'lucide-react';

const PaymentHistory = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiRequest('/payments');
        const list = Array.isArray(resp?.data) ? resp.data : [];
        const normalized = list.map(p => ({
          ...p,
          amount: Number(p.amount || 0),
          date: p.date ? p.date.substring(0, 10) : new Date().toISOString().substring(0,10)
        }));
        setPayments(normalized);
      } catch (e) {}
    })();
  }, [user.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        amount: parseFloat(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        description: paymentForm.description,
        date: paymentForm.date,
        status: 'completed',
        transactionId: editingPayment?.transactionId || `TXN${Date.now()}`,
        ...(paymentForm.paymentMethod === 'card' && {
          cardLastFour: paymentForm.cardNumber.slice(-4)
        })
      };

      if (editingPayment) {
        const resp = await apiRequest(`/payments/${editingPayment.id}`, { method: 'PUT', body: payload });
        setPayments(prev => prev.map(payment => 
          payment.id === editingPayment.id ? resp.data : payment
        ));
        setEditingPayment(null);
        alert('Payment updated successfully!');
      } else {
        const resp = await apiRequest('/payments', { method: 'POST', body: payload });
        setPayments(prev => [resp.data, ...prev]);
        alert('Payment created successfully!');
      }

      // Reset form
      setPaymentForm({
        amount: '',
        paymentMethod: 'card',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Payment operation failed:', error);
      alert(`Failed to ${editingPayment ? 'update' : 'create'} payment. Please try again.`);
    }
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setPaymentForm({
      amount: payment.amount.toString(),
      paymentMethod: payment.paymentMethod,
      cardNumber: payment.cardLastFour ? `****${payment.cardLastFour}` : '',
      expiryDate: '',
      cvv: '',
      description: payment.description,
      date: payment.date
    });
    setShowPaymentModal(true);
  };

  const handleDeletePayment = async (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      try {
        console.log('Attempting to delete payment with ID:', paymentId);
        const response = await apiRequest(`/payments/${paymentId}`, { method: 'DELETE' });
        console.log('Delete response:', response);
        setPayments(prev => prev.filter(payment => payment.id !== paymentId));
        alert('Payment deleted successfully!');
      } catch (error) {
        console.error('Failed to delete payment:', error);
        console.error('Error status:', error.status);
        console.error('Error data:', error.data);
        
        let errorMessage = 'Failed to delete payment. Please try again.';
        
        if (error.status === 403) {
          errorMessage = 'You do not have permission to delete this payment.';
        } else if (error.status === 404) {
          errorMessage = 'Payment not found. It may have already been deleted.';
        } else if (error.status === 401) {
          errorMessage = 'You are not logged in. Please login and try again.';
        } else if (error.status === 400) {
          errorMessage = 'Invalid payment ID format.';
        }
        
        alert(errorMessage);
      }
    }
  };

  const generateReceipt = (payment) => {
    const receiptContent = `
AUTO WORKSHOP PAYMENT RECEIPT
=============================

Customer: ${user.name}
Email: ${user.email}
Date: ${payment.date}
Transaction ID: ${payment.transactionId}

Payment Details:
- Amount: $${payment.amount}
- Method: ${payment.paymentMethod === 'card' ? 'Credit Card' : 'Cash'}
- Description: ${payment.description}
${payment.cardLastFour ? `- Card Ending: ****${payment.cardLastFour}` : ''}

Status: ${payment.status.toUpperCase()}

Thank you for your payment!
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-receipt-${payment.transactionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const cardPayments = payments.filter(p => p.paymentMethod === 'card').length;
  const cashPayments = payments.filter(p => p.paymentMethod === 'cash').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your payments and view transaction history
              </p>
            </div>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Payment</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Paid</p>
                <p className="text-2xl font-semibold text-gray-900">${totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <History className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Payments</p>
                <p className="text-2xl font-semibold text-gray-900">{payments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Card Payments</p>
                <p className="text-2xl font-semibold text-gray-900">{cardPayments}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Cash Payments</p>
                <p className="text-2xl font-semibold text-gray-900">{cashPayments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History Table */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Payment History</h3>
          </div>
          
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
              <p className="text-gray-500 mb-6">Start by adding your first payment record.</p>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Payment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.transactionId}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${payment.amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {payment.paymentMethod === 'card' ? (
                            <>
                              <CreditCard className="h-4 w-4 text-blue-600 mr-2" />
                              <span className="text-sm text-gray-900">
                                Card ****{payment.cardLastFour}
                              </span>
                            </>
                          ) : (
                            <>
                              <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                              <span className="text-sm text-gray-900">Cash</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {new Date(payment.date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => generateReceipt(payment)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            title="Download Receipt"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditPayment(payment)}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                            title="Edit Payment"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePayment(payment.id)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                            title="Delete Payment"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingPayment ? 'Edit Payment' : 'Add New Payment'}
            </h3>
            
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={paymentForm.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={paymentForm.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              
              {paymentForm.paymentMethod === 'card' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={paymentForm.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={paymentForm.paymentMethod === 'card'}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={paymentForm.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required={paymentForm.paymentMethod === 'card'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={paymentForm.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required={paymentForm.paymentMethod === 'card'}
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={paymentForm.description}
                  onChange={handleInputChange}
                  placeholder="e.g., Oil Change Service"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={paymentForm.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setEditingPayment(null);
                    setPaymentForm({
                      amount: '',
                      paymentMethod: 'card',
                      cardNumber: '',
                      expiryDate: '',
                      cvv: '',
                      description: '',
                      date: new Date().toISOString().split('T')[0]
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingPayment ? 'Update Payment' : 'Add Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
