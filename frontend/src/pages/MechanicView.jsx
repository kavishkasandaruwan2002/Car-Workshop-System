import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { apiRequest } from '../api/client';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Wrench,
  Car,
  User,
  Menu,
  X,
  Calendar,
  Star,
  TrendingUp,
  Search,
  Eye,
  Edit,
  CheckSquare,
  Square,
  LogOut,
  Lock,
  Mail
} from 'lucide-react';

const MechanicView = () => {
  const { state, dispatch } = useApp();
  const { logout, user } = useAuth();
  const { show: showToast } = useToast();
  const navigate = useNavigate();
  const [selectedMechanic, setSelectedMechanic] = useState('');
  const [mechanicsLoading, setMechanicsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  
  // Login modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginFormData, setLoginFormData] = useState({
    email: '',
    password: ''
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [pendingMechanicName, setPendingMechanicName] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Handle mechanic selection - show login modal
  const handleMechanicSelection = (mechanicName) => {
    const mechanic = state.mechanics.find(m => m.name === mechanicName);
    if (mechanic && mechanic.email) {
      setPendingMechanicName(mechanicName);
      setLoginFormData({
        email: mechanic.email, // Pre-fill email
        password: ''
      });
      setShowLoginModal(true);
    } else {
      showToast('Mechanic email not found', 'error');
    }
  };

  // Verify mechanic login credentials
  const handleMechanicLogin = async () => {
    if (!loginFormData.email || !loginFormData.password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setLoginLoading(true);
    try {
      // Verify credentials by attempting to login as the mechanic
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: {
          email: loginFormData.email,
          password: loginFormData.password
        }
      });

      if (response.success) {
        // Check if the logged-in user is a mechanic
        if (response.user.role === 'mechanic') {
          setSelectedMechanic(pendingMechanicName);
          setShowLoginModal(false);
          setLoginFormData({ email: '', password: '' });
          setPendingMechanicName('');
          showToast(`Successfully switched to ${pendingMechanicName}`, 'success');
        } else {
          showToast('Invalid mechanic credentials', 'error');
        }
      } else {
        showToast('Invalid email or password', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('Invalid email or password', 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  // Close login modal
  const closeLoginModal = () => {
    setShowLoginModal(false);
    setLoginFormData({ email: '', password: '' });
    setPendingMechanicName('');
  };

  // Fetch mechanics and jobs on first load if empty (handles hard refresh)
  useEffect(() => {
    (async () => {
      if (!state.mechanics || state.mechanics.length === 0) {
        try {
          setMechanicsLoading(true);
          const resp = await apiRequest('/mechanics');
          const list = Array.isArray(resp?.data) ? resp.data : [];
          const normalized = list.map(m => ({ ...m, id: m.id || m._id }));
          dispatch({ type: 'SET_MECHANICS', payload: normalized });
        } catch (e) {
          // ignore; UI will show empty state
        } finally {
          setMechanicsLoading(false);
        }
      }
      
      // Load cars if not already loaded
      if (!state.cars || state.cars.length === 0) {
        try {
          const carsResp = await apiRequest('/cars');
          const cars = Array.isArray(carsResp?.data) ? carsResp.data : [];
          const normalizedCars = cars.map(c => ({
            ...c,
            createdAt: c.createdAt || new Date().toISOString(),
            updatedAt: c.updatedAt || c.createdAt || new Date().toISOString()
          }));
          dispatch({ type: 'SET_CARS', payload: normalizedCars });
        } catch (e) {
          // ignore; UI will show empty state
        }
      }
      
      // Load jobs if not already loaded
      if (!state.jobSheets || state.jobSheets.length === 0) {
        try {
          const jobsResp = await apiRequest('/jobs');
          const jobs = Array.isArray(jobsResp?.data) ? jobsResp.data : [];
          const normalizedJobs = jobs.map(j => ({
            id: j.id,
            carId: (j.car && (j.car.id || j.car._id)) ? (j.car.id || j.car._id) : (j.carId || j.car),
            assignedMechanic: j.assignedMechanic,
            tasks: Array.isArray(j.tasks) ? j.tasks : [],
            status: j.status,
            createdAt: j.createdAt,
            estimatedCompletion: j.estimatedCompletion || '',
            appointmentCustomerName: j.appointment?.customerName,
            appointmentVehicle: j.appointment?.vehicle,
            appointmentServiceType: j.appointment?.serviceType,
            appointmentDate: j.appointment?.preferredDate
          }));
          dispatch({ type: 'SET_JOB_SHEETS', payload: normalizedJobs });
        } catch (e) {
          // ignore; UI will show empty state
        }
      }
    })();
  }, [dispatch, state.mechanics, state.jobSheets, state.cars]);

  // Determine selected mechanic: URL param > logged-in mechanic > first in list
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mechanicName = urlParams.get('mechanic');
    if (mechanicName) {
      setSelectedMechanic(mechanicName);
      return;
    }
    if (user?.role === 'mechanic' && user?.name) {
      setSelectedMechanic(user.name);
      return;
    }
    if (state.mechanics.length > 0) {
      setSelectedMechanic(state.mechanics[0].name);
    }
  }, [state.mechanics, user]);

  const fallbackMechanic = user?.role === 'mechanic'
    ? { id: user.id || 'self', name: user.name || 'Me', experience: '', availability: 'available', skills: [] }
    : undefined;
  const mechanic = state.mechanics.find(m => m.name === selectedMechanic) ||
    (fallbackMechanic && fallbackMechanic.name === selectedMechanic ? fallbackMechanic : undefined);

  const mechanicsOptions = state.mechanics.length > 0
    ? state.mechanics
    : (user?.role === 'mechanic' ? [fallbackMechanic] : []);
  
  // Filter and sort jobs
  const filteredJobs = state.jobSheets
    .filter(job => {
      const matchesMechanic = job.assignedMechanic === selectedMechanic;
      // Debug log to help troubleshoot
      if (!matchesMechanic && job.assignedMechanic) {
        console.log(`Job ${job.id}: assignedMechanic="${job.assignedMechanic}", selectedMechanic="${selectedMechanic}"`);
      }
      return matchesMechanic;
    })
    .filter(job => {
      // Use the same improved car matching logic
      let car = state.cars.find(c => c.id === job.carId);
      if (!car) {
        car = state.cars.find(c => c._id === job.carId);
      }
      if (!car) {
        car = state.cars.find(c => String(c.id) === String(job.carId));
      }
      if (!car) {
        car = state.cars.find(c => String(c._id) === String(job.carId));
      }
      
      const matchesSearch = !searchTerm || 
        (car && (
          car.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.model.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'progress':
          return getJobProgress(b) - getJobProgress(a);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const persistTasks = async (jobId, updatedTasks, updatedStatus) => {
    try {
      await apiRequest(`/jobs/${jobId}`, { method: 'PUT', body: { tasks: updatedTasks, status: updatedStatus } });
    } catch (e) {
      console.error('Failed to persist tasks', e);
    }
  };

  const updateTaskStatus = (jobId, taskIndex, completed) => {
    const job = state.jobSheets.find(j => j.id === jobId);
    if (!job) return;
    const updatedTasks = [...job.tasks];
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], completed };
    const allCompleted = updatedTasks.every(task => task.completed);
    const newStatus = allCompleted ? 'completed' : 'in_progress';
    dispatch({ type: 'UPDATE_JOB_SHEET', payload: { id: jobId, tasks: updatedTasks, status: newStatus } });
    persistTasks(jobId, updatedTasks, newStatus);
  };

  const addTask = (jobId) => {
    const description = newTaskDescription.trim();
    if (!description) return;
    const job = state.jobSheets.find(j => j.id === jobId);
    if (!job) return;
    const updatedTasks = [...job.tasks, { description, completed: false }];
    const newStatus = 'in_progress';
    dispatch({ type: 'UPDATE_JOB_SHEET', payload: { id: jobId, tasks: updatedTasks, status: newStatus } });
    setNewTaskDescription('');
    persistTasks(jobId, updatedTasks, newStatus);
  };

  const updateTaskDescription = (jobId, taskIndex, description) => {
    const job = state.jobSheets.find(j => j.id === jobId);
    if (!job) return;
    const updatedTasks = [...job.tasks];
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], description };
    const allCompleted = updatedTasks.every(task => task.completed);
    const newStatus = allCompleted ? 'completed' : 'in_progress';
    dispatch({ type: 'UPDATE_JOB_SHEET', payload: { id: jobId, tasks: updatedTasks, status: newStatus } });
    // Persist but do not block typing
    persistTasks(jobId, updatedTasks, newStatus);
  };

  const deleteTask = (jobId, taskIndex) => {
    const job = state.jobSheets.find(j => j.id === jobId);
    if (!job) return;
    const updatedTasks = job.tasks.filter((_, idx) => idx !== taskIndex);
    const allCompleted = updatedTasks.every(task => task.completed);
    const newStatus = updatedTasks.length === 0 ? 'pending' : (allCompleted ? 'completed' : 'in_progress');
    dispatch({ type: 'UPDATE_JOB_SHEET', payload: { id: jobId, tasks: updatedTasks, status: newStatus } });
    persistTasks(jobId, updatedTasks, newStatus);
  };

  const getJobProgress = (job) => {
    const completedTasks = job.tasks.filter(task => task.completed).length;
    const totalTasks = job.tasks.length;
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Loading or empty state handling
  if (mechanicsLoading || (!mechanic && state.mechanics.length === 0 && user?.role !== 'mechanic')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading mechanics…</h2>
          <p className="text-gray-600">Please wait while we load your data.</p>
        </div>
      </div>
    );
  }

  if (!mechanic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Mechanic Selected</h2>
          <p className="text-gray-600">Please select a mechanic from the sidebar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Mechanic Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-0 z-50 lg:relative lg:inset-0 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="lg:hidden fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        
        <div className="relative flex flex-col w-72 h-full bg-gray-50 border-r border-gray-200">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Mechanic Dashboard</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mechanic Profile */}
          <div className="card border-b border-gray-200">
            <div className="flex items-center mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">{mechanic.name}</h3>
                <p className="text-xs text-gray-600">{mechanic.experience} experience</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mechanic.availability)}`}>
                <div className="w-2 h-2 bg-current rounded-full mr-1"></div>
                {mechanic.availability}
              </span>
              <div className="flex items-center text-yellow-500">
                <Star className="h-3 w-3 mr-1" />
                <span className="text-xs font-medium">4.8</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Today's Performance</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="card p-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Wrench className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Jobs</p>
                    <p className="text-xl font-bold text-gray-900">{filteredJobs.length}</p>
                  </div>
                </div>
              </div>
              <div className="card p-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Completed</p>
                    <p className="text-xl font-bold text-gray-900">{filteredJobs.filter(j => j.status === 'completed').length}</p>
                  </div>
                </div>
              </div>
              <div className="card p-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">In Progress</p>
                    <p className="text-xl font-bold text-gray-900">{filteredJobs.filter(j => j.status === 'in_progress').length}</p>
                  </div>
                </div>
              </div>
              <div className="card p-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Efficiency</p>
                    <p className="text-xl font-bold text-gray-900">
                      {filteredJobs.length > 0 ? Math.round((filteredJobs.filter(j => j.status === 'completed').length / filteredJobs.length) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mechanic Selection */}
          <div className="card border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Switch Mechanic
            </label>
            <div className="space-y-2">
              {mechanicsOptions.map(mech => (
                <button
                  key={mech.id}
                  onClick={() => handleMechanicSelection(mech.name)}
                  className={`w-full px-4 py-3 text-left border rounded-lg transition-colors ${
                    selectedMechanic === mech.name
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{mech.name}</span>
                    {selectedMechanic === mech.name && (
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {mechanic.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="p-4 lg:p-6">
          {/* Header with Stats */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
                <p className="text-gray-600 mt-1">Track and update your assigned repair tasks</p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                <div className="text-sm text-gray-500">
                  {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
                </div>
                <button
                  onClick={async () => {
                    try {
                      // Refresh jobs and cars data
                      const [jobsResp, carsResp] = await Promise.all([
                        apiRequest('/jobs'),
                        apiRequest('/cars')
                      ]);
                      
                      const jobs = Array.isArray(jobsResp?.data) ? jobsResp.data : [];
                      const cars = Array.isArray(carsResp?.data) ? carsResp.data : [];
                      
                      const normalizedJobs = jobs.map(j => ({
                        id: j.id,
                        carId: (j.car && (j.car.id || j.car._id)) ? (j.car.id || j.car._id) : (j.carId || j.car),
                        assignedMechanic: j.assignedMechanic,
                        tasks: Array.isArray(j.tasks) ? j.tasks : [],
                        status: j.status,
                        createdAt: j.createdAt,
                        estimatedCompletion: j.estimatedCompletion || '',
                        appointmentCustomerName: j.appointment?.customerName,
                        appointmentVehicle: j.appointment?.vehicle,
                        appointmentServiceType: j.appointment?.serviceType,
                        appointmentDate: j.appointment?.preferredDate
                      }));
                      
                      const normalizedCars = cars.map(c => ({
                        ...c,
                        createdAt: c.createdAt || new Date().toISOString(),
                        updatedAt: c.updatedAt || c.createdAt || new Date().toISOString()
                      }));
                      
                      dispatch({ type: 'SET_JOB_SHEETS', payload: normalizedJobs });
                      dispatch({ type: 'SET_CARS', payload: normalizedCars });
                    } catch (e) {
                      console.error('Failed to refresh data:', e);
                    }
                  }}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                <div className="flex items-center">
                  <Wrench className="h-8 w-8 mr-3" />
                  <div>
                    <p className="text-blue-100 text-sm">Total Jobs</p>
                    <p className="text-2xl font-bold">{filteredJobs.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 mr-3" />
                  <div>
                    <p className="text-green-100 text-sm">Completed</p>
                    <p className="text-2xl font-bold">{filteredJobs.filter(j => j.status === 'completed').length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 mr-3" />
                  <div>
                    <p className="text-yellow-100 text-sm">In Progress</p>
                    <p className="text-2xl font-bold">{filteredJobs.filter(j => j.status === 'in_progress').length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 mr-3" />
                  <div>
                    <p className="text-purple-100 text-sm">Efficiency</p>
                    <p className="text-2xl font-bold">
                      {filteredJobs.length > 0 ? Math.round((filteredJobs.filter(j => j.status === 'completed').length / filteredJobs.length) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="card mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by car make, model, or license plate..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="created">Sort by Created Date</option>
                  <option value="progress">Sort by Progress</option>
                  <option value="status">Sort by Status</option>
                </select>
              </div>
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredJobs.map((job) => {
              // Try multiple ways to match the car
              let car = state.cars.find(c => c.id === job.carId);
              if (!car) {
                car = state.cars.find(c => c._id === job.carId);
              }
              if (!car) {
                car = state.cars.find(c => String(c.id) === String(job.carId));
              }
              if (!car) {
                car = state.cars.find(c => String(c._id) === String(job.carId));
              }
              
              // If still no car found and we have appointment vehicle info, try to match by vehicle description
              if (!car && job.appointmentVehicle) {
                const vehicleText = job.appointmentVehicle.toLowerCase();
                car = state.cars.find(c => {
                  const carDesc = `${c.make} ${c.model}`.toLowerCase();
                  return vehicleText.includes(carDesc) || carDesc.includes(vehicleText);
                });
              }
              
              // Debug logging to help troubleshoot car matching
              if (!car && job.carId) {
                console.log(`Job ${job.id}: carId="${job.carId}" (type: ${typeof job.carId})`);
                console.log('Available cars:', state.cars.map(c => ({ 
                  id: c.id, 
                  _id: c._id, 
                  make: c.make, 
                  model: c.model,
                  idType: typeof c.id,
                  _idType: typeof c._id
                })));
                console.log('Job details:', job);
              }
              const progress = getJobProgress(job);
              const completedTasks = job.tasks.filter(task => task.completed).length;
              const totalTasks = job.tasks.length;
              
              return (
                <div key={job.id} className="card overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
                  {/* Job Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                          <Car className="h-6 w-6 text-blue-600" />
                        </div>
                      <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                          {car ? `${car.make} ${car.model}` : (job.appointmentVehicle || 'Unknown Car')}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {car ? car.licensePlate : (job.appointmentCustomerName ? `Customer: ${job.appointmentCustomerName}` : 'No License Plate')}
                        </p>
                      </div>
                    </div>
                      <div className="flex items-center space-x-2">
                      {getStatusIcon(job.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {job.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Job Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    {/* Progress Section */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span className="font-medium">Progress</span>
                        <span className="font-semibold">{Math.round(progress)}%</span>
                    </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{completedTasks} completed</span>
                        <span>{totalTasks - completedTasks} remaining</span>
                      </div>
                  </div>

                    {/* Tasks Preview */}
                    <div className="mb-4 flex-1">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Tasks</h4>
                      <div className="space-y-2">
                        {job.tasks.slice(0, 3).map((task, index) => (
                      <div key={index} className="flex items-center text-sm">
                            <button
                              onClick={() => updateTaskStatus(job.id, index, !task.completed)}
                              className="mr-3 p-1 hover:bg-gray-100 rounded"
                            >
                              {task.completed ? (
                                <CheckSquare className="h-4 w-4 text-green-600" />
                              ) : (
                                <Square className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                            <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                          {task.description}
                        </span>
                      </div>
                    ))}
                        {job.tasks.length > 3 && (
                          <p className="text-xs text-gray-500 ml-7">
                            +{job.tasks.length - 3} more tasks
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Job Info */}
                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                      {job.estimatedCompletion && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Due: {new Date(job.estimatedCompletion).toLocaleDateString()}</span>
                        </div>
                    )}
                  </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-auto">
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setShowJobDetails(true);
                      }}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                        <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </button>
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setShowJobDetails(true);
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wrench className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'You don\'t have any jobs assigned at the moment.'}
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Job Details Modal */}
      {showJobDetails && selectedJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowJobDetails(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Job Details
                  </h3>
                  <button
                    onClick={() => setShowJobDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedJob.status)}`}>
                        {selectedJob.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Progress:</span>
                      <span className="ml-2 text-gray-900">{Math.round(getJobProgress(selectedJob))}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Tasks</h4>
                    <div className="space-y-2">
                      {selectedJob.tasks.map((task, index) => (
                        <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={(e) => updateTaskStatus(selectedJob.id, index, e.target.checked)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <input
                            type="text"
                            value={task.description}
                            onChange={(e) => updateTaskDescription(selectedJob.id, index, e.target.value)}
                            className={`flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}
                          />
                          <button
                            onClick={() => deleteTask(selectedJob.id, index)}
                            className="text-red-600 hover:text-red-700 text-sm px-2 py-1"
                            title="Delete task"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <input
                        type="text"
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        placeholder="Add new task description"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => addTask(selectedJob.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Task
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mechanic Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeLoginModal} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Mechanic Login
                  </h3>
                  <button
                    onClick={closeLoginModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Please verify your credentials to switch to <strong>{pendingMechanicName}</strong>
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={loginFormData.email}
                        onChange={(e) => setLoginFormData({ ...loginFormData, email: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter email address"
                        disabled={loginLoading}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={loginFormData.password}
                        onChange={(e) => setLoginFormData({ ...loginFormData, password: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter password"
                        disabled={loginLoading}
                        onKeyPress={(e) => e.key === 'Enter' && handleMechanicLogin()}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleMechanicLogin}
                  disabled={loginLoading}
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loginLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    'Verify & Switch'
                  )}
                </button>
                <button
                  onClick={closeLoginModal}
                  disabled={loginLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MechanicView;
