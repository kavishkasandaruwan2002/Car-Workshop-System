import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { listJobs, getJob, createJob, updateJob, deleteJob } from '../controllers/job.controller.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);

// ============================================================================
// READ OPERATIONS - JOB SHEET RETRIEVAL (GET REQUESTS)
// ============================================================================

/**
 * GET /jobs - LIST ALL JOB SHEETS (JobSheets Page)
 * 
 * Retrieves paginated list of job sheets with filtering options.
 * Used by owners, receptionists, mechanics, and customers to view job sheets.
 * 
 * ACCESS CONTROL: All authenticated users can view job sheets
 * - Owners: Can view all job sheets
 * - Receptionists: Can view all job sheets for management
 * - Mechanics: Can view assigned job sheets
 * - Customers: Can view job sheets for their own cars only
 * 
 * QUERY PARAMETERS:
 * - page: Page number for pagination (default: 1)
 * - limit: Number of items per page (default: 10)
 * - status: Filter by job status (pending, in_progress, completed)
 * 
 * RESPONSE: Paginated list of job sheets with car and appointment details
 */
router.get('/', authorize(['owner', 'receptionist', 'mechanic', 'customer']), listJobs);

/**
 * GET /jobs/:id - GET SINGLE JOB SHEET (JobSheets Page Details)
 * 
 * Retrieves detailed information for a specific job sheet.
 * Used for viewing job details and editing job information.
 * 
 * ACCESS CONTROL: All authenticated users can view job details
 * - Customers: Can only view job sheets for their own cars
 * - Other roles: Can view any job sheet
 * 
 * URL PARAMETERS:
 * - id: MongoDB ObjectId of the job sheet
 * 
 * RESPONSE: Complete job sheet data with populated car and appointment details
 */
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid job ID format')
], validate, authorize(['owner', 'receptionist', 'mechanic', 'customer']), getJob);

// ============================================================================
// CREATE OPERATIONS - JOB SHEET CREATION (POST REQUESTS)
// ============================================================================

/**
 * POST /jobs - CREATE NEW JOB SHEET (JobSheets Page Add New)
 * 
 * Creates a new job sheet with comprehensive validation.
 * Primary endpoint for creating job sheets from appointments or manually.
 * 
 * ACCESS CONTROL: Limited to users who can create job sheets
 * - Owners: Can create any job sheet
 * - Receptionists: Can create job sheets for customer service
 * - Mechanics: NO CREATE ACCESS (assigned via other roles)
 * - Customers: NO CREATE ACCESS (must request through receptionist)
 * 
 * VALIDATION RULES (processed before controller):
 * - car: MongoDB ObjectId, must reference existing car (optional)
 * - appointment: MongoDB ObjectId, must reference existing appointment (optional)
 * - assignedMechanic: String, 2-50 characters, alphanumeric with spaces (optional)
 * - tasks: Array of task objects (optional)
 * - tasks[].description: String, 1-500 characters, required for each task
 * - tasks[].completed: Boolean, default false (optional)
 * - estimatedCompletion: ISO8601 date, must be future date (optional)
 * 
 * MIDDLEWARE CHAIN:
 * 1. authorize() - Check user role permissions
 * 2. [validation array] - Validate input fields
 * 3. validate - Process validation results and return errors
 * 4. createJob - Execute controller function if validation passes
 * 
 * RECEPTIONIST USE: Create job sheets from appointments or manual entry
 */
