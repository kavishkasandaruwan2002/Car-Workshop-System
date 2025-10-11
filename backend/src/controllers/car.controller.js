import { Car } from '../models/Car.js';
import { StatusCodes } from 'http-status-codes';
import { mapArrayId, mapId } from '../middleware/transformResponse.js';

/**
 * ============================================================================
 * CAR CONTROLLER - RECEPTIONIST DASHBOARD CAR PROFILE CRUD OPERATIONS
 * ============================================================================
 * 
 * This controller handles all car profile management operations for the 
 * receptionist dashboard. Receptionists use these endpoints to manage customer
 * vehicle information, search car profiles, and maintain repair history records.
 * 
 * Access Control: 
 * - READ operations: Available to all authenticated users (owner, receptionist, customer, mechanic)
 * - WRITE operations (CREATE/UPDATE/DELETE): Limited to owner and receptionist only
 * 
 * Database Model: Car collection stores vehicle and customer information
 */

/**
 * LIST CARS - READ OPERATION (Receptionist Dashboard Car Profile Management)
 * ============================================================================
 * 
 * Retrieves paginated list of car profiles with search functionality.
 * This is the primary endpoint used by the receptionist dashboard to display
 * all customer vehicles in a searchable, paginated table/grid format.
 * 
 
 * - View all customer car profiles in the dashboard
 * - Search for specific vehicles by license plate, customer info, or car details
 * - Navigate through multiple pages of car records
 * - Quick lookup during customer service calls or walk-ins
 * 
 * @param {Object} req 
 * @param {string} req.query.page - Page number for pagination (default: 1)
 * @param {string} req.query.limit - Records per page (default: 10)
 * @param {string} req.query.search - Search term for filtering cars
 * @param {Object} res - Express response object
 * @param {Function} next - Express error handling middleware
 * 
 * SEARCH FUNCTIONALITY:
 * - License plate search (case-insensitive)
 * - Customer name search (case-insensitive) 
 * - Customer phone number search
 * - Vehicle make search (case-insensitive)
 * - Vehicle model search (case-insensitive)
 * 
 * RESPONSE FORMAT:
 * - success: Boolean indicating operation success
 * - data: Array of car objects with transformed IDs
 * - page: Current page number
 * - limit: Records per page
 * - total: Total number of matching records
 */
export async function listCars(req, res, next) {
  try {
    // Extract pagination and search parameters from query string
    // Used by receptionist dashboard for browsing car profiles
    const { page = 1, limit = 10, search = '' } = req.query;
    
    // Build search query for multiple fields if search term provided
    // Enables receptionist to quickly find cars by various criteria
    const query = search ? {
      $or: [
        { licensePlate: { $regex: search, $options: 'i' } },    // Search by license plate
        { customerName: { $regex: search, $options: 'i' } },    // Search by customer name
        { customerPhone: { $regex: search, $options: 'i' } },   // Search by phone number
        { make: { $regex: search, $options: 'i' } },            // Search by car make
        { model: { $regex: search, $options: 'i' } }            // Search by car model
      ]
    } : {};
    
    // Execute paginated database query with search filters
    // Results sorted by creation date (newest first) for recent entries visibility
    const results = await Car.find(query)
      .skip((Number(page) - 1) * Number(limit))     // Skip records for pagination
      .limit(Number(limit))                         // Limit records per page
      .sort({ createdAt: -1 });                     // Sort by newest first
    
    // Get total count for pagination controls in receptionist dashboard
    const total = await Car.countDocuments(query);
    
    // Transform MongoDB _id to id and send paginated response
    // Frontend expects 'id' field instead of MongoDB's '_id'
    res.json({ 
      success: true, 
      data: mapArrayId(results),          // Transform _id to id for all records
      page: Number(page), 
      limit: Number(limit), 
      total 
    });
  } catch (err) { 
    // Pass any errors to error handling middleware
    next(err); 
  }
}

/**
 * GET SINGLE CAR - READ OPERATION (Receptionist Dashboard Car Profile Details)
 * ============================================================================
 * 
 * Retrieves detailed information for a specific car profile by ID.
 * Used by receptionist dashboard when viewing individual car details,
 * editing car information, or accessing full customer/vehicle data.
 * 
 * RECEPTIONIST USE CASES:
 * - View complete car profile details before editing
 * - Access customer information during service appointments
 * - Retrieve vehicle specifications for repair estimates
 * - Display car details in modal dialogs or detail pages
 * 
 * @param {Object} req - Express request object  
 * @param {string} req.params.id - Car profile ID from URL parameter
 * @param {Object} res - Express response object
 * @param {Function} next - Express error handling middleware
 * 
 * RESPONSE FORMAT:
 * - success: Boolean indicating operation success
 * - data: Single car object with all profile information
 * 
 * ERROR HANDLING:
 * - Returns 404 if car ID not found in database
 * - Passes database errors to error handling middleware
 */
