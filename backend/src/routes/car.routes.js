/**
 * ============================================================================
 * CAR ROUTES - RECEPTIONIST DASHBOARD CAR PROFILE API ENDPOINTS
 * ============================================================================
 * 
 * This file defines all HTTP routes for car profile management in the 
 * receptionist dashboard. Routes handle CRUD operations for customer vehicles
 * with role-based access control and input validation.
 * 
 * RECEPTIONIST DASHBOARD INTEGRATION:
 * - Provides REST API endpoints for car profile management interface
 * - Implements role-based security for receptionist and owner access
 * - Validates all input data before processing to ensure data integrity
 * - Supports search, pagination, and filtering for large datasets
 * 
 * SECURITY MODEL:
 * - All routes require authentication (user must be logged in)
 * - READ operations: Available to all authenticated users
 * - WRITE operations: Limited to owners and receptionists only
 * - Mechanics and customers have read-only access to car information
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listCars, getCar, createCar, updateCar, deleteCar } from '../controllers/car.controller.js';

// Initialize Express router for car profile routes
const router = Router();

// ============================================================================
// GLOBAL MIDDLEWARE - APPLIED TO ALL CAR ROUTES
// ============================================================================

/**
 * AUTHENTICATION REQUIREMENT
 * All car profile routes require user authentication.
 * Ensures only logged-in users can access car profile data.
 * Receptionist dashboard requires login before accessing any car functions.
 */
router.use(authenticate);

// ============================================================================
// READ OPERATIONS - CAR PROFILE VIEWING (GET REQUESTS)
// ============================================================================

/**
 * GET /cars - LIST ALL CAR PROFILES (Receptionist Dashboard Main View)
 * 
 * Primary endpoint for receptionist dashboard car profile listing.
 * Supports pagination, search, and filtering functionality.
 * 
 * ACCESS CONTROL: All authenticated users can view car profiles
 * - Owners: Full access to all car profiles
 * - Receptionists: Full access for customer service
 * - Customers: Can view their own vehicles (filtered by customer ID)
 * - Mechanics: Can view cars for assigned jobs
 * 
 * QUERY PARAMETERS:
 * - page: Page number for pagination (default: 1)
 * - limit: Records per page (default: 10) 
 * - search: Search term for filtering cars
 * 
 * RECEPTIONIST USE: Main car profile listing in dashboard interface
 */
router.get('/', authorize(['owner', 'receptionist', 'customer', 'mechanic']), listCars);

/**
 * GET /cars/:id - GET SINGLE CAR PROFILE (Receptionist Dashboard Detail View)
 * 
 * Retrieves detailed information for a specific car profile.
 * Used when receptionist clicks on car profile for full details.
 * 
 * ACCESS CONTROL: Same as list operation - all authenticated users
 * 
 * URL PARAMETERS:
 * - id: MongoDB ObjectId of the car profile
 * 
 * RECEPTIONIST USE: View/edit car profile details, customer information
 */
router.get('/:id', authorize(['owner', 'receptionist', 'customer', 'mechanic']), getCar);

// ============================================================================
// CREATE OPERATIONS - NEW CAR PROFILE REGISTRATION (POST REQUESTS)
// ============================================================================

/**
 * POST /cars - CREATE NEW CAR PROFILE (Receptionist Dashboard Add New Car)
 * 
 * Creates new car profile with comprehensive validation.
 * Primary endpoint for receptionists registering new customer vehicles.
 * 
 * ACCESS CONTROL: Limited to users who can create car profiles
 * - Owners: Can create any car profile
 * - Receptionists: Can create car profiles for customers
 * - Customers: Can create their own car profiles
 * - Mechanics: NO CREATE ACCESS (read-only for assigned jobs)
 * 
 * VALIDATION RULES (processed before controller):
 * - licensePlate: String, minimum 2 characters (required)
 * - customerName: String, minimum 2 characters (required)
 * - customerPhone: String, minimum 3 characters (required) 
 * - customerEmail: Valid email format (optional)
 * - make: String, cannot be empty (required)
 * - model: String, cannot be empty (required)
 * - year: Integer between 1900-2100 (required)
 * - color: String (optional)
 * - vin: String, Vehicle Identification Number (optional)
 * 
 * MIDDLEWARE CHAIN:
 * 1. authorize() - Check user role permissions
 * 2. [validation array] - Validate input fields
 * 3. validate - Process validation results and return errors
 * 4. createCar - Execute controller function if validation passes
 * 
 * RECEPTIONIST USE: Add new customer vehicles during first visit/registration
 */
