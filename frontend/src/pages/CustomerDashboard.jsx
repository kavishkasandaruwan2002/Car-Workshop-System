import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Calendar,
  Clock,
  CreditCard,
  Download,
  History,
  CheckCircle,
  AlertCircle,
  User,
  Plus,
  ArrowRight,
  LogOut,
  Zap,
  Activity,
  ShieldCheck,
  Headphones,
  PhoneCall,
  Send,
  X,
  ShieldAlert,
  Sparkles,
  MessageSquare,
  Check,
  Lock
} from 'lucide-react';
import { useToast } from '../components/Toast';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { show } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [vehicleHistory, setVehicleHistory] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Modals state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [serviceTypeSelection, setServiceTypeSelection] = useState('Oil Change');

  // Support Proxy state
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportIssue, setSupportIssue] = useState('Emergency Roadside Assistance');
  const [supportPriority, setSupportPriority] = useState('High');
  const [supportNotes, setSupportNotes] = useState('');
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState(null);

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
          cost: j.totalAmount || 0,
          status: j.status || 'pending',
          mechanic: j.assignedMechanic || '—'
        }));
        setVehicleHistory(mapped);
      } catch { }

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
      } catch { }
    })();

    setAvailableSlots([
      { id: 1, date: '2024-01-26', time: '09:00 AM', available: true },
      { id: 2, date: '2024-01-26', time: '11:00 AM', available: true },
      { id: 3, date: '2024-01-26', time: '02:00 PM', available: false },
      { id: 4, date: '2024-01-27', time: '10:00 AM', available: true },
      { id: 5, date: '2024-01-27', time: '03:00 PM', available: true },
    ]);
  }, []);

  const handleBookAppointment = (slot) => {
    setSelectedSlot(slot);
    setShowPaymentModal(true);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    try {
      const paymentPayload = {
        amount: 15.00,
        paymentMethod,
        description: `Service booking reservation for ${selectedSlot?.date} ${selectedSlot?.time}`,
        date: new Date().toISOString(),
        status: 'completed',
        transactionId: `TXN${Date.now()}`
      };

      const response = await apiRequest('/payments', { method: 'POST', body: paymentPayload });

      setPaymentData({
        paymentMethod,
        slot: selectedSlot,
        amount: 15.00,
        transactionId: paymentPayload.transactionId,
        id: response?.data?.id
      });

      // Mark slot as booked
      setAvailableSlots(prev => prev.map(s => s.id === selectedSlot.id ? { ...s, available: false } : s));

      show('Reservation fee confirmed. Slot synchronized with workshop ledger.', 'success');
      setShowPaymentModal(false);
    } catch (error) {
      show('Transaction processing failed. Please try again.', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    setSupportSubmitting(true);
    try {
      // Simulate network ticket dispatch delay
      await new Promise(r => setTimeout(r, 1200));

      const ticketId = `PRX-${Math.floor(100000 + Math.random() * 900000)}`;
      const ticket = {
        id: ticketId,
        issue: supportIssue,
        priority: supportPriority,
        notes: supportNotes || 'Immediate specialist review requested.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        assignedSpecialist: 'Eng. Marcus Vance (Senior Automotive Tech)',
        status: 'DISPATCHED'
      };

      setGeneratedTicket(ticket);
      show(`Support Proxy ticket #${ticketId} created. Priority dispatch en route.`, 'success');
    } catch (err) {
      show('Failed to connect to Support Proxy.', 'error');
    } finally {
      setSupportSubmitting(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Identity', icon: User },
    { id: 'history', name: 'Logistics', icon: History },
    { id: 'book', name: 'Reservations', icon: Calendar },
    { id: 'payments', name: 'Ledger', icon: CreditCard }
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
      await apiRequest('/appointments', {
        method: 'POST', body: {
          customerName: user?.name,
          customerEmail: user?.email,
          vehicle, serviceType, preferredDate, notes
        }
      });
      show('Service reservation protocol successfully initiated.', 'success');
      e.target.reset();
    } catch (err) {
      show('Failed to submit appointment request.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20 pt-32 px-6">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">
              Authorized Client Access
            </div>
            <h1 className="text-6xl font-black text-slate-800 dark:text-white tracking-tighter">
              Client <span className="gradient-text">Terminal</span>
            </h1>
            <p className="mt-2 text-slate-500 font-medium">Verified Signature: {user?.name || 'Customer'} // Access Tier: Premium</p>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="p-4 glass-panel flex items-center gap-6 rounded-2xl border border-white/20">
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Status</span>
                <span className="text-xs font-black text-emerald-500 flex items-center gap-1 justify-end">
                  <Zap className="h-3 w-3 animate-pulse" /> OPERATIONAL
                </span>
              </div>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="p-3 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                title="Disconnect Terminal"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            <div className="glass-panel p-2 rounded-3xl border border-white/10 overflow-hidden">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center p-4 text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                  >
                    <Icon className="h-4 w-4 mr-4" />
                    {tab.name}
                  </button>
                );
              })}
            </div>

            {/* Support Proxy Card - Fully Functional */}
            <div className="premium-card !p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white border border-indigo-500/20 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />
              <ShieldCheck className="absolute -bottom-4 -right-4 w-24 h-24 text-blue-500/10 group-hover:scale-110 transition-transform" />
              
              <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Technicians Standby</span>
              </div>

              <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-2 text-white">Support Proxy</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
                Need priority assistance? Our specialized technicians are on standby for elite consultation.
              </p>
              
              <button 
                onClick={() => {
                  setGeneratedTicket(null);
                  setShowSupportModal(true);
                }}
                className="w-full btn-primary !h-12 !text-[10px] !tracking-widest flex items-center justify-center gap-2 group-hover:shadow-blue-500/40"
              >
                <Headphones className="w-4 h-4" /> CONNECT NOW
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div key="ov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { l: 'Asset History', v: vehicleHistory.length, i: Activity, c: 'text-blue-500', b: 'bg-blue-500/10' },
                      { l: 'Pending Syncs', v: appointments.length, i: Calendar, c: 'text-amber-500', b: 'bg-amber-500/10' },
                      { l: 'Total Credits', v: `$${vehicleHistory.reduce((s, j) => s + (j.cost || 0), 0)}`, i: CreditCard, c: 'text-emerald-500', b: 'bg-emerald-500/10' }
                    ].map((s, i) => (
                      <div key={i} className="premium-card">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-2xl ${s.b} ${s.c}`}><s.i className="h-6 w-6" /></div>
                          <div className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">{s.v}</div>
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.l}</div>
                      </div>
                    ))}
                  </div>

                  <div className="premium-card !p-10">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-8">Active Operations</h3>
                    <div className="space-y-4">
                      {vehicleHistory.length > 0 ? vehicleHistory.slice(0, 3).map(j => (
                        <div key={j.id} className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-blue-500/20 transition-all">
                          <div className="flex items-center gap-6">
                            <div className="h-12 w-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm">
                              <Car className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{j.service}</h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{j.date} // {j.vehicle}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${j.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                              {j.status}
                            </span>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-20 text-slate-400">
                          <Activity className="h-12 w-12 mx-auto mb-4 opacity-10" />
                          <p className="text-xs font-black uppercase tracking-[0.2em]">No operational data available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div key="hist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="premium-card !p-10">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-8">Full Logistics Log</h3>
                  <div className="space-y-4">
                    {vehicleHistory.map(j => (
                      <div key={j.id} className="p-8 glass-panel rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-premium transition-all">
                        <div className="space-y-2">
                          <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Protocol ID: {j.id?.substring(0, 8).toUpperCase()}</div>
                          <h4 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{j.service}</h4>
                          <p className="text-sm font-bold text-slate-500">{j.vehicle} — Specialist: {j.mechanic}</p>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <div className="text-2xl font-black text-slate-800 dark:text-white">${j.cost}</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{j.date}</div>
                          </div>
                          <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] ${j.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'}`}>{j.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'book' && (
                <motion.div key="book" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="premium-card !p-10">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-8">Protocol Initiation</h3>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Car Identification</label>
                        <input name="vehicle" placeholder="Make, Model, Year (e.g. BMW M4 2022)" className="input-field !h-14 font-bold" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Vector</label>
                        <select name="serviceType" className="input-field !h-14 font-bold" onChange={(e) => setServiceTypeSelection(e.target.value)}>
                          <option>Oil Optimization</option>
                          <option>Brake Protocol</option>
                          <option>Engine Diagnostic</option>
                          <option>Annual Inspection</option>
                          <option value="other">Specialized Logic</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sync Date</label>
                        <input name="preferredDate" type="date" className="input-field !h-14 font-bold" required />
                      </div>
                      <button type="submit" className="btn-primary w-full !h-16 shadow-blue-500/20">INITIATE REQUEST</button>
                    </form>
                  </div>

                  <div className="space-y-6">
                    <div className="premium-card !p-10">
                      <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-8">Optimal Windows</h3>
                      <div className="space-y-3">
                        {availableSlots.map(slot => (
                          <button
                            key={slot.id}
                            disabled={!slot.available}
                            onClick={() => handleBookAppointment(slot)}
                            className={`w-full p-5 rounded-2xl flex items-center justify-between border transition-all ${slot.available
                                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500 shadow-sm'
                                : 'bg-slate-50 opacity-50 cursor-not-allowed'
                              }`}
                          >
                            <div className="text-left font-black tracking-tight">
                              <div className="text-xs text-slate-400 uppercase">{slot.date}</div>
                              <div className="text-lg text-slate-800 dark:text-white">{slot.time}</div>
                            </div>
                            {slot.available ? <Plus className="h-5 w-5 text-blue-600" /> : <Clock className="h-5 w-5 text-slate-300" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'payments' && (
                <motion.div key="pay" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  <div className="premium-card !p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600" />
                    <CreditCard className="h-16 w-16 mx-auto mb-8 text-blue-600" />
                    <h3 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-4">Financial Ledger</h3>
                    <p className="max-w-md mx-auto text-slate-500 font-medium mb-12">Monitor your transaction protocols and download verified service receipts.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Link to="/customer/invoices" className="p-8 glass-panel rounded-3xl group flex flex-col items-center gap-4 hover:border-blue-500/50 transition-all">
                        <Download className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
                        <span className="font-black uppercase tracking-widest text-xs">Verify Invoices</span>
                      </Link>
                      <button className="p-8 glass-panel rounded-3xl group flex flex-col items-center gap-4 cursor-default">
                        <History className="h-8 w-8 text-slate-400" />
                        <span className="font-black uppercase tracking-widest text-xs text-slate-400">Legacy Records (Locked)</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* SUPPORT PROXY MODAL */}
      <AnimatePresence>
        {showSupportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden"
            >
              <button
                onClick={() => setShowSupportModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {!generatedTicket ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl">
                      <Headphones className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight">Support Proxy Interface</h3>
                      <p className="text-xs text-slate-400 font-medium">Direct priority channel with workshop engineering staff</p>
                    </div>
                  </div>

                  {/* Hotline Direct Quick Call */}
                  <div className="p-4 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-2xl border border-blue-500/20 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <PhoneCall className="w-5 h-5 text-emerald-400 animate-pulse" />
                      <div>
                        <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Emergency Hotline</div>
                        <div className="text-sm font-bold">+1 (800) 555-PUEFIX</div>
                      </div>
                    </div>
                    <a
                      href="tel:+18005557833"
                      className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                    >
                      CALL NOW
                    </a>
                  </div>

                  <form onSubmit={handleSupportSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inquiry Vector</label>
                      <select
                        value={supportIssue}
                        onChange={(e) => setSupportIssue(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option>Emergency Roadside Assistance</option>
                        <option>Technical Diagnostic Consultation</option>
                        <option>Appointment Expedite Request</option>
                        <option>Billing & Invoice Protocol</option>
                        <option>General Support Inquiry</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority Tier</label>
                        <select
                          value={supportPriority}
                          onChange={(e) => setSupportPriority(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="Standard">Standard Priority</option>
                          <option value="High">High Priority</option>
                          <option value="Critical">Critical / Emergency</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Name</label>
                        <input
                          type="text"
                          disabled
                          value={user?.name || 'Verified Customer'}
                          className="w-full bg-slate-950/50 border border-slate-800/50 rounded-xl px-4 py-3 text-xs font-bold text-slate-400 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dispatch Notes / Remarks</label>
                      <textarea
                        rows={3}
                        value={supportNotes}
                        onChange={(e) => setSupportNotes(e.target.value)}
                        placeholder="Provide vehicle details or specific issues..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-medium text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={supportSubmitting}
                      className="w-full btn-primary !h-14 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 mt-4"
                    >
                      {supportSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          DISPATCH SUPPORT PROXY <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8" />
                  </div>

                  <div className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
                    PROXY DISPATCH SUCCESS
                  </div>

                  <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Ticket Encrypted & Sent</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
                    Specialist technician assigned. Standby for direct contact on your registered terminal line.
                  </p>

                  <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-left space-y-3 mb-6">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Ticket ID</span>
                      <span className="text-sm font-black text-blue-400">{generatedTicket.id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vector</span>
                      <span className="text-xs font-bold text-slate-200">{generatedTicket.issue}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Tech</span>
                      <span className="text-xs font-bold text-emerald-400">{generatedTicket.assignedSpecialist}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Response</span>
                      <span className="text-xs font-bold text-amber-400">&lt; 8 Minutes</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowSupportModal(false)}
                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                  >
                    CLOSE PROXY TERMINAL
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RESERVATION / PAYMENT MODAL */}
      <AnimatePresence>
        {showPaymentModal && selectedSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden"
            >
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Reservation Protocol</h3>
                  <p className="text-xs text-slate-400 font-medium">Synchronize slot for {selectedSlot.date} @ {selectedSlot.time}</p>
                </div>
              </div>

              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 mb-6 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400">Slot Reserved</span>
                  <span className="text-white">{selectedSlot.date} // {selectedSlot.time}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400">Reservation Guarantee Fee</span>
                  <span className="text-emerald-400 text-lg font-black">$15.00 USD</span>
                </div>
                <p className="text-[10px] text-slate-500 italic">Fee credited directly toward final invoice total upon service completion.</p>
              </div>

              <form onSubmit={handlePayment} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Payment Interface</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'card', label: 'Credit Card', icon: CreditCard },
                      { id: 'banking', label: 'Direct Bank', icon: Lock },
                      { id: 'cash', label: 'Pay at Desk', icon: User }
                    ].map(method => (
                      <button
                        type="button"
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                          paymentMethod === method.id
                            ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <method.icon className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full btn-primary !h-14 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      CONFIRM RESERVATION ($15.00) <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerDashboard;