export async function getCar(req, res, next) {
  try {
    // Find car by ID from URL parameter (/cars/:id)
    // Used when receptionist clicks on specific car profile
    const car = await Car.findById(req.params.id);
    
    // Return 404 error if car profile doesn't exist
    // Important for receptionist dashboard error handling
    if (!car) return res.status(StatusCodes.NOT_FOUND).json({ 
      success: false, 
      message: 'Car profile not found' 
    });
    
    // Transform MongoDB _id to id and return car data
    // Ensures consistent ID format for frontend consumption
    res.json({ success: true, data: mapId(car) });
  } catch (err) { 
    // Pass database or validation errors to error middleware
    next(err); 
  }
}

/**
 * CREATE CAR - CREATE OPERATION (Receptionist Dashboard New Car Profile)
 * ============================================================================
 * 
 * Creates a new car profile with customer and vehicle information.
 * Primary function for receptionists to register new customer vehicles
 * in the system when they visit the garage for the first time.
 * 
 * RECEPTIONIST USE CASES:
 * - Register new customer vehicles during first visit
 * - Add customer contact information for future communication
 * - Record vehicle specifications for service planning
 * - Create profiles for walk-in customers or phone appointments
 * - Build customer database for repeat business tracking
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Car profile data from frontend form
 * @param {string} req.body.licensePlate - Vehicle license plate (required)
 * @param {string} req.body.customerName - Customer full name (required)
 * @param {string} req.body.customerPhone - Customer phone number (required)
 * @param {string} req.body.customerEmail - Customer email (optional)
 * @param {string} req.body.make - Vehicle manufacturer (required)
 * @param {string} req.body.model - Vehicle model (required)
 * @param {number} req.body.year - Vehicle year (required)
 * @param {string} req.body.color - Vehicle color (optional)
 * @param {string} req.body.vin - Vehicle identification number (optional)
 * @param {Object} res - Express response object
 * @param {Function} next - Express error handling middleware
 * 
 * VALIDATION (handled by routes middleware):
 * - License plate minimum 2 characters
 * - Customer name minimum 2 characters  
 * - Customer phone minimum 3 characters
 * - Email format validation if provided
 * - Year must be between 1900-2100
 * - Make and model cannot be empty
 * 
 * RESPONSE FORMAT:
 * - success: Boolean indicating operation success
 * - data: Created car object with generated ID
 * - HTTP Status: 201 Created
 */
export async function createCar(req, res, next) {
  try {
    // Create new car profile from validated request body
    // All validation handled by express-validator middleware in routes
    const car = await Car.create(req.body);
    
    // Return created car with 201 status code
    // Transform MongoDB _id to id for frontend consistency
    res.status(StatusCodes.CREATED).json({ 
      success: true, 
      data: mapId(car) 
    });
  } catch (err) { 
    // Handle database errors (duplicates, validation failures, etc.)
    // Common errors: duplicate license plate, missing required fields
    next(err); 
  }
}

/**
 * UPDATE CAR - UPDATE OPERATION (Receptionist Dashboard Car Profile Editing)
 * ============================================================================
 * 
 * Updates existing car profile information with new data.
 * Allows receptionists to modify customer contact details, update vehicle
 * information, or correct any previously entered data errors.
 * 
 * RECEPTIONIST USE CASES:
 * - Update customer phone numbers or email addresses
 * - Correct vehicle information (color, VIN, etc.)
 * - Modify customer names due to name changes or corrections
 * - Update license plate information for renewals
 * - Fix data entry errors from initial car profile creation
 * 
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Car profile ID to update
 * @param {Object} req.body - Updated car profile data (partial or complete)
 * @param {Object} res - Express response object
 * @param {Function} next - Express error handling middleware
 * 
 * UPDATE BEHAVIOR:
 * - Partial updates supported (only changed fields need to be provided)
 * - MongoDB findByIdAndUpdate with {new: true} returns updated document
 * - Maintains existing data for fields not included in request body
 * - Automatically updates 'updatedAt' timestamp
 * 
 * RESPONSE FORMAT:
 * - success: Boolean indicating operation success
 * - data: Updated car object with all current information
 * 
 * ERROR HANDLING:
 * - Returns 404 if car ID not found
 * - Handles validation errors from database constraints
 * - Manages duplicate license plate scenarios
 */
export async function updateCar(req, res, next) {
  try {
    // Update car profile with new data and return updated document
    // {new: true} ensures we get the updated version, not the original
    const car = await Car.findByIdAndUpdate(
      req.params.id,        // Car ID from URL parameter
      req.body,             // Updated field values from request
      { new: true }         // Return updated document instead of original
    );
    
    // Return 404 if car profile doesn't exist
    // Prevents updating non-existent records
    if (!car) return res.status(StatusCodes.NOT_FOUND).json({ 
      success: false, 
      message: 'Car profile not found for update' 
    });
    
    // Return updated car profile data
    // Transform _id to id for frontend consistency
    res.json({ success: true, data: mapId(car) });
  } catch (err) { 
    // Handle update errors (validation failures, duplicates, etc.)
    // Common errors: duplicate license plate, invalid field values
    next(err); 
  }
}

export async function deleteCar(req, res, next) {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
}