router.post('/', authorize(['owner', 'receptionist']), [
  // Car validation - must be valid MongoDB ObjectId if provided
  body('car')
    .optional()
    .isMongoId()
    .withMessage('Car ID must be a valid MongoDB ObjectId'),
  
  // Appointment validation - must be valid MongoDB ObjectId if provided
  body('appointment')
    .optional()
    .isMongoId()
    .withMessage('Appointment ID must be a valid MongoDB ObjectId'),
  
  // Assigned mechanic validation - proper name format
  body('assignedMechanic')
    .optional()
    .isString()
    .withMessage('Assigned mechanic must be a string')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Assigned mechanic must be 2-50 characters')
    .matches(/^[a-zA-Z\s\-'\.]+$/)
    .withMessage('Assigned mechanic can only contain letters, spaces, hyphens, apostrophes, and periods'),
  
  // Tasks array validation
  body('tasks')
    .optional()
    .isArray({ min: 0, max: 20 })
    .withMessage('Tasks must be an array with 0-20 items'),
  
  // Individual task validation
  body('tasks.*.description')
    .optional()
    .isString()
    .withMessage('Task description must be a string')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Task description must be 1-500 characters')
    .matches(/^[a-zA-Z0-9\s\-.,!?()&@#$%^+=:;'"<>[\]{}|\\/`~]*$/)
    .withMessage('Task description contains invalid characters'),
  
  body('tasks.*.completed')
    .optional()
    .isBoolean()
    .withMessage('Task completed status must be true or false'),
  
  // Estimated completion date validation
  body('estimatedCompletion')
    .optional()
    .isISO8601()
    .withMessage('Estimated completion must be a valid ISO8601 date')
    .custom((value) => {
      if (value) {
        const date = new Date(value);
        const now = new Date();
        // Allow dates up to 1 year in the future
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(now.getFullYear() + 1);
        
        if (date <= now) {
          throw new Error('Estimated completion date must be in the future');
        }
        if (date > oneYearFromNow) {
          throw new Error('Estimated completion date cannot be more than 1 year in the future');
        }
      }
      return true;
    })
], validate, createJob);

// ============================================================================
// UPDATE OPERATIONS - JOB SHEET MODIFICATION (PUT REQUESTS)
// ============================================================================

/**
 * PUT /jobs/:id - UPDATE EXISTING JOB SHEET (JobSheets Page Edit)
 * 
 * Updates existing job sheet information with new data.
 * Used by owners, receptionists, and mechanics to modify job details.
 * 
 * ACCESS CONTROL: Limited to users who can modify job sheets
 * - Owners: Can update any job sheet
 * - Receptionists: Can update job sheets for customer service
 * - Mechanics: Can update assigned job sheets (status and tasks)
 * - Customers: NO UPDATE ACCESS (must request changes through staff)
 * 
 * UPDATE BEHAVIOR:
 * - Supports partial updates (only changed fields need to be sent)
 * - Maintains existing data for fields not included in request
 * - Validates all provided fields according to creation rules
 * - Returns updated job sheet data after successful modification
 * 
 * URL PARAMETERS:
 * - id: MongoDB ObjectId of job sheet to update
 * 
 * REQUEST BODY: Any combination of job sheet fields to update
 * - car, assignedMechanic, tasks, estimatedCompletion, status
 * 
 * MECHANIC USE: Update task completion status and job progress
 * RECEPTIONIST USE: Edit job details, reassign mechanics, update completion dates
 */
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid job ID format'),
  
  // Car validation - must be valid MongoDB ObjectId if provided
  body('car')
    .optional()
    .isMongoId()
    .withMessage('Car ID must be a valid MongoDB ObjectId'),
  
  // Assigned mechanic validation - proper name format
  body('assignedMechanic')
    .optional()
    .isString()
    .withMessage('Assigned mechanic must be a string')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Assigned mechanic must be 2-50 characters')
    .matches(/^[a-zA-Z\s\-'\.]+$/)
    .withMessage('Assigned mechanic can only contain letters, spaces, hyphens, apostrophes, and periods'),
  
  // Tasks array validation
  body('tasks')
    .optional()
    .isArray({ min: 0, max: 20 })
    .withMessage('Tasks must be an array with 0-20 items'),
  
  // Individual task validation
  body('tasks.*.description')
    .optional()
    .isString()
    .withMessage('Task description must be a string')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Task description must be 1-500 characters')
    .matches(/^[a-zA-Z0-9\s\-.,!?()&@#$%^+=:;'"<>[\]{}|\\/`~]*$/)
    .withMessage('Task description contains invalid characters'),
  
  body('tasks.*.completed')
    .optional()
    .isBoolean()
    .withMessage('Task completed status must be true or false'),
  
  // Estimated completion date validation
  body('estimatedCompletion')
    .optional()
    .isISO8601()
    .withMessage('Estimated completion must be a valid ISO8601 date')
    .custom((value) => {
      if (value) {
        const date = new Date(value);
        const now = new Date();
        // Allow dates up to 1 year in the future
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(now.getFullYear() + 1);
        
        if (date <= now) {
          throw new Error('Estimated completion date must be in the future');
        }
        if (date > oneYearFromNow) {
          throw new Error('Estimated completion date cannot be more than 1 year in the future');
        }
      }
      return true;
    }),
  
  // Status validation - must be one of the allowed enum values
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed'])
    .withMessage('Status must be one of: pending, in_progress, completed')
], validate, authorize(['owner', 'receptionist', 'mechanic']), updateJob);

// ============================================================================
// DELETE OPERATIONS - JOB SHEET REMOVAL (DELETE REQUESTS)
// ============================================================================

/**
 * DELETE /jobs/:id - DELETE JOB SHEET (JobSheets Page Delete)
 * 
 * Permanently removes a job sheet from the system.
 * Used by owners and receptionists to clean up completed or cancelled jobs.
 * 
 * ACCESS CONTROL: Limited to administrative users
 * - Owners: Can delete any job sheet
 * - Receptionists: Can delete job sheets for cleanup
 * - Mechanics: NO DELETE ACCESS (read-only for assigned jobs)
 * - Customers: NO DELETE ACCESS (must request through staff)
 * 
 * URL PARAMETERS:
 * - id: MongoDB ObjectId of job sheet to delete
 * 
 * RESPONSE: Success confirmation message
 * 
 * ADMINISTRATIVE USE: Remove completed jobs, clean up test data, 
 * handle customer cancellation requests
 */
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid job ID format')
], validate, authorize(['owner', 'receptionist']), deleteJob);

export default router;


