import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { Link, useNavigate } from 'react-router-dom';
import {
  Car,
  Calendar,
  Clock,
  CreditCard,
  Download,
  History,
  Bell,
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Plus
} from 'lucide-react';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [vehicleHistory, setVehicleHistory] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [serviceTypeSelection, setServiceTypeSelection] = useState('Oil Change');

  // Load real data for customer's cars/jobs
  useEffect(() => {
    (async () => {
      try {
        const jobsResp = await apiRequest('/jobs');
        const jobs = Array.isArray(jobsResp?.data) ? jobsResp.data : [];
        const mapped = jobs.map(j => ({
          id: j.id,
          date: new Date(j.createdAt).toLocaleDateString(),
          service: j.appointment?.serviceType || (j.tasks?.[0]?.description || 'Service'),
          vehicle: j.car ? `${j.car.make} ${j.car.model}` : (j.appointment?.vehicle || 'Unknown Vehicle'),
          cost: 0,
          status: j.status || 'pending',
          mechanic: j.assignedMechanic || '—'
        }));
        setVehicleHistory(mapped);
      } catch {}

      try {
        const apptResp = await apiRequest('/appointments');
        const appts = Array.isArray(apptResp?.data) ? apptResp.data : [];
        const upcoming = appts
          .filter(a => new Date(a.preferredDate) >= new Date())
          .map(a => ({
            id: a.id,
            date: new Date(a.preferredDate).toLocaleDateString(),
            time: new Date(a.preferredDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            service: a.serviceType,
        status: 'scheduled',
            vehicle: a.vehicle
          }));
        setAppointments(upcoming);
      } catch {}
    })();

    // Mock available time slots
    setAvailableSlots([
      { id: 1, date: '2024-01-26', time: '9:00 AM', available: true },
      { id: 2, date: '2024-01-26', time: '11:00 AM', available: true },
      { id: 3, date: '2024-01-26', time: '2:00 PM', available: false },
      { id: 4, date: '2024-01-27', time: '10:00 AM', available: true },
      { id: 5, date: '2024-01-27', time: '3:00 PM', available: true },
    ]);
  }, []);

  const handleBookAppointment = (slot) => {
    setSelectedSlot(slot);
    setShowPaymentModal(true);
  };

  const handlePayment = async (paymentInfo) => {
    try {
      // Create payment record in backend
      const paymentPayload = {
        amount: 150.00, // Mock service cost
        paymentMethod: paymentInfo.method === 'credit' ? 'card' : paymentInfo.method,
        description: `Service booking for ${selectedSlot?.service || 'General Service'}`,
        date: new Date().toISOString(),
        status: 'completed',
        transactionId: `TXN${Date.now()}`,
        ...(paymentInfo.method === 'credit' && {
          cardLastFour: paymentInfo.cardNumber?.slice(-4) || '****'
        })
      };

      const response = await apiRequest('/payments', { 
        method: 'POST', 
        body: paymentPayload 
      });

      setPaymentData({
        ...paymentInfo,
        slot: selectedSlot,
        amount: 150.00,
        transactionId: paymentPayload.transactionId,
        id: response.data?.id
      });
      
      setShowPaymentModal(false);
      
      // Show success notification
      setTimeout(() => {
        alert('Payment successful! Your appointment has been confirmed.');
      }, 1000);
      
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    }
  };

  const generateReceipt = () => {
    if (!paymentData) return;

    const receiptContent = `
AUTO WORKSHOP RECEIPT
========================

Customer: ${user.name}
Email: ${user.email}
Date: ${new Date().toLocaleDateString()}
Transaction ID: ${paymentData.transactionId}

Service Details:
- Service: ${selectedSlot.service || 'General Service'}
- Date: ${selectedSlot.date}
- Time: ${selectedSlot.time}
- Amount: $${paymentData.amount}

Payment Method: ${paymentData.method}
Card Ending: ****${paymentData.cardNumber.slice(-4)}

Thank you for choosing our workshop!
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${paymentData.transactionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'history', name: 'Repair History', icon: History },
    { id: 'book', name: 'Book Appointment', icon: Calendar },
    { id: 'slots', name: 'Available Slots', icon: Clock },
    { id: 'payments', name: 'Payments', icon: CreditCard }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const vehicle = e.target.vehicle?.value || '';
      const serviceTypeValue = e.target.serviceType?.value || '';
      const otherType = e.target.otherType?.value || '';
      const serviceType = serviceTypeValue === 'other' ? (otherType || 'Other') : serviceTypeValue;
      const preferredDate = e.target.preferredDate?.value;
      const notes = e.target.notes?.value || '';
      await (await import('../api/client')).apiRequest('/appointments', {
        method: 'POST', body: {
          customerName: user?.name || 'Customer',
          customerEmail: user?.email || '',
          vehicle,
          serviceType,
          preferredDate,
          notes
        }
      });
      alert('Appointment submitted');
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome back, {user.name}! Manage your vehicle services.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Active Customer</span>
              </div>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Car className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Services</p>
                        <p className="text-2xl font-semibold text-gray-900">{vehicleHistory.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Calendar className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Upcoming Appointments</p>
                        <p className="text-2xl font-semibold text-gray-900">{appointments.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <CreditCard className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Spent</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          ${vehicleHistory.reduce((sum, service) => sum + service.cost, 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {vehicleHistory.slice(0, 3).map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{service.service}</p>
                            <p className="text-xs text-gray-500">{service.date} • {service.vehicle}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">${service.cost}</p>
                          <p className="text-xs text-gray-500">{service.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Repair History Tab */}
            {activeTab === 'history' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Vehicle Repair History</h3>
                <div className="space-y-4">
                  {vehicleHistory.map((service) => (
                    <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{service.service}</h4>
                          <p className="text-sm text-gray-500">{service.vehicle}</p>
                          <p className="text-xs text-gray-400">Mechanic: {service.mechanic}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">${service.cost}</p>
                          <p className="text-xs text-gray-500">{service.date}</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${service.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {service.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Book Appointment Tab */}
            {activeTab === 'book' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Book New Appointment</h3>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle
                      </label>
                      <input name="vehicle" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Toyota Camry 2020" required />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Type
                      </label>
                      <select name="serviceType" className="input-field" onChange={(e) => setServiceTypeSelection(e.target.value)} value={serviceTypeSelection}>
                        <option value="Oil Change">Oil Change</option>
                        <option value="Brake Service">Brake Service</option>
                        <option value="Engine Diagnostic">Engine Diagnostic</option>
                        <option value="Annual Inspection">Annual Inspection</option>
                        <option value="other">Other</option>
                      </select>
                      {serviceTypeSelection === 'other' && (
                        <input name="otherType" type="text" className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="If Other, specify" required />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date
                    </label>
                    <input name="preferredDate" type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" min={new Date().toISOString().split('T')[0]} required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea name="notes" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Any specific issues or requests..." />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Check Available Slots
                  </button>
                </form>
              </div>
            )}

            {/* Available Slots Tab */}
            {activeTab === 'slots' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Available Time Slots</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`border rounded-lg p-4 ${slot.available
                          ? 'border-green-200 bg-green-50 hover:bg-green-100 cursor-pointer'
                          : 'border-red-200 bg-red-50 cursor-not-allowed opacity-60'
                        }`}
                      onClick={() => slot.available && handleBookAppointment(slot)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{slot.date}</p>
                          <p className="text-lg font-semibold text-gray-900">{slot.time}</p>
                        </div>
                        <div className="flex items-center">
                          {slot.available ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                              <span className="text-sm text-green-600 font-medium">Available</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                              <span className="text-sm text-red-600 font-medium">Booked</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Payment Management</h3>
                    <Link
                      to="/customer/payments"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <CreditCard className="h-5 w-5" />
                      <span>Manage Payments</span>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Quick Payment</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Make a payment for services or add payment records to your history.
                      </p>
                      <Link
                        to="/customer/payments"
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Payment
                      </Link>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Payment History</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        View all your payment records, download receipts, and manage transactions.
                      </p>
                      <Link
                        to="/customer/payments"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <History className="h-4 w-4 mr-2" />
                        View History
                      </Link>
                    </div>
                  </div>
                </div>

                {paymentData && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Payment</h3>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Transaction #{paymentData.transactionId}</p>
                          <p className="text-sm text-gray-500">{paymentData.slot.date} at {paymentData.slot.time}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">${paymentData.amount}</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={generateReceipt}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Receipt
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Complete Payment</h3>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Appointment Details:</p>
              <p className="font-medium">{selectedSlot.date} at {selectedSlot.time}</p>
              <p className="text-lg font-semibold text-gray-900">Amount: $150.00</p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handlePayment({
                method: formData.get('method'),
                cardNumber: formData.get('cardNumber'),
                expiryDate: formData.get('expiryDate'),
                cvv: formData.get('cvv')
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select name="method" className="input-field">
                  <option>Credit Card</option>
                  <option>Debit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    name="expiryDate"
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Pay $150.00
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;



