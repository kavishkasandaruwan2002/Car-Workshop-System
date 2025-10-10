/**
 * ============================================================================
 * CAR PROFILE COMPONENT - RECEPTIONIST DASHBOARD CAR MANAGEMENT INTERFACE
 * ============================================================================
 * 
 * This React component provides the main user interface for receptionists to
 * manage customer car profiles in the garage management system. It handles
 * all CRUD operations for vehicle records with a modern, responsive design.
 * 
 * RECEPTIONIST DASHBOARD FEATURES:
 * - View all customer car profiles in an organized grid layout
 * - Search and filter cars by multiple criteria (license plate, customer info, vehicle details)
 * - Create new car profiles for customer registration
 * - Edit existing car profiles to update customer or vehicle information
 * - Delete car profiles (with appropriate permissions and confirmation)
 * - View repair history for each vehicle
 * - Mobile-responsive design for tablet and desktop use
 * 
 * USER ROLE PERMISSIONS:
 * - Receptionists: Full CRUD access to car profiles
 * - Owners: Complete administrative access
 * - Customers/Mechanics: Read-only access (if implemented)
 * 
 * STATE MANAGEMENT: Uses React Context API for global state management
 * API INTEGRATION: RESTful API calls to backend car endpoints
 * UI FRAMEWORK: Tailwind CSS for styling and responsive design
 */

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';      // Global state management
import { useAuth } from '../context/AuthContext';    // User authentication context
import { apiRequest } from '../api/client';          // HTTP client for API calls
import { useToast } from '../components/Toast';      // Toast notifications for user feedback
import {
  Plus, Search, Edit, Trash2, Eye, Car, Phone, Mail, Calendar, Wrench, DollarSign, X
} from 'lucide-react';  // Icon components for UI elements

/**
 * MAIN CAR PROFILE COMPONENT
 * 
 * Manages the complete car profile interface including:
 * - Car profile listing and display
 * - Search and filtering functionality
 * - Add/Edit car profile modal forms
 * - Repair history viewing
 * - Delete confirmation and operations
 */
