import React, { useEffect, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { useToast } from '../components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Car as CarIcon, X, Calendar, User, Phone, Shield } from 'lucide-react';

import CarCard from '../components/cars/CarCard';

const CarProfile = () => {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const { show } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    licensePlate: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    make: '',
    model: '',
    year: '',
    color: '',
    vin: ''
  });

  const fetchData = useCallback(async () => {
    try {
      const resp = await apiRequest('/cars');
      dispatch({ type: 'SET_CARS', payload: resp.data || [] });

      const jobsResp = await apiRequest('/jobs');
      dispatch({ type: 'SET_JOB_SHEETS', payload: jobsResp.data || [] });
    } catch (e) {
      show('Failed to sync vehicle database', 'error');
    }
  }, [dispatch, show]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, year: Number(formData.year) };
      const endpoint = editingCar ? `/cars/${editingCar.id}` : '/cars';
      const method = editingCar ? 'PUT' : 'POST';

      const resp = await apiRequest(endpoint, { method, body: payload });

      if (editingCar) {
        dispatch({ type: 'UPDATE_CAR', payload: resp.data });
        show('Vehicle record recalibrated', 'success');
      } else {
        dispatch({ type: 'ADD_CAR', payload: resp.data });
        show('New vehicle registered', 'success');
      }
      setShowModal(false);
      setEditingCar(null);
    } catch (e) {
      show(e.message || 'Operation failed', 'error');
    }
  };

  const filteredCars = state.cars.filter(car =>
    car.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.customerPhone?.includes(searchTerm)
  );

  const canDelete = user?.role === 'owner' || user?.role === 'receptionist';

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-black text-workshop-blue uppercase tracking-[0.3em] mb-2">Asset Directory</p>
          <h1 className="text-6xl font-black text-slate-800 dark:text-white tracking-tighter">
            Vehicle <span className="gradient-text">Matrix</span>
          </h1>
        </div>
        <button
          onClick={() => { setEditingCar(null); setFormData({ licensePlate: '', customerName: '', customerPhone: '', customerEmail: '', make: '', model: '', year: '', color: '', vin: '' }); setShowModal(true); }}
          className="btn-primary !h-16 !px-10 group"
        >
          <Plus className="h-6 w-6 mr-2 group-hover:rotate-90 transition-transform" />
          Register Asset
        </button>
      </header>

      <div className="glass-panel p-6 rounded-[2.5rem] flex flex-wrap gap-4 items-center shadow-2xl shadow-slate-200/50">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by license, owner, or contact..."
            className="input-field !pl-14 !h-14 font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="h-14 px-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-3">
          <Filter className="h-5 w-5 text-slate-400" />
          <span className="text-sm font-black text-slate-600 uppercase tracking-widest">{filteredCars.length} Assets Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredCars.map(car => {
            const history = state.jobSheets.filter(j => j.carId === car.id && j.status === 'completed');
            const lastSync = history.length > 0 ? history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].createdAt : null;
            return (
              <CarCard
                key={car.id}
                car={car}
                repairCount={history.length}
                lastService={lastSync}
                canDelete={canDelete}
                onEdit={(c) => { setEditingCar(c); setFormData(c); setShowModal(true); }}
                onDelete={async (id) => {
                  if (window.confirm('Erase this vehicle record?')) {
                    try {
                      await apiRequest(`/cars/${id}`, { method: 'DELETE' });
                      dispatch({ type: 'DELETE_CAR', payload: id });
                      show('Asset record erased', 'success');
                    } catch (e) { show('Erasure failed', 'error'); }
                  }
                }}
                onViewHistory={(c) => { /* history modal logic could go here */ }}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Modal - Simplified for brevity but keeping premium look */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-2xl bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-10">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">
                      {editingCar ? 'Refine Asset' : 'New Registration'}
                    </h2>
                    <p className="text-slate-500 font-medium text-xs uppercase tracking-widest mt-1">Vehicle Specification Protocol</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl hover:bg-slate-100 transition-colors">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">License Plate</label>
                      <input name="licensePlate" value={formData.licensePlate} onChange={handleInputChange} required className="input-field !h-14 font-bold" placeholder="ABC-1234" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">VIN Code</label>
                      <input name="vin" value={formData.vin} onChange={handleInputChange} className="input-field !h-14 font-bold" placeholder="17 Digit VIN" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Owner Name</label>
                      <input name="customerName" value={formData.customerName} onChange={handleInputChange} required className="input-field !h-14 font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                      <input name="customerPhone" value={formData.customerPhone} onChange={handleInputChange} required className="input-field !h-14 font-bold" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2 col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Make</label>
                      <input name="make" value={formData.make} onChange={handleInputChange} required className="input-field !h-14 font-bold" />
                    </div>
                    <div className="space-y-2 col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Model</label>
                      <input name="model" value={formData.model} onChange={handleInputChange} required className="input-field !h-14 font-bold" />
                    </div>
                    <div className="space-y-2 col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Year</label>
                      <input type="number" name="year" value={formData.year} onChange={handleInputChange} required className="input-field !h-14 font-bold text-center" />
                    </div>
                  </div>

                  <div className="pt-8 flex gap-4">
                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 !h-16 font-black uppercase tracking-widest !rounded-2xl">Cancel</button>
                    <button type="submit" className="btn-primary flex-[2] !h-16 font-black uppercase tracking-widest !rounded-2xl shadow-xl shadow-blue-500/25">
                      {editingCar ? 'Update Matrix' : 'Initialize Registration'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CarProfile;
