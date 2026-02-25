import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { apiRequest } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Wrench, Clock, CheckCircle, AlertCircle, Settings } from 'lucide-react';

import JobCard from '../components/jobs/JobCard';
import JobFormModal from '../components/jobs/JobFormModal';
import JobDetailsModal from '../components/jobs/JobDetailsModal';

const JobSheets = () => {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [mechanicFilter, setMechanicFilter] = useState('all');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsResp, carsResp, usersResp, mechResp, servResp] = await Promise.all([
        apiRequest('/jobs'),
        apiRequest('/cars?limit=1000'),
        apiRequest('/users?limit=1000'),
        apiRequest('/mechanics'),
        apiRequest('/services')
      ]);

      dispatch({ type: 'SET_JOB_SHEETS', payload: jobsResp.data || [] });
      dispatch({ type: 'SET_CARS', payload: carsResp.data || [] });
      dispatch({ type: 'SET_MECHANICS', payload: mechResp.data || [] });
      setCustomers((usersResp.data || []).filter(u => u.role === 'customer'));
      setServices(servResp.data || []);
    } catch (e) {
      show('Data synchronization failed', 'error');
    } finally {
      setLoading(false);
    }
  }, [dispatch, show]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Navigation Prefill
  useEffect(() => {
    const appt = location.state?.prefillFromAppointment;
    if (appt) {
      setEditingJob(null);
      setShowFormModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filteredJobs = state.jobSheets.filter(job => {
    const car = state.cars.find(c => c.id === job.carId || c._id === job.carId);
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || (
      car?.licensePlate?.toLowerCase().includes(term) ||
      car?.customerName?.toLowerCase().includes(term) ||
      job.assignedMechanic?.toLowerCase().includes(term)
    );
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesMechanic = mechanicFilter === 'all' || job.assignedMechanic === mechanicFilter;
    return matchesSearch && matchesStatus && matchesMechanic;
  });

  const handleSaveJob = async (formData) => {
    try {
      const method = editingJob ? 'PUT' : 'POST';
      const endpoint = editingJob ? `/jobs/${editingJob.id || editingJob._id}` : '/jobs';

      const payload = {
        ...formData,
        services: formData.selectedServices?.map(id => ({ serviceId: id }))
      };

      const resp = await apiRequest(endpoint, { method, body: payload });

      if (editingJob) {
        dispatch({ type: 'UPDATE_JOB_SHEET', payload: resp.data });
        show('Job sheet recalibrated', 'success');
      } else {
        dispatch({ type: 'ADD_JOB_SHEET', payload: resp.data });
        show('Job sheet initialized', 'success');
      }
      setShowFormModal(false);
    } catch (e) {
      show(e.message || 'Operation failed', 'error');
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Decommission this job sheet?')) return;
    try {
      await apiRequest(`/jobs/${id}`, { method: 'DELETE' });
      dispatch({ type: 'DELETE_JOB_SHEET', payload: id });
      show('Job sheet decommissioned', 'success');
    } catch (e) {
      show('Decommission failed', 'error');
    }
  };

  const handleUpdateTask = async (idx, completed) => {
    if (!selectedJob) return;
    try {
      const newTasks = [...selectedJob.tasks];
      newTasks[idx].completed = completed;

      const allDone = newTasks.every(t => t.completed);
      const newStatus = allDone ? 'completed' : 'in_progress';

      const resp = await apiRequest(`/jobs/${selectedJob.id || selectedJob._id}`, {
        method: 'PUT',
        body: { tasks: newTasks, status: newStatus }
      });

      dispatch({ type: 'UPDATE_JOB_SHEET', payload: resp.data });
      setSelectedJob(resp.data);
      show('Task state synced', 'success');
    } catch (e) {
      show('Task sync failed', 'error');
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-2">Operation Control</p>
          <h1 className="text-6xl font-black text-slate-800 dark:text-white tracking-tighter">
            Workshop <span className="gradient-text">Grid</span>
          </h1>
        </div>
        <button
          onClick={() => { setEditingJob(null); setShowFormModal(true); }}
          className="btn-primary !h-16 !px-10 group"
        >
          <Plus className="h-6 w-6 mr-2 group-hover:rotate-90 transition-transform" />
          Initiate Operation
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Repairs', value: state.jobSheets.filter(j => j.status !== 'completed').length, icon: Wrench, bg: 'bg-blue-500/10', color: 'text-blue-500' },
          { label: 'Pending Sync', value: state.jobSheets.filter(j => j.status === 'pending').length, icon: Clock, bg: 'bg-amber-500/10', color: 'text-amber-500' },
          { label: 'In Progress', value: state.jobSheets.filter(j => j.status === 'in_progress').length, icon: Settings, bg: 'bg-indigo-500/10', color: 'text-indigo-500' },
          { label: 'System Ready', value: state.jobSheets.filter(j => j.status === 'completed').length, icon: CheckCircle, bg: 'bg-emerald-500/10', color: 'text-emerald-500' }
        ].map((s, i) => (
          <div key={i} className="premium-card flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-4xl font-black text-slate-800 dark:text-white mt-1">{s.value}</p>
            </div>
            <div className={`p-4 rounded-2xl ${s.bg} ${s.color}`}>
              <s.icon className="h-7 w-7" />
            </div>
          </div>
        ))}
      </section>

      <div className="glass-panel p-6 rounded-[2.5rem] flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search license, owner or specialist..."
            className="input-field !pl-14 !h-14 font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="input-field !h-14 !w-48 font-bold" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select className="input-field !h-14 !w-48 font-bold" value={mechanicFilter} onChange={(e) => setMechanicFilter(e.target.value)}>
          <option value="all">All Specialists</option>
          {state.mechanics.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredJobs.map(job => (
            <JobCard
              key={job.id || job._id}
              job={job}
              car={state.cars.find(c => c.id === job.carId || c._id === job.carId)}
              onView={(j) => { setSelectedJob(j); setShowDetailsModal(true); }}
              onEdit={(j) => { setEditingJob(j); setShowFormModal(true); }}
              onDelete={handleDeleteJob}
              canEdit={user?.role === 'owner'}
              canDelete={user?.role === 'owner'}
            />
          ))}
        </AnimatePresence>
      </div>

      <JobFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleSaveJob}
        editingJob={editingJob}
        cars={state.cars}
        mechanics={state.mechanics}
        customers={customers}
        services={services}
      />

      <JobDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        job={selectedJob}
        car={state.cars.find(c => c.id === selectedJob?.carId || c._id === selectedJob?.carId)}
        inventory={state.inventory}
        canManage={user?.role !== 'customer'}
        navigate={navigate}
        onUpdateTask={handleUpdateTask}
        onAddPart={async (partId, qty) => {
          try {
            const resp = await apiRequest(`/jobs/${selectedJob.id || selectedJob._id}/parts`, {
              method: 'POST', body: { partId, quantity: Number(qty) }
            });
            dispatch({ type: 'UPDATE_JOB_SHEET', payload: resp.data });
            setSelectedJob(resp.data);
            show('Part provisioned', 'success');
          } catch (e) { show('Provisioning failed', 'error'); }
        }}
        onRemovePart={async (idx) => {
          try {
            const resp = await apiRequest(`/jobs/${selectedJob.id || selectedJob._id}/parts/${idx}`, { method: 'DELETE' });
            dispatch({ type: 'UPDATE_JOB_SHEET', payload: resp.data });
            setSelectedJob(resp.data);
            show('Part decoupled', 'info');
          } catch (e) { show('Decoupling failed', 'error'); }
        }}
      />
    </div>
  );
};

export default JobSheets;