const CarProfile = () => {
  // ============================================================================
  // HOOKS AND STATE MANAGEMENT - Component Data and UI State
  // ============================================================================

  // Global application state and user authentication
  const { state, dispatch } = useApp();              // Access cars array and dispatch actions
  const { user } = useAuth();                        // Current logged-in user information
  const { show } = useToast();                       // Toast notification function

  // Component UI state management
  const [showModal, setShowModal] = useState(false);                   // Control add/edit modal visibility
  const [editingCar, setEditingCar] = useState(null);                 // Track which car is being edited (null for new car)
  const [searchTerm, setSearchTerm] = useState('');                    // Store current search/filter term
  const [selectedCar, setSelectedCar] = useState(null);               // Car selected for repair history view
  const [showRepairHistory, setShowRepairHistory] = useState(false);  // Control repair history modal visibility

  // Form data state for add/edit operations
  // Initialized with empty values for new car creation
  const [formData, setFormData] = useState({
    licensePlate: '',      // Vehicle license/registration plate
    customerName: '',      // Customer full name
    customerPhone: '',     // Customer contact phone number
    customerEmail: '',     // Customer email address (optional)
    make: '',             // Vehicle manufacturer (Toyota, Ford, etc.)
    model: '',            // Vehicle model (Camry, F-150, etc.)
    year: '',             // Manufacturing year
    color: '',            // Vehicle color (optional)
    vin: ''               // Vehicle Identification Number (optional)
  });

  // ============================================================================
  // DATA LOADING - Fetch Car Profiles from Backend API
  // ============================================================================

  /**
   * LOAD CAR PROFILES AND JOB SHEETS ON COMPONENT MOUNT
   * 
   * Fetches all car profiles and job sheets from the backend API when the component first loads.
   * Updates the global state with car profile data for use throughout the app.
   * Job sheets are needed for repair history display.
   * 
   * API ENDPOINTS: GET /cars, GET /jobs
   * ERROR HANDLING: Silently fails to preserve existing mock data during development
   * DATA NORMALIZATION: Ensures all car records have required date fields for UI
   */
  useEffect(() => {
    (async () => {
      try {
        // Make API request to fetch all car profiles
        const resp = await apiRequest('/cars');
        const list = Array.isArray(resp?.data) ? resp.data : [];

        // Normalize data to ensure all records have required fields for UI display
        // Some older records might be missing createdAt/updatedAt timestamps
        const normalized = list.map(c => ({
          ...c,
          createdAt: c.createdAt || new Date().toISOString(),        // Default to current time if missing
          updatedAt: c.updatedAt || c.createdAt || new Date().toISOString()  // Default to createdAt or current time
        }));

        // Update global state with fetched car profile data
        dispatch({ type: 'SET_CARS', payload: normalized });

        // Also fetch job sheets for repair history
        const jobsResp = await apiRequest('/jobs');
        const jobsList = Array.isArray(jobsResp?.data) ? jobsResp.data : [];

        // Map API shape to frontend expected shape
        const normalizedJobs = jobsList.map(j => ({
          id: j.id,
          carId: (j.car && (j.car.id || j.car._id)) ? (j.car.id || j.car._id) : (j.carId || j.car),
          assignedMechanic: j.assignedMechanic,
          tasks: Array.isArray(j.tasks) ? j.tasks : [],
          status: j.status,
          createdAt: j.createdAt,
          estimatedCompletion: j.estimatedCompletion || ''
        }));

        dispatch({ type: 'SET_JOB_SHEETS', payload: normalizedJobs });
      } catch (e) {
        // Silently handle API errors to preserve existing mock data during development
        // In production, this might show an error toast or retry mechanism
      }
    })();
  }, [dispatch]);  // Re-run only if dispatch function changes

  // ============================================================================
  // SEARCH AND FILTERING - Car Profile Search Functionality
  // ============================================================================

  /**
   * FILTER CAR PROFILES BY SEARCH TERM
   * 
   * Provides real-time search functionality for receptionists to quickly find
   * specific car profiles. Searches across multiple fields simultaneously.
   * 
   * SEARCH FIELDS:
   * - License plate (partial match, case-insensitive)
   * - Customer name (partial match, case-insensitive)  
   * - Customer phone number (partial match)
   * 
   * RECEPTIONIST USE CASES:
   * - Find car by license plate when customer calls or visits
   * - Search by customer name for returning customers
   * - Locate car using partial phone number
   */
  const filteredCars = state.cars.filter(car =>
    car.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||  // License plate search
    car.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||  // Customer name search
    car.customerPhone.includes(searchTerm)                                // Phone number search
  );

  // ============================================================================
  // FORM INPUT HANDLING - Manage Add/Edit Form Data
  // ============================================================================

  /**
   * HANDLE FORM INPUT CHANGES
   * 
   * Updates form data state when user types in input fields.
   * Provides controlled input components for reliable form handling.
   * 
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value    // Update specific field while preserving others
    }));
  };

  // ============================================================================
  // CRUD OPERATIONS - Car Profile Create, Update, Delete Functions
  // ============================================================================

  /**
   * SUBMIT CAR PROFILE FORM - CREATE OR UPDATE OPERATION
   * 
   * Handles both creation of new car profiles and updating existing ones.
   * Determines operation type based on whether a car is being edited.
   * 
   * CREATE FLOW (New Car):
   * 1. Validate form data (handled by backend)
   * 2. Send POST request to /cars endpoint
   * 3. Add new car to global state
   * 4. Close modal and reset form
   * 
   * UPDATE FLOW (Edit Existing):
   * 1. Send PUT request to /cars/:id endpoint
   * 2. Update car in global state
   * 3. Close modal and reset form
   * 
   * ERROR HANDLING: Display user-friendly error messages via toast notifications
   * 
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent default form submission

    try {
      // Prepare payload with proper data types
      // Convert year to number since HTML inputs return strings
      const payload = {
        ...formData,
        year: formData.year ? Number(formData.year) : undefined
      };

      if (editingCar) {
        // UPDATE EXISTING CAR PROFILE
        const resp = await apiRequest(`/cars/${editingCar.id}`, {
          method: 'PUT',
          body: payload
        });
        const updated = resp.data;

        // Update the car in global state
        dispatch({ type: 'UPDATE_CAR', payload: { ...updated } });
        show('Car profile updated successfully!', 'success');
      } else {
        // CREATE NEW CAR PROFILE
        const resp = await apiRequest('/cars', {
          method: 'POST',
          body: payload
        });
        const created = resp.data;

        // Normalize data for UI consistency and add to global state
        const normalized = {
          ...created,
          id: created.id,
          createdAt: created.createdAt || new Date().toISOString(),
          updatedAt: created.updatedAt || created.createdAt || new Date().toISOString()
        };
        dispatch({ type: 'ADD_CAR', payload: normalized });
        show('Car profile created successfully!', 'success');
      }
    } catch (e) {
      // Display error message to user via toast notification
      show(e?.message || 'Failed to save car profile', 'error');
    }

    // Close modal and reset form state regardless of success/failure
    setShowModal(false);
    setEditingCar(null);
    setFormData({
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
  };

  /**
   * EDIT CAR PROFILE - Prepare Car for Editing
   * 
   * Sets up the form for editing an existing car profile.
   * Populates form fields with current car data and opens modal.
   * 
   * RECEPTIONIST USE: Update customer contact info, fix data entry errors,
   * modify vehicle details, update license plate information
   * 
   * @param {Object} car - Car profile object to edit
   */
  const handleEdit = (car) => {
    setEditingCar(car);      // Store reference to car being edited
    setFormData(car);        // Pre-populate form with current car data
    setShowModal(true);      // Open the edit modal
  };

  /**
   * DELETE CAR PROFILE - Remove Car from Database
   * 
   * Permanently deletes a car profile after user confirmation.
   * This is a destructive operation that cannot be undone.
   * 
   * SECURITY MEASURES:
   * - Requires explicit user confirmation via browser confirm dialog
   * - Only available to users with delete permissions (owner/receptionist)
   * - Shows error message if deletion fails
   * 
   * RECEPTIONIST USE: Remove duplicate profiles, clean up incorrect entries,
   * delete at customer request, maintain database integrity
   * 
   * @param {string} carId - ID of car profile to delete
   */
  const handleDelete = async (carId) => {
    // Require explicit confirmation for destructive operation
    if (window.confirm('Are you sure you want to delete this car profile?')) {
      try {
        // Send DELETE request to backend API
        await apiRequest(`/cars/${carId}`, { method: 'DELETE' });

        // Remove car from global state to update UI immediately
        dispatch({ type: 'DELETE_CAR', payload: carId });
        show('Car profile deleted successfully!', 'success');
      } catch (e) {
        // Display error message if deletion fails
        show(e?.message || 'Failed to delete car profile', 'error');
      }
    }
  };

  /**
   * VIEW REPAIR HISTORY - Open Repair History Modal
   * 
   * Opens modal displaying complete repair history for selected car.
   * Shows chronological list of all services, repairs, and maintenance.
   * 
   * RECEPTIONIST USE: Review customer's service history, check warranty status,
   * reference previous repairs for current service estimates
   * 
   * @param {Object} car - Car profile to show repair history for
   */
  const handleViewRepairHistory = (car) => {
    setSelectedCar(car);             // Store car for repair history display
    setShowRepairHistory(true);      // Open repair history modal
  };

  /**
   * GET REPAIR HISTORY FOR CAR
   * 
   * Filters global job sheets data to return only completed jobs for specific car.
   * Used by repair history modal and car profile summary display.
   * 
   * @param {string} carId - ID of car to get repair history for
   * @returns {Array} Array of job records for the car (representing repair history)
   */
  const getRepairHistory = (carId) => {
    return state.jobSheets.filter(job => job.carId === carId && job.status === 'completed');
  };

  // ============================================================================
  // PERMISSION CHECKING - User Role-Based Access Control
  // ============================================================================

  /**
   * CHECK DELETE PERMISSIONS
   * 
   * Determines if current user can delete car profiles.
   * Controls visibility of delete buttons in the UI.
   * 
   * PERMITTED ROLES:
   * - owner: Full administrative access
   * - receptionist: Can delete for database maintenance
   * 
   * DENIED ROLES:
   * - customer: Read-only access to their own vehicles
   * - mechanic: Read-only access for job assignments
   */
  const canDelete = user?.role === 'owner' || user?.role === 'receptionist';

  // ============================================================================
  // COMPONENT RENDER - Main UI Layout and Structure
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* ========================================================================
          PAGE HEADER - Title, Description, and Action Buttons
          ======================================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          {/* Page title and description for receptionist dashboard */}
          <h1 className="text-2xl font-bold text-gray-900">Car Profiles</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage vehicle profiles and repair history
          </p>
        </div>

        {/* Action buttons - responsive layout for mobile and desktop */}
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2 flex-wrap">
          <button
            onClick={() => setShowModal(true)}    // Open modal for new car creation
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Car
          </button>
        </div>
      </div>

      {/* ========================================================================
          SEARCH BAR - Real-time Car Profile Filtering
          ======================================================================== */}

      <div className="relative">
        {/* Search icon positioned inside input field */}
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />

        {/* Search input with real-time filtering */}
        <input
          type="text"
          placeholder="Search by license plate, customer name, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}    // Update search term in real-time
          className="input-field pl-10"                      // Padding for search icon
        />
      </div>

      {/* ========================================================================
          CAR PROFILES GRID - Responsive Grid Layout for Car Profile Cards
          ======================================================================== */}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCars.map((car) => {
          // Calculate repair history statistics for each car
          const repairHistory = getRepairHistory(car.id);

          return (
            <div key={car.id} className="card hover:shadow-md transition-shadow">
              {/* ============================================================
                  CAR PROFILE CARD HEADER - Basic Info and Action Buttons
                  ============================================================ */}

              <div className="flex items-start justify-between mb-4">
                {/* Car icon and basic information display */}
                <div className="flex items-center">
                  <Car className="h-8 w-8 text-primary-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{car.licensePlate}</h3>
                    <p className="text-sm text-gray-500">{car.year} {car.make} {car.model}</p>
                  </div>
                </div>

                {/* Action buttons for car profile operations */}
                <div className="flex space-x-2">
                  {/* View repair history button */}
                  <button
                    onClick={() => handleViewRepairHistory(car)}
                    className="text-gray-400 hover:text-primary-600"
                    title="View Repair History"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  {/* Edit car profile button */}
                  <button
                    onClick={() => handleEdit(car)}
                    className="text-gray-400 hover:text-blue-600"
                    title="Edit Car Profile"
                  >
                    <Edit className="h-4 w-4" />
                  </button>

                  {/* Delete button (conditional based on user permissions) */}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(car.id)}
                      className="text-gray-400 hover:text-red-600"
                      title="Delete Car Profile"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* ============================================================
                  CUSTOMER CONTACT INFORMATION - Phone, Email, Date Added
                  ============================================================ */}

              <div className="space-y-2 mb-4">
                {/* Customer phone number with phone icon */}
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {car.customerPhone}
                </div>

                {/* Customer email with mail icon */}
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {car.customerEmail}
                </div>

                {/* Profile creation date with calendar icon */}
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Added: {new Date(car.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* ============================================================
                  REPAIR HISTORY SUMMARY - Statistics Footer
                  ============================================================ */}

              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  {/* Repair count with wrench icon */}
                  <div className="flex items-center text-gray-600">
                    <Wrench className="h-4 w-4 mr-1" />
                    {repairHistory.length} completed jobs
                  </div>

                  {/* Last service date */}
                  {repairHistory.length > 0 && (
                    <div className="flex items-center text-blue-600 font-medium">
                      <Calendar className="h-4 w-4 mr-1" />
                      Last: {new Date(repairHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================
          ADD/EDIT CAR MODAL - Form for Creating and Updating Car Profiles
          ======================================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Modal backdrop overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} />

            {/* Modal dialog container */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  {/* Modal header with dynamic title */}
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingCar ? 'Edit Car Profile' : 'Add New Car Profile'}
                  </h3>

                  {/* Form fields grid - responsive 2-column layout */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    {/* ============================================
                        VEHICLE IDENTIFICATION FIELDS
                        ============================================ */}

                    {/* License plate input - required field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        License Plate *
                      </label>
                      <input
                        type="text"
                        name="licensePlate"
                        value={formData.licensePlate}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        placeholder="e.g. ABC-123"
                      />
                    </div>

                    {/* VIN input - optional field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        VIN
                      </label>
                      <input
                        type="text"
                        name="vin"
                        value={formData.vin}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="17-character VIN"
                      />
                    </div>

                    {/* ============================================
                        CUSTOMER INFORMATION FIELDS
                        ============================================ */}

                    {/* Customer name - required field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        placeholder="Full customer name"
                      />
                    </div>

                    {/* Customer phone - required field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer Phone *
                      </label>
                      <input
                        type="tel"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        placeholder="Phone number"
                      />
                    </div>

                    {/* Customer email - optional field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer Email
                      </label>
                      <input
                        type="email"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="customer@email.com"
                      />
                    </div>

                    {/* ============================================
                        VEHICLE SPECIFICATION FIELDS
                        ============================================ */}

                    {/* Vehicle make - required field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Make *
                      </label>
                      <input
                        type="text"
                        name="make"
                        value={formData.make}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        placeholder="e.g. Toyota, Ford, Honda"
                      />
                    </div>

                    {/* Vehicle model - required field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Model *
                      </label>
                      <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        placeholder="e.g. Camry, F-150, Civic"
                      />
                    </div>

                    {/* Vehicle year - required field with validation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year *
                      </label>
                      <input
                        type="number"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        required
                        min="1900"
                        max="2024"
                        className="input-field"
                        placeholder="Manufacturing year"
                      />
                    </div>

                    {/* Vehicle color - optional field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color
                      </label>
                      <input
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Vehicle color"
                      />
                    </div>
                  </div>
                </div>

                {/* ============================================
                    MODAL ACTION BUTTONS - Submit and Cancel
                    ============================================ */}

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  {/* Submit button - dynamic text based on create/edit mode */}
                  <button
                    type="submit"
                    className="btn-primary sm:ml-3 sm:w-auto w-full"
                  >
                    {editingCar ? 'Update' : 'Create'} Car Profile
                  </button>

                  {/* Cancel button - closes modal and resets form */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);    // Close modal
                      setEditingCar(null);    // Clear editing state

                      // Reset form to empty state
                      setFormData({
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

      {/* ========================================================================
          REPAIR HISTORY MODAL - Display Complete Service History for Car
          ======================================================================== */}

      {showRepairHistory && selectedCar && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Modal backdrop overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowRepairHistory(false)} />

            {/* Repair history modal dialog - wider than add/edit modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">

                {/* Modal header with car identification and close button */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Repair History - {selectedCar.licensePlate}
                  </h3>
                  <button
                    onClick={() => setShowRepairHistory(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Repair history list or empty state message */}
                <div className="space-y-4">
                  {getRepairHistory(selectedCar.id).length > 0 ? (
                    /* Display repair history records sorted by date (newest first) */
                    getRepairHistory(selectedCar.id)
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((job) => (
                        <div key={job.id} className="border rounded-lg p-4">
                          {/* Job record header with mechanic and status */}
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">
                              Service Job #{job.id.slice(-6)}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.status === 'completed'
                                ? 'bg-green-100 text-green-800'    // Completed status styling
                                : job.status === 'in_progress'
                                  ? 'bg-yellow-100 text-yellow-800'  // In-progress status styling
                                  : 'bg-gray-100 text-gray-800'      // Pending status styling
                              }`}>
                              {job.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>

                          {/* Job record details grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>Date: {new Date(job.createdAt).toLocaleDateString()}</div>
                            <div>Mechanic: {job.assignedMechanic || 'Not assigned'}</div>
                            {job.estimatedCompletion && (
                              <div>Estimated Completion: {new Date(job.estimatedCompletion).toLocaleDateString()}</div>
                            )}
                            <div>Tasks: {job.tasks ? job.tasks.length : 0} tasks</div>
                          </div>

                          {/* Task details if available */}
                          {job.tasks && job.tasks.length > 0 && (
                            <div className="mt-2">
                              <strong className="text-sm text-gray-700">Tasks:</strong>
                              <ul className="mt-1 text-sm text-gray-600 space-y-1">
                                {job.tasks.map((task, index) => (
                                  <li key={index} className="flex items-center">
                                    <span className={`mr-2 ${task.completed ? 'text-green-600' : 'text-gray-400'}`}>
                                      {task.completed ? '✓' : '○'}
                                    </span>
                                    {task.description}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))
                  ) : (
                    /* Empty state when no repair history exists */
                    <div className="text-center py-8 text-gray-500">
                      No repair history found for this vehicle.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarProfile;