router.post(
  '/',
  authorize(['owner', 'receptionist', 'customer']),    // Role-based access control
  [
    // REQUIRED FIELD VALIDATIONS - Must be provided and meet minimum requirements
    body('licensePlate').isString().isLength({ min: 2 }).withMessage('License plate must be at least 2 characters'),
    body('customerName').isString().isLength({ min: 2 }).withMessage('Customer name must be at least 2 characters'),
    body('customerPhone').isString().isLength({ min: 3 }).withMessage('Phone number must be at least 3 characters'),
    
    // OPTIONAL FIELD VALIDATIONS - Validated only if provided
    body('customerEmail').optional().isEmail().withMessage('Must be a valid email address'),
    
    // VEHICLE INFORMATION VALIDATIONS - Core car details required
    body('make').isString().notEmpty().withMessage('Vehicle make is required'),
    body('model').isString().notEmpty().withMessage('Vehicle model is required'),
    body('year').isInt({ min: 1900, max: 2100 }).withMessage('Year must be between 1900 and 2100'),
    
    // OPTIONAL VEHICLE DETAILS - Additional information if available
    body('color').optional().isString().withMessage('Color must be a string'),
    body('vin').optional().isString().withMessage('VIN must be a string'),
  ],
  validate,      // Process validation results and send errors if any
  createCar      // Execute controller function if all validations pass
);

// ============================================================================
// UPDATE OPERATIONS - CAR PROFILE MODIFICATION (PUT REQUESTS)
// ============================================================================

/**
 * PUT /cars/:id - UPDATE EXISTING CAR PROFILE (Receptionist Dashboard Edit Car)
 * 
 * Updates existing car profile information with new data.
 * Used by receptionists to modify customer details or vehicle information.
 * 
 * ACCESS CONTROL: Limited to staff who can modify car profiles
 * - Owners: Can update any car profile
 * - Receptionists: Can update car profiles for customer service
 * - Customers: NO UPDATE ACCESS (must request changes through receptionist)
 * - Mechanics: NO UPDATE ACCESS (read-only access for job assignments)
 * 
 * UPDATE BEHAVIOR:
 * - Supports partial updates (only changed fields need to be sent)
 * - Maintains existing data for fields not included in request
 * - NO VALIDATION on update (assumes UI pre-validation)
 * - Returns updated car profile data after successful modification
 * 
 * URL PARAMETERS:
 * - id: MongoDB ObjectId of car profile to update
 * 
 * REQUEST BODY: Any combination of car profile fields to update
 * - licensePlate, customerName, customerPhone, customerEmail
 * - make, model, year, color, vin
 * 
 * RECEPTIONIST USE: Edit customer contact info, fix data entry errors, 
 * update vehicle details, modify license plate for renewals
 */
router.put('/:id', authorize(['owner', 'receptionist']), updateCar);

// ============================================================================
// DELETE OPERATIONS - CAR PROFILE REMOVAL (DELETE REQUESTS)
// ============================================================================

/**
 * DELETE /cars/:id - PERMANENTLY DELETE CAR PROFILE (Receptionist Dashboard Remove Car)
 * 
 * Permanently removes a car profile from the database.
 * DESTRUCTIVE operation that should be used with caution.
 * 
 * ACCESS CONTROL: Same as update operations
 * - Owners: Can delete any car profile
 * - Receptionists: Can delete car profiles (with owner approval typically)
 * - Customers: NO DELETE ACCESS 
 * - Mechanics: NO DELETE ACCESS
 * 
 * IMPORTANT CONSIDERATIONS:
 * - This is a PERMANENT deletion - car profile cannot be recovered
 * - May affect associated records (job sheets, repair history, appointments)
 * - Should typically require confirmation dialog in frontend
 * - Consider archiving instead of deletion for audit trail
 * 
 * URL PARAMETERS:
 * - id: MongoDB ObjectId of car profile to delete
 * 
 * RECEPTIONIST USE: Remove duplicate profiles, clean up incorrect entries,
 * delete at customer request, maintain database integrity
 * 
 * RESPONSE: Confirmation message only (no car data returned for security)
 */
router.delete('/:id', authorize(['owner', 'receptionist']), deleteCar);

export default router;
