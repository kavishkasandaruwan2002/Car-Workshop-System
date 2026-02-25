import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { apiRequest } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench, Car, User, Settings, Clock, CheckCircle, TrendingUp,
  Search, Filter, LogOut, X, Mail, Lock, Star, ChevronRight, Activity
} from 'lucide-react';

import MechanicJobCard from '../components/mechanics/MechanicJobCard';

const MechanicView = () => {
  const { state, dispatch } = useApp();
  const { logout, user } = useAuth();
  const { show: showToast } = useToast();
  const navigate = useNavigate();

  const [selectedMechanic, setSelectedMechanic] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [newTaskDesc, setNewTaskDesc] = useState('');

  // Authentication for mechanic switching
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [pendingMechanic, setPendingMechanic] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [mResp, cResp, jResp] = await Promise.all([
        apiRequest('/mechanics'),
        apiRequest('/cars'),
        apiRequest('/jobs')
      ]);
      dispatch({ type: 'SET_MECHANICS', payload: mResp.data || [] });
      dispatch({ type: 'SET_CARS', payload: cResp.data || [] });
      dispatch({
        type: 'SET_JOB_SHEETS', payload: jResp.data?.map(j => ({
          ...j,
          carId: j.car?.id || j.car?._id || j.carId
        })) || []
      });
    } catch (e) {
      showToast('System sync failed', 'error');
    }
  }, [dispatch, showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (user?.role === 'mechanic') setSelectedMechanic(user.name);
    else if (state.mechanics.length > 0) setSelectedMechanic(state.mechanics[0].name);
  }, [state.mechanics, user]);

  const mechanic = state.mechanics.find(m => m.name === selectedMechanic);
  const myJobs = state.jobSheets.filter(j => j.assignedMechanic === selectedMechanic);
  const filteredJobs = myJobs.filter(j => {
    const car = state.cars.find(c => c.id === j.carId || c._id === j.carId);
    const matchesSearch = !searchTerm || car?.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateTask = async (jobId, idx, completed) => {
    try {
      const job = state.jobSheets.find(j => j.id === jobId);
      const nt = [...job.tasks];
      nt[idx].completed = completed;
      const status = nt.every(t => t.completed) ? 'completed' : 'in_progress';

      const resp = await apiRequest(`/jobs/${jobId}`, { method: 'PUT', body: { tasks: nt, status } });
      dispatch({ type: 'UPDATE_JOB_SHEET', payload: resp.data });
      if (selectedJob?.id === jobId) setSelectedJob(resp.data);
    } catch (e) { showToast('Sync failed', 'error'); }
  };

  const handleAddTask = async (jobId) => {
    if (!newTaskDesc.trim()) return;
    try {
      const job = state.jobSheets.find(j => j.id === jobId);
      const nt = [...job.tasks, { description: newTaskDesc, completed: false }];
      const resp = await apiRequest(`/jobs/${jobId}`, { method: 'PUT', body: { tasks: nt, status: 'in_progress' } });
      dispatch({ type: 'UPDATE_JOB_SHEET', payload: resp.data });
      setSelectedJob(resp.data);
      setNewTaskDesc('');
    } catch (e) { showToast('Add task failed', 'error'); }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Premium Sidebar */}
      <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden lg:flex flex-col">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 bg-workshop-blue rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">Nexus</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Hub</p>
            </div>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-black">
                {mechanic?.name?.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="text-sm font-black text-slate-800 dark:text-white truncate">{mechanic?.name}</h3>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Technician Level IV</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500 fill-amber-500" /> 4.98</div>
              <div className="text-workshop-blue">{myJobs.filter(j => j.status === 'completed').length} Repairs Completed</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">Workstation Control</p>
          {state.mechanics.map(m => (
            <button
              key={m.id}
              onClick={() => { setPendingMechanic(m); setLoginForm({ email: m.email, password: '' }); setShowLoginModal(true); }}
              className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${selectedMechanic === m.name
                  ? 'bg-workshop-blue text-white shadow-xl shadow-blue-500/20'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
            >
              <User className={`h-5 w-5 ${selectedMechanic === m.name ? 'text-white' : 'text-slate-400'}`} />
              <span className="text-xs font-black uppercase tracking-widest">{m.name}</span>
              {selectedMechanic === m.name && <Activity className="h-4 w-4 ml-auto animate-pulse" />}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center justify-center gap-3 p-4 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest"
          >
            <LogOut className="h-4 w-4" /> Deactivate Session
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="p-8 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-[10px] font-black text-workshop-blue uppercase tracking-[0.3em] mb-2">Technician Dashboard</p>
              <h1 className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">
                Active <span className="gradient-text">Operations</span>
              </h1>
            </div>
            <div className="flex gap-4">
              <div className="premium-card !p-4 flex items-center gap-4 !bg-emerald-500/10 border-emerald-500/20">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</p>
                  <p className="text-xl font-black text-emerald-600">92%</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          <div className="glass-panel p-6 rounded-[2.5rem] flex flex-wrap gap-4 items-center shadow-xl shadow-slate-200/20">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Synchronize vehicle license..."
                className="input-field !pl-14 !h-14 font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="input-field !h-14 !w-48 font-bold" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Global Matrix</option>
              <option value="in_progress">Active Duty</option>
              <option value="pending">Queued</option>
              <option value="completed">Operational Ready</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredJobs.map(j => (
                <MechanicJobCard
                  key={j.id}
                  job={j}
                  car={state.cars.find(c => c.id === j.carId || c._id === j.carId)}
                  onDetails={(job) => { setSelectedJob(job); setShowDetails(true); }}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Login Verification Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLoginModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-2xl overflow-hidden p-10">
              <div className="text-center mb-10">
                <div className="h-16 w-16 bg-blue-500 rounded-3xl flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/20 mb-6">
                  <Lock className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Security Verification</h2>
                <p className="text-sm font-medium text-slate-500 mt-2">Switching workstation to <strong>{pendingMechanic?.name}</strong></p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input className="input-field !pl-12 !h-14 font-bold" value={loginForm.email} disabled />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Protocol (Password)</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="password"
                      className="input-field !pl-12 !h-14 font-bold"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    />
                  </div>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const resp = await apiRequest('/auth/login', { method: 'POST', body: loginForm });
                      if (resp.success) {
                        setSelectedMechanic(pendingMechanic.name);
                        setShowLoginModal(false);
                        showToast(`Access granted: ${pendingMechanic.name}`, 'success');
                      }
                    } catch (e) { showToast('Access denied', 'error'); }
                  }}
                  className="w-full btn-primary !h-16 shadow-blue-500/20 font-black uppercase tracking-widest"
                >
                  Verify Identity
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task Execution Modal */}
      <AnimatePresence>
        {showDetails && selectedJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDetails(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-2xl bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Execution Details</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation Protocol Grid</p>
                </div>
                <button onClick={() => setShowDetails(false)} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl hover:bg-slate-100 transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8">
                <section className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Active Deployment Logic</span>
                    <span>{Math.round((selectedJob.tasks.filter(t => t.completed).length / selectedJob.tasks.length) * 100)}% Synchronized</span>
                  </div>
                  <div className="space-y-3">
                    {selectedJob.tasks.map((t, i) => (
                      <div key={i} className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${t.completed ? 'bg-emerald-500/5 border-emerald-500/20 shadow-inner' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'}`}>
                        <div className="flex items-center gap-4">
                          <button onClick={() => handleUpdateTask(selectedJob.id, i, !t.completed)} className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${t.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                            {t.completed && <CheckCircle className="h-4 w-4" />}
                          </button>
                          <span className={`${t.completed ? 'line-through text-emerald-800 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'} text-sm font-bold`}>{t.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Append Deployment Objective</p>
                  <div className="flex gap-3">
                    <input
                      className="input-field flex-1 !h-14 font-bold"
                      placeholder="e.g. Recalibrate transmission timing..."
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                    />
                    <button onClick={() => handleAddTask(selectedJob.id)} className="btn-primary !h-14 !px-8 shadow-blue-500/20 font-black uppercase text-[10px] tracking-widest underline">Sync</button>
                  </div>
                </section>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MechanicView;
