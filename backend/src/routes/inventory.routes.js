/**
 * INVENTORY ROUTES - API ENDPOINTS WITH ROLE-BASED ACCESS CONTROL
 * 
 * This file defines all HTTP endpoints for inventory management operations.
 * Each route includes authentication requirements and role-based authorization.
 * Input validation is applied using express-validator middleware.
 * 
 * Access Control:
 * - View operations: owner, receptionist, mechanic
 * - Create/Edit operations: owner, receptionist  
 * - Delete operations: owner only
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { 
  listInventory, 
  getInventoryItem, 
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  getLowStockItems,
  getReorderSuggestions,
  getInventoryAnalytics,
  reduceStock,
  bulkReduceStock,
  getStockMovements
} from '../controllers/inventory.controller.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// ============================================================================
// GLOBAL MIDDLEWARE - APPLIED TO ALL ROUTES
// ============================================================================

// Require authentication for ALL inventory operations
router.use(authenticate);

// ============================================================================
// READ OPERATIONS - VIEWING INVENTORY DATA
// ============================================================================

// GET /inventory - List all inventory items with pagination and search
// Access: owner, receptionist, mechanic (all can view)
// Query params: ?page=1&limit=10&search=brake
router.get('/', authorize(['owner', 'receptionist', 'mechanic']), listInventory);

// GET /inventory/analytics - Get comprehensive inventory analytics
// Access: owner, receptionist (managers need analytics)
router.get('/analytics', authorize(['owner', 'receptionist']), getInventoryAnalytics);

// GET /inventory/low-stock - Get low stock items
// Access: owner, receptionist, mechanic (all need to see alerts)
router.get('/low-stock', authorize(['owner', 'receptionist', 'mechanic']), getLowStockItems);

// GET /inventory/reorder-suggestions - Get intelligent reorder suggestions
// Access: owner, receptionist (procurement decisions)
router.get('/reorder-suggestions', authorize(['owner', 'receptionist']), getReorderSuggestions);

// PUT /inventory/:id/reduce - Reduce stock for a specific item
// Access: owner, receptionist (inventory management)
router.put('/:id/reduce', authorize(['owner', 'receptionist']), [
  body('quantity').isNumeric().isFloat({ min: 0.01 }),
  body('reason').optional().isString(),
  body('jobId').optional().isString(),
  body('notes').optional().isString()
], validate, reduceStock);

// POST /inventory/bulk-reduce - Reduce stock for multiple items
// Access: owner, receptionist (bulk operations)
router.post('/bulk-reduce', authorize(['owner', 'receptionist']), [
  body('items').isArray({ min: 1 }),
  body('items.*.itemId').isString(),
  body('items.*.quantity').isNumeric().isFloat({ min: 0.01 }),
  body('items.*.reason').optional().isString(),
  body('jobId').optional().isString(),
  body('reason').optional().isString(),
  body('notes').optional().isString()
], validate, bulkReduceStock);

// GET /inventory/:id/movements - Get stock movement history
// Access: owner, receptionist (audit trail)
router.get('/:id/movements', authorize(['owner', 'receptionist']), getStockMovements);

// GET /inventory/:id - Get specific inventory item details  
// Access: owner, receptionist, mechanic (all can view)
router.get('/:id', authorize(['owner', 'receptionist', 'mechanic']), getInventoryItem);

// ============================================================================
// CREATE OPERATIONS - ADDING NEW INVENTORY ITEMS
// ============================================================================

// POST /inventory - Create new inventory item
// Access: owner, receptionist only (mechanics cannot add items)
// Requires validation of all required fields
router.post('/', authorize(['owner', 'receptionist']), [
  // VALIDATION RULES - All fields are required for new items
  body('name').isString().isLength({ min: 1 }),           // Item name (required, non-empty string)
  body('category').isString().isLength({ min: 1 }),       // Category (required, non-empty string)
  body('supplier').isString().isLength({ min: 1 }),       // Supplier (required, non-empty string)
  body('quantity').isNumeric(),                           // Current quantity (required, numeric)
  body('price').isNumeric(),                              // Unit price (required, numeric)
  body('minThreshold').isNumeric()                        // Alert threshold (required, numeric)
], validate, createInventoryItem);

// ============================================================================
// UPDATE OPERATIONS - MODIFYING EXISTING INVENTORY ITEMS
// ============================================================================

// PUT /inventory/:id - Update existing inventory item
// Access: owner, receptionist only (mechanics cannot modify)
// Supports partial updates - all fields are optional
router.put('/:id', authorize(['owner', 'receptionist']), [
  // VALIDATION RULES - All fields optional for updates (.optional())
  body('name').optional().isString().isLength({ min: 1 }),        // Item name (optional)
  body('category').optional().isString().isLength({ min: 1 }),    // Category (optional)
  body('supplier').optional().isString().isLength({ min: 1 }),    // Supplier (optional)
  body('quantity').optional().isNumeric(),                        // Quantity (optional, numeric)
  body('price').optional().isNumeric(),                           // Price (optional, numeric)
  body('minThreshold').optional().isNumeric()                     // Threshold (optional, numeric)
], validate, updateInventoryItem);

// ============================================================================
// DELETE OPERATIONS - REMOVING INVENTORY ITEMS
// ============================================================================

// DELETE /inventory/:id - Permanently delete inventory item
// Access: owner only (highest security - only owners can delete)
// No validation needed for deletion (just ID from URL)
router.delete('/:id', authorize(['owner']), deleteInventoryItem);

export default router;