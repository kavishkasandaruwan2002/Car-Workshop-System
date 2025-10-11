  import React, { useEffect, useState } from 'react';
  import { useApp } from '../context/AppContext';
  import { useToast } from '../components/Toast';
  import { apiRequest } from '../api/client';
  import {
    Users,
    Plus,
    Edit,
    Trash2,
    Phone,
    Mail,
    Wrench,
    Star,
    X,
    Save,
    AlertTriangle
  } from 'lucide-react';

  const Mechanics = () => {
    const { state, dispatch } = useApp();
    const { show } = useToast();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedMechanic, setSelectedMechanic] = useState(null);
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      phone: '',
      skills: [],
      availability: 'available',
      experience: ''
    });
    const [newSkill, setNewSkill] = useState('');
    const [formErrors, setFormErrors] = useState({});

    const emailRegex = /^\S+@\S+\.\S+$/;
    const phoneRegex = /^[0-9()+\-\s]{7,20}$/; // permissive phone match

    const validateField = (field, value) => {
      const errors = { ...formErrors };
      switch (field) {
        case 'name':
          errors.name = value.trim() ? '' : 'Name is required';
          break;
        case 'email':
          if (!value.trim()) errors.email = 'Email is required';
          else if (!emailRegex.test(value)) errors.email = 'Enter a valid email address';
          else errors.email = '';
          break;
        case 'password':
          // when adding a mechanic password is required; when editing it's optional
          if (showAddModal) {
            if (!value) errors.password = 'Password is required';
            else if (value.length < 6) errors.password = 'Password must be at least 6 characters';
            else errors.password = '';
          } else if (showEditModal) {
            // if provided, must be at least 6 chars
            if (value && value.length < 6) errors.password = 'Password must be at least 6 characters';
            else errors.password = '';
          }
          break;
        case 'phone':
          if (value && !phoneRegex.test(value)) errors.phone = 'Enter a valid phone number';
          else errors.phone = '';
          break;
        case 'experience':
          // optional, but limit length
          if (value && value.length > 100) errors.experience = 'Experience text is too long';
          else errors.experience = '';
          break;
        default:
          break;
      }
      setFormErrors(errors);
    };

    const validateForm = () => {
      const values = { ...formData };
      const errors = {};

      // name
      errors.name = values.name && values.name.trim() ? '' : 'Name is required';

      // email
      if (!values.email || !values.email.trim()) errors.email = 'Email is required';
      else if (!emailRegex.test(values.email)) errors.email = 'Enter a valid email address';
      else errors.email = '';

      // password: required for add, optional for edit
      if (showAddModal) {
        if (!values.password) errors.password = 'Password is required';
        else if (values.password.length < 6) errors.password = 'Password must be at least 6 characters';
        else errors.password = '';
      } else {
        if (values.password && values.password.length < 6) errors.password = 'Password must be at least 6 characters';
        else errors.password = '';
      }

      // phone
      if (values.phone && !phoneRegex.test(values.phone)) errors.phone = 'Enter a valid phone number';
      else errors.phone = '';

      // experience
      if (values.experience && values.experience.length > 100) errors.experience = 'Experience text is too long';
      else errors.experience = '';

      setFormErrors(errors);
      return Object.values(errors).every((v) => !v);
    };

    useEffect(() => {
      (async () => {
        try { 
          const resp = await apiRequest('/mechanics');
          const list = Array.isArray(resp?.data) ? resp.data : [];
          // ensure id field exists for actions
          const normalized = list.map(m => ({ ...m, id: m.id || m._id }));
          dispatch({ type: 'SET_MECHANICS', payload: normalized });
        } catch (e) {}
      })();
    }, [dispatch]);

    const handleAddMechanic = async () => {
      if (!validateForm()) {
        return;
      }
      
      try {
        const resp = await apiRequest('/mechanics', { method: 'POST', body: formData });
        dispatch({ type: 'ADD_MECHANIC', payload: resp.data });
        show('Mechanic added successfully!', 'success');
      } catch (e) {
        show(e?.message || 'Failed to add mechanic', 'error');
      }
      
      resetForm();
      setShowAddModal(false);
    };

    const handleEditMechanic = async () => {
      if (!validateForm()) {
        return;
      }
      
      try {
        const resp = await apiRequest(`/mechanics/${selectedMechanic.id}`, { method: 'PUT', body: formData });
        dispatch({ type: 'UPDATE_MECHANIC', payload: resp.data });
        show('Mechanic updated successfully!', 'success');
      } catch (e) {
        show(e?.message || 'Failed to update mechanic', 'error');
      }
      
      resetForm();
      setShowEditModal(false);
      setSelectedMechanic(null);
    };

    const handleDeleteMechanic = async () => {
      try {
        await apiRequest(`/mechanics/${selectedMechanic.id}`, { method: 'DELETE' });
        dispatch({ type: 'DELETE_MECHANIC', payload: selectedMechanic.id });
        show('Mechanic deleted successfully!', 'success');
      } catch (e) {
        show(e?.message || 'Failed to delete mechanic', 'error');
      }
      
      setShowDeleteModal(false);
      setSelectedMechanic(null);
    };

    const resetForm = () => {
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        skills: [],
        availability: 'available',
        experience: ''
      });
      setNewSkill('');
    };

    const openEditModal = (mechanic) => {
      setSelectedMechanic(mechanic);
      setFormData({
        name: mechanic.name,
        email: mechanic.email,
        password: '', // Don't pre-fill password for security
        phone: mechanic.phone || '',
        skills: mechanic.skills || [],
        availability: mechanic.availability,
        experience: mechanic.experience || ''
      });
      setFormErrors({});
      setShowEditModal(true);
    };

    const openDeleteModal = (mechanic) => {
      setSelectedMechanic(mechanic);
      setShowDeleteModal(true);
    };

    const addSkill = () => {
      if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
        setFormData({
          ...formData,
          skills: [...formData.skills, newSkill.trim()]
        });
        setNewSkill('');
      }
    };

    const removeSkill = (skillToRemove) => {
      setFormData({
        ...formData,
        skills: formData.skills.filter(skill => skill !== skillToRemove)
      });
    };

    const getAvailabilityColor = (availability) => {
      switch (availability) {
        case 'available':
          return 'bg-green-100 text-green-800';
        case 'busy':
          return 'bg-yellow-100 text-yellow-800';
        case 'unavailable':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mechanic Management</h1>
            <p className="mt-1 text-sm text-gray-500">Add, edit and manage mechanics</p>
          </div>
          <button
            onClick={() => { resetForm(); setFormErrors({}); setShowAddModal(true); }}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Mechanic
          </button>
        </div>

        {/* Mechanics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state?.mechanics?.map((mechanic) => (
            <div key={mechanic.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{mechanic.name}</h3>
                      <p className="text-sm text-gray-600">{mechanic.experience}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(mechanic.availability)}`}>
                    {mechanic.availability}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex-1 flex flex-col">
                {/* Contact Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{mechanic.email}</span>
                  </div>
                  {mechanic.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-3 text-gray-400" />
                      <span>{mechanic.phone}</span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                <div className="mb-4 flex-1">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {mechanic.skills?.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        <Wrench className="h-3 w-3 mr-1" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 mt-auto">
                  <button
                    onClick={() => openEditModal(mechanic)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(mechanic)}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )) || (
            <div className="col-span-full text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Mechanics Found</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first mechanic.</p>
              <button
                onClick={() => { resetForm(); setFormErrors({}); setShowAddModal(true); }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Mechanic
              </button>
            </div>
          )}
        </div>

        {/* Add Mechanic Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddModal(false)} />
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Add New Mechanic</h3>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => { setFormData({ ...formData, name: e.target.value }); validateField('name', e.target.value); }}
                        onBlur={(e) => validateField('name', e.target.value)}
                        className={`input-field ${formErrors.name ? 'border-red-300 ring-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                        placeholder="Enter mechanic name"
                      />
                      {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => { setFormData({ ...formData, email: e.target.value }); validateField('email', e.target.value); }}
                        onBlur={(e) => validateField('email', e.target.value)}
                        className={`input-field ${formErrors.email ? 'border-red-300 ring-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                        placeholder="Enter email address"
                      />
                      {formErrors.email && <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => { setFormData({ ...formData, password: e.target.value }); validateField('password', e.target.value); }}
                        onBlur={(e) => validateField('password', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.password ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="Enter password (min 6 characters)"
                      />
                      {formErrors.password && <p className="mt-1 text-xs text-red-600">{formErrors.password}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); validateField('phone', e.target.value); }}
                        onBlur={(e) => validateField('phone', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.phone ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="Enter phone number"
                      />
                      {formErrors.phone && <p className="mt-1 text-xs text-red-600">{formErrors.phone}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                      <input
                        type="text"
                        value={formData.experience}
                        onChange={(e) => { setFormData({ ...formData, experience: e.target.value }); validateField('experience', e.target.value); }}
                        onBlur={(e) => validateField('experience', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.experience ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="e.g., 5 years"
                      />
                      {formErrors.experience && <p className="mt-1 text-xs text-red-600">{formErrors.experience}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                      <select
                        value={formData.availability}
                        onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                      <div className="flex space-x-2 mb-2">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Add skill"
                        />
                        <button
                          onClick={addSkill}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">

                        {formData.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {skill}
                            <button
                              onClick={() => removeSkill(skill)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={handleAddMechanic}
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Add Mechanic
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Mechanic Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowEditModal(false)} />
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Edit Mechanic</h3>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => { setFormData({ ...formData, name: e.target.value }); validateField('name', e.target.value); }}
                        onBlur={(e) => validateField('name', e.target.value)}
                        className={`input-field ${formErrors.name ? 'border-red-300 ring-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                        placeholder="Enter mechanic name"
                      />
                      {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => { setFormData({ ...formData, email: e.target.value }); validateField('email', e.target.value); }}
                        onBlur={(e) => validateField('email', e.target.value)}
                        className={`input-field ${formErrors.email ? 'border-red-300 ring-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                        placeholder="Enter email address"
                      />
                      {formErrors.email && <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password (leave blank to keep current)</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => { setFormData({ ...formData, password: e.target.value }); validateField('password', e.target.value); }}
                        onBlur={(e) => validateField('password', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.password ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="Enter new password (min 6 characters)"
                      />
                      {formErrors.password && <p className="mt-1 text-xs text-red-600">{formErrors.password}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); validateField('phone', e.target.value); }}
                        onBlur={(e) => validateField('phone', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.phone ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="Enter phone number"
                      />
                      {formErrors.phone && <p className="mt-1 text-xs text-red-600">{formErrors.phone}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                      <input
                        type="text"
                        value={formData.experience}
                        onChange={(e) => { setFormData({ ...formData, experience: e.target.value }); validateField('experience', e.target.value); }}
                        onBlur={(e) => validateField('experience', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.experience ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="e.g., 5 years"
                      />
                      {formErrors.experience && <p className="mt-1 text-xs text-red-600">{formErrors.experience}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                      <select
                        value={formData.availability}
                        onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                      <div className="flex space-x-2 mb-2">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Add skill"
                        />
                        <button
                          onClick={addSkill}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {skill}
                            <button
                              onClick={() => removeSkill(skill)}  
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={handleEditMechanic}
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteModal(false)} />
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Delete Mechanic
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete <strong>{selectedMechanic?.name}</strong>? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={handleDeleteMechanic}
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

  export default Mechanics;
