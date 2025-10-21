import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { apiRequest } from '../api/client';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Wrench,
  User,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  X
} from 'lucide-react';

const JobSheets = () => {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const { show } = useToast();
  const location = useLocation();
  const canManage = user?.role === 'owner';
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [mechanicFilter, setMechanicFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [formData, setFormData] = useState({
    carId: '',
    assignedMechanic: '',
    tasks: [{ description: '', completed: false }],
    estimatedCompletion: ''
  });
  const [selectedOwner, setSelectedOwner] = useState('');
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [customers, setCustomers] = useState([]);
  const [appointmentContext, setAppointmentContext] = useState(null);
  
  const loadCars = async () => {
    try {
      const carsResp = await apiRequest('/cars?limit=1000');
      const cars = Array.isArray(carsResp?.data) ? carsResp.data : [];
      const normalizedCars = cars.map(c => ({
        ...c,
        createdAt: c.createdAt || new Date().toISOString(),
        updatedAt: c.updatedAt || c.createdAt || new Date().toISOString()
      }));
      dispatch({ type: 'SET_CARS', payload: normalizedCars });
    } catch (e) {}
  };

  useEffect(() => {
    (async () => {
      try {
       
        if (!state.cars || state.cars.length === 0) {
          await loadCars();
        }

        const resp = await apiRequest('/jobs');
        const list = Array.isArray(resp?.data) ? resp.data : [];
        // Map API shape to frontend expected shape
        const normalized = list.map(j => ({
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
        dispatch({ type: 'SET_JOB_SHEETS', payload: normalized });
      } catch (e) {}
    })();
  }, [dispatch, state.cars?.length]);

  // When the modal opens, always refresh cars to get newly created cars
  useEffect(() => {
    if (showModal) {
      loadCars();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  // When owner selection changes, refresh cars once to ensure data is current
  useEffect(() => {
    if (showModal) {
      loadCars();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOwnerId]);

  // Load customers for Select Owner
  useEffect(() => {
    (async () => {
      try {
        const resp = await apiRequest('/users?limit=1000');
        const list = Array.isArray(resp?.data) ? resp.data : [];
        const onlyCustomers = list.filter(u => u.role === 'customer');
        setCustomers(onlyCustomers);
      } catch (e) {}
    })();
  }, []);

  // If navigated from Dashboard with appointment, prefill and open modal
  useEffect(() => {
    const appt = location.state?.prefillFromAppointment;
    if (appt) {
      setAppointmentContext(appt);
      setSelectedOwner(appt.customerName || '');
      setFormData(prev => ({
        ...prev,
        tasks: [
          { description: `Service: ${appt.serviceType}`, completed: false },
          { description: `Vehicle: ${appt.vehicle}`, completed: false },
        ]
      }));
      setShowModal(true);
      // Clear navigation state so reopening page doesn't re-trigger
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // If we have an appointment context, try to auto-select a matching car using license plate or make/model
  useEffect(() => {
    if (!appointmentContext || !state.cars || state.cars.length === 0) return;
    const vehicleText = String(appointmentContext.vehicle || '').toLowerCase();
    // Prefer exact license plate match if present in vehicle text
    const plateMatch = state.cars.find(car => car.licensePlate && vehicleText.includes(String(car.licensePlate).toLowerCase()));
    if (plateMatch) {
      setFormData(prev => ({ ...prev, carId: plateMatch.id }));
      return;
    }
    // Fallback to make+model heuristic
    const mmMatch = state.cars.find(car => {
      const mm = `${car.make} ${car.model}`.toLowerCase();
      return mm && vehicleText.includes(mm);
    });
    if (mmMatch) {
      setFormData(prev => ({ ...prev, carId: mmMatch.id }));
    }
  }, [appointmentContext, state.cars]);

  // Attempt to auto-select car from appointment context once we know owner and cars
  useEffect(() => {
    if (!appointmentContext || !state.cars || state.cars.length === 0) return;
    // Determine candidate cars by owner if selected
    const owner = customers.find(c => (c.id || c._id) === selectedOwnerId);
    const candidateCars = state.cars.filter(car => {
      if (!owner) return true;
      if (car.customerEmail && owner.email) return car.customerEmail === owner.email;
      return car.customerName === owner.name;
    });
    const vehicleText = String(appointmentContext.vehicle || '').toLowerCase();
    // Match by make+model contained in vehicle text
    const match = candidateCars.find(car => {
      const mm = `${car.make} ${car.model}`.toLowerCase();
      return mm && vehicleText.includes(mm);
    });
    if (match && !formData.carId) {
      setFormData(prev => ({ ...prev, carId: match.id }));
    }
  }, [appointmentContext, state.cars, customers, selectedOwnerId]);

  // When customers are loaded and we have an appointmentContext, try to preselect matching owner
  useEffect(() => {
    if (appointmentContext && customers.length > 0) {
      const match = customers.find(c => (
        (appointmentContext.customerEmail && c.email === appointmentContext.customerEmail) ||
        (c.name === appointmentContext.customerName)
      ));
      if (match) {
        setSelectedOwner(match.name);
        setSelectedOwnerId(match.id || match._id || '');
      }
    }
  }, [appointmentContext, customers]);

  // When editing or when car selection changes, preselect owner based on the car's customer
  useEffect(() => {
    if (!formData.carId) return;
    const car = state.cars.find(c => c.id === formData.carId);
    if (!car) return;
    // Find matching customer by email if available, otherwise by name
    const match = customers.find(c => (
      (car.customerEmail && c.email && car.customerEmail === c.email) ||
      (c.name === car.customerName)
    ));
    if (match) {
      const ownerId = match.id || match._id || '';
      if (ownerId !== selectedOwnerId) {
        setSelectedOwnerId(ownerId);
        setSelectedOwner(match.name);
      }
    }
  }, [formData.carId, customers, state.cars, selectedOwnerId]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiRequest('/mechanics');
        const list = Array.isArray(resp?.data) ? resp.data : [];
        // Normalize id so we always use mechanic.id and keep name stable
        const normalized = list.map(m => ({ ...m, id: m.id || m._id }));
        dispatch({ type: 'SET_MECHANICS', payload: normalized });
      } catch (e) {}
    })();
  }, [dispatch]);

  const filteredJobs = state.jobSheets.filter(job => {
    const car = state.cars.find(c => c.id === job.carId);
    const term = (searchTerm || '').trim().toLowerCase();
    const matchesSearch = !term || (
      (car && (
        (car.licensePlate || '').toLowerCase().includes(term) ||
        (car.customerName || '').toLowerCase().includes(term) ||
        (`${car.make} ${car.model}` || '').toLowerCase().includes(term)
      )) ||
      (job.appointmentCustomerName && job.appointmentCustomerName.toLowerCase().includes(term)) ||
      (job.appointmentVehicle && job.appointmentVehicle.toLowerCase().includes(term))
    );
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesMechanic = mechanicFilter === 'all' || job.assignedMechanic === mechanicFilter;
    return matchesSearch && matchesStatus && matchesMechanic;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTaskChange = (index, field, value) => {
    const newTasks = [...formData.tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      tasks: newTasks
    }));
  };

  const addTask = () => {
    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, { description: '', completed: false }]
    }));
  };

  const removeTask = (index) => {
    const newTasks = formData.tasks.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      tasks: newTasks
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        tasks: formData.tasks,
        status: editingJob?.status || 'pending',
        appointment: appointmentContext?.id
      };
      if (formData.estimatedCompletion) payload.estimatedCompletion = formData.estimatedCompletion;
      if (formData.carId) payload.car = String(formData.carId);
      if (formData.assignedMechanic) payload.assignedMechanic = formData.assignedMechanic;
  if (formData.customerPhone) payload.customerPhone = formData.customerPhone;
      if (editingJob) {
        const resp = await apiRequest(`/jobs/${editingJob.id}`, { method: 'PUT', body: payload });
        const j = resp.data;
        const mapped = {
          id: j.id,
          carId: (j.car && (j.car.id || j.car._id)) ? (j.car.id || j.car._id) : j.car,
          assignedMechanic: j.assignedMechanic,
          tasks: j.tasks,
          status: j.status,
          createdAt: j.createdAt,
          customerPhone: j.customerPhone || '',
          estimatedCompletion: j.estimatedCompletion || '',
          appointmentCustomerName: j.appointment?.customerName,
          appointmentVehicle: j.appointment?.vehicle,
          appointmentServiceType: j.appointment?.serviceType,
          appointmentDate: j.appointment?.preferredDate
        };
        dispatch({ type: 'UPDATE_JOB_SHEET', payload: mapped });
        show('Job sheet updated successfully!', 'success');
      } else {
        const resp = await apiRequest('/jobs', { method: 'POST', body: payload });
        const j = resp.data;
        const mapped = {
          id: j.id,
          carId: (j.car && (j.car.id || j.car._id)) ? (j.car.id || j.car._id) : j.car,
          assignedMechanic: j.assignedMechanic,
          tasks: j.tasks,
          status: j.status,
          createdAt: j.createdAt,
          customerPhone: j.customerPhone || '',
          estimatedCompletion: j.estimatedCompletion || '',
          appointmentCustomerName: j.appointment?.customerName,
          appointmentVehicle: j.appointment?.vehicle,
          appointmentServiceType: j.appointment?.serviceType,
          appointmentDate: j.appointment?.preferredDate
        };
        dispatch({ type: 'ADD_JOB_SHEET', payload: mapped });
        show('Job sheet created successfully!', 'success');
      }
    } catch (e) {
      show(e?.message || 'Failed to save job sheet', 'error');
    }
    setShowModal(false);
    setEditingJob(null);
    setFormData({
      carId: '',
      assignedMechanic: '',
      tasks: [{ description: '', completed: false }],
      estimatedCompletion: '',
      customerPhone: ''
    });
    setSelectedOwner('');
    setAppointmentContext(null);
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData(job);
    const car = state.cars.find(c => c.id === job.carId);
    setSelectedOwner(car?.customerName || '');
    setShowModal(true);
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job sheet?')) {
      try {
        await apiRequest(`/jobs/${jobId}`, { method: 'DELETE' });
        dispatch({ type: 'DELETE_JOB_SHEET', payload: jobId });
        show('Job sheet deleted successfully!', 'success');
      } catch (e) {
        show(e?.message || 'Failed to delete job sheet', 'error');
      }
    }
  };

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  const updateTaskStatus = async (jobId, taskIndex, completed) => {
    const job = state.jobSheets.find(j => j.id === jobId);
    if (!job) return;
    const updatedTasks = [...job.tasks];
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], completed };
    const allCompleted = updatedTasks.every(task => task.completed);
    const newStatus = allCompleted ? 'completed' : 'in_progress';
    try {
      const payload = {
        tasks: updatedTasks,
        status: newStatus
      };
      if (job.carId) {
        payload.car = String(job.carId);
      }
      if (job.assignedMechanic) {
        payload.assignedMechanic = job.assignedMechanic;
      }
      if (job.estimatedCompletion) {
        payload.estimatedCompletion = job.estimatedCompletion;
      }
      const resp = await apiRequest(`/jobs/${jobId}`, { method: 'PUT', body: payload });
      const j = resp.data;
      dispatch({
        type: 'UPDATE_JOB_SHEET',
        payload: {
          id: j.id,
          carId: j.car && j.car.id ? j.car.id : j.car,
          assignedMechanic: j.assignedMechanic,
          tasks: j.tasks,
          status: j.status,
          createdAt: j.createdAt,
          estimatedCompletion: j.estimatedCompletion || ''
        }
      });
    } catch (e) {
      // ignore for now
    }
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

  const canDelete = user?.role === 'owner';
  const canEdit = user?.role === 'owner';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Sheets</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage repair jobs and track progress
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 sm:mt-0 btn-primary flex items-center "
          >
            <Plus className="h-4 w-4 mr-2 " />
            Create Job Sheet
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by car or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        
        <select
          value={mechanicFilter}
          onChange={(e) => setMechanicFilter(e.target.value)}
          className="input-field"
        >
          <option value="all">All Mechanics</option>
          {state.mechanics.map(mechanic => (
            <option key={mechanic.id} value={mechanic.name}>
              {mechanic.name}
            </option>
          ))}
        </select>
        
        <div className="flex items-center text-sm text-gray-600">
          <Filter className="h-4 w-4 mr-2" />
          {filteredJobs.length} jobs found
        </div>
      </div>

      {/* Job Sheets Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredJobs.map((job) => {
          const car = state.cars.find(c => c.id === job.carId);
          const completedTasks = job.tasks.filter(task => task.completed).length;
          const totalTasks = job.tasks.length;
          const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
          
          return (
            <div key={job.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <Wrench className="h-8 w-8 text-primary-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {car ? `${car.make} ${car.model}` : (job.appointmentVehicle || 'Unknown Car')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {car ? car.licensePlate : (job.appointmentCustomerName ? `Owner: ${job.appointmentCustomerName}` : 'No License Plate')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(job.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  {job.assignedMechanic}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Created: {new Date(job.createdAt).toLocaleDateString()}
                </div>
                {job.estimatedCompletion && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    Due: {new Date(job.estimatedCompletion).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{completedTasks}/{totalTasks} tasks</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleViewDetails(job)}
                  className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                >
                  View Details
                </button>
                <div className="flex space-x-2">
                  {canEdit && (
                    <button
                      onClick={() => handleEdit(job)}
                      className="text-gray-400 hover:text-blue-600"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create/Edit Job Sheet Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingJob ? 'Edit Job Sheet' : 'Create New Job Sheet'}
                  </h3>
                  
                  <div className="space-y-4">
                    {appointmentContext && (
                      <div className="p-3 bg-blue-50 rounded border border-blue-100 text-sm text-blue-800">
                        <div className="font-medium mb-1">Appointment</div>
                        <div>Customer: {appointmentContext.customerName}</div>
                        <div>Vehicle: {appointmentContext.vehicle}</div>
                        <div>Service: {appointmentContext.serviceType}</div>
                        <div>Date: {new Date(appointmentContext.preferredDate).toLocaleDateString()}</div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Owner
                      </label>
                      <select
                        value={selectedOwnerId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setSelectedOwnerId(id);
                          const owner = customers.find(c => (c.id || c._id) === id);
                          setSelectedOwner(owner ? owner.name : '');
                          
                          // Clear car selection if current car doesn't belong to selected owner
                          if (formData.carId) {
                            const currentCar = state.cars.find(c => c.id === formData.carId);
                            if (currentCar && owner) {
                              const carBelongsToOwner = (
                                (currentCar.customerEmail && owner.email && 
                                 currentCar.customerEmail.toLowerCase() === owner.email.toLowerCase()) ||
                                (currentCar.customerName && owner.name && 
                                 currentCar.customerName.toLowerCase() === owner.name.toLowerCase())
                              );
                              if (!carBelongsToOwner) {
                                setFormData(prev => ({ ...prev, carId: '' }));
                              }
                            }
                          }
                        }}
                        className="input-field"
                      >
                        <option value="">All owners</option>
                        {customers.length === 0 ? (
                          <option value="" disabled>No customers found</option>
                        ) : (
                          customers.map(c => (
                            <option key={c.id || c._id} value={c.id || c._id}>{c.name} ({c.email})</option>
                          ))
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {appointmentContext ? 'Select Car (optional for appointment jobs)' : 'Select Car *'}
                      </label>
                      <div className="flex items-center gap-2">
                      <select
                        name="carId"
                        value={formData.carId}
                        onChange={handleInputChange}
                        required={!appointmentContext}
                        className="input-field flex-1"
                      >
                        <option value="">Choose a car...</option>
                        {state.cars
                          .filter(car => {
                            // If no owner selected, show all cars
                            if (!selectedOwnerId) return true;
                            
                            // Find the selected owner
                            const owner = customers.find(c => (c.id || c._id) === selectedOwnerId);
                            if (!owner) return true;
                            
                            // Match by email if available, otherwise by name
                            if (car.customerEmail && owner.email) {
                              return car.customerEmail.toLowerCase() === owner.email.toLowerCase();
                            }
                            if (car.customerName && owner.name) {
                              return car.customerName.toLowerCase() === owner.name.toLowerCase();
                            }
                            
                            return false;
                          })
                          .map(car => (
                          <option key={car.id} value={car.id}>
                            {car.licensePlate} - {car.make} {car.model} ({car.customerName || 'Unknown Owner'})
                          </option>
                        ))}
                      </select>
                      <button type="button" onClick={loadCars} className="px-2 py-2 text-xs border rounded hover:bg-gray-50">Refresh</button>
                      </div>
                      {state.cars.length === 0 && (
                        <p className="mt-1 text-xs text-red-500">No cars found. Please add cars first.</p>
                      )}
                      {selectedOwnerId && state.cars.filter(car => {
                        const owner = customers.find(c => (c.id || c._id) === selectedOwnerId);
                        if (!owner) return true;
                        if (car.customerEmail && owner.email) {
                          return car.customerEmail.toLowerCase() === owner.email.toLowerCase();
                        }
                        if (car.customerName && owner.name) {
                          return car.customerName.toLowerCase() === owner.name.toLowerCase();
                        }
                        return false;
                      }).length === 0 && (
                        <p className="mt-1 text-xs text-yellow-600">No cars found for selected owner.</p>
                      )}
                      {appointmentContext && (
                        <p className="mt-1 text-xs text-gray-500">You can create the job now and link a car later.</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assign to Mechanic *
                      </label>
                      <select
                        name="assignedMechanic"
                        value={formData.assignedMechanic}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                      >
                        <option value="">Choose a mechanic...</option>
                        {state.mechanics.length === 0 ? (
                          <option value="" disabled>No mechanics found</option>
                        ) : (
                          state.mechanics.map(mechanic => (
                            <option key={mechanic.id} value={mechanic.name}>
                              {mechanic.name}
                            </option>
                          ))
                        )}
                      </select>
                      {state.mechanics.length === 0 && (
                        <p className="mt-1 text-xs text-red-500">No mechanics found. Please add mechanics first.</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer Phone
                      </label>
                      <input
                        type="tel"
                        name="customerPhone"
                        value={formData.customerPhone || ''}
                        onChange={handleInputChange}
                        placeholder="e.g. +94 77 123 4567"
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Completion
                      </label>
                      <input
                        type="date"
                        name="estimatedCompletion"
                        value={formData.estimatedCompletion}
                        onChange={handleInputChange}
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tasks
                      </label>
                      <div className="space-y-2">
                        {formData.tasks.map((task, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={task.description}
                              onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                              placeholder="Task description..."
                              className="flex-1 input-field"
                            />
                            <button
                              type="button"
                              onClick={() => removeTask(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addTask}
                          className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                        >
                          + Add Task
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn-primary sm:ml-3 sm:w-auto w-full"
                  >
                    {editingJob ? 'Update' : 'Create'} Job Sheet
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingJob(null);
                      setFormData({
                        carId: '',
                        assignedMechanic: '',
                        tasks: [{ description: '', completed: false }],
                        estimatedCompletion: ''
                      });
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
                      <span className="font-medium text-gray-700">Mechanic:</span>
                      <span className="ml-2 text-gray-900">{selectedJob.assignedMechanic}</span>
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
                          <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSheets;
