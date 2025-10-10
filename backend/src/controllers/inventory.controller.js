/**
 * INVENTORY CONTROLLER - BACKEND BUSINESS LOGIC
 * 
 * This controller handles all CRUD operations for inventory management.
 * It processes HTTP requests, validates data, interacts with the database,
 * and returns properly formatted responses.
 * 
 * All functions include error handling and data transformation for frontend consumption.
 */

import { InventoryItem } from '../models/InventoryItem.js';
import { StatusCodes } from 'http-status-codes';
import { mapArrayId, mapId } from '../middleware/transformResponse.js';

/**
 * LIST INVENTORY ITEMS - GET /inventory
 * 
 * Retrieves inventory items with pagination and search functionality.
 * Supports text search on item names (case-insensitive).
 * 
 * Query Parameters:
 * - page: Page number for pagination (default: 1)
 * - limit: Items per page (default: 10)  
 * - search: Text search in item names (optional)
 */
export async function listInventory(req, res, next) {
  try {
    // Extract query parameters with defaults
    const { page = 1, limit = 10, search = '' } = req.query;
    
    // Build search query - if search term provided, create regex for case-insensitive search
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    
    // Execute database query with pagination and sorting
    const results = await InventoryItem.find(query)
      .skip((Number(page) - 1) * Number(limit))    // Skip items for pagination
      .limit(Number(limit))                        // Limit results per page
      .sort({ createdAt: -1 });                    // Sort by creation date (newest first)
    
    // Get total count for pagination metadata
    const total = await InventoryItem.countDocuments(query);
    
    // Return paginated response with transformed data (_id -> id)
    res.json({ success: true, data: mapArrayId(results), page: Number(page), limit: Number(limit), total });
  } catch (err) { next(err); }  // Pass error to error handling middleware
}

/**
 * GET SINGLE INVENTORY ITEM - GET /inventory/:id
 * 
 * Retrieves a specific inventory item by its ID.
 * Returns 404 if item not found.
 */
export async function getInventoryItem(req, res, next) {
  try {
    // Find item by ID from URL parameters
    const item = await InventoryItem.findById(req.params.id);
    
    // Return 404 if item doesn't exist
    if (!item) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Not found' });
    
    // Return item with transformed ID
    res.json({ success: true, data: mapId(item) });
  } catch (err) { next(err); }
}

/**
 * CREATE NEW INVENTORY ITEM - POST /inventory
 * 
 * Creates a new inventory item with validated data.
 * Converts string inputs to proper numeric types and adds timestamp.
 * 
 * Required fields: name, category, supplier, quantity, price, minThreshold
 */
export async function createInventoryItem(req, res, next) {
  try {
    // Copy request body to avoid mutating original
    const body = { ...req.body };
    
    // DATA TYPE CONVERSION - Convert string inputs to numbers
    body.quantity = Number(body.quantity || 0);        // Current stock quantity
    body.price = Number(body.price || 0);              // Unit price
    body.minThreshold = Number(body.minThreshold || 0); // Minimum stock alert level
    body.lastUpdated = new Date();                     // Set current timestamp
    
    // Save to database
    const item = await InventoryItem.create(body);
    
    // Return created item with 201 status and transformed ID
    res.status(StatusCodes.CREATED).json({ success: true, data: mapId(item) });
  } catch (err) { next(err); }
}

/**
 * UPDATE EXISTING INVENTORY ITEM - PUT /inventory/:id
 * 
 * Updates an existing inventory item with new data.
 * Only updates provided fields (partial update supported).
 * Handles numeric type conversion and timestamp updates.
 */
export async function updateInventoryItem(req, res, next) {
  try {
    // Copy request body to avoid mutating original
    const body = { ...req.body };
    
    // SELECTIVE TYPE CONVERSION - Only convert if field is provided
    if (body.quantity !== undefined) body.quantity = Number(body.quantity);
    if (body.price !== undefined) body.price = Number(body.price);
    if (body.minThreshold !== undefined) body.minThreshold = Number(body.minThreshold);
    body.lastUpdated = new Date();  // Always update timestamp on any change
    
    // Find and update item, return updated document
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, body, { new: true });
    
    // Return 404 if item doesn't exist
    if (!item) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Not found' });
    
    // Return updated item with transformed ID
    res.json({ success: true, data: mapId(item) });
  } catch (err) { next(err); }
}

/**
 * DELETE INVENTORY ITEM - DELETE /inventory/:id
 * 
 * Permanently deletes an inventory item from the database.
 * Only accessible by users with 'owner' role (enforced in routes).
 * Returns 404 if item doesn't exist.
 */
export async function deleteInventoryItem(req, res, next) {
  try {
    // Find and delete item in single operation
    const item = await InventoryItem.findByIdAndDelete(req.params.id);
    
    // Return 404 if item doesn't exist
    if (!item) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Not found' });
    
    // Return success confirmation
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
}

/**
 * GET LOW STOCK ITEMS - GET /inventory/low-stock
 * 
 * Retrieves all items that are at or below their minimum threshold.
 * Useful for generating alerts and reorder suggestions.
 * 
 * Query Parameters:
 * - critical: If true, only returns out-of-stock items (quantity = 0)
 * - limit: Maximum number of items to return (default: 50)
 */
export async function getLowStockItems(req, res, next) {
  try {
    const { critical = false, limit = 50 } = req.query;
    
    let query = {};
    
    if (critical) {
      // Only out of stock items (quantity = 0)
      query = { quantity: 0 };
    } else {
      // Low stock items (quantity <= minThreshold)
      query = { $expr: { $lte: ['$quantity', '$minThreshold'] } };
    }
    
    const items = await InventoryItem.find(query)
      .limit(Number(limit))
      .sort({ quantity: 1, name: 1 }); // Sort by quantity (lowest first), then by name
    
    // Add calculated fields for frontend
    const itemsWithStatus = items.map(item => {
      const itemObj = item.toObject();
      itemObj.stockStatus = itemObj.quantity === 0 ? 'out' : 'low';
      itemObj.needsReorder = true;
      itemObj.suggestedReorderQty = Math.max(itemObj.minThreshold * 2, 10);
      return itemObj;
    });
    
    res.json({ 
      success: true, 
      data: mapArrayId(itemsWithStatus),
      count: itemsWithStatus.length,
      critical: critical === 'true'
    });
  } catch (err) { next(err); }
}

/**
 * GET REORDER SUGGESTIONS - GET /inventory/reorder-suggestions
 * 
 * Generates intelligent reorder suggestions based on current stock levels,
 * minimum thresholds, and usage patterns.
 * 
 * Query Parameters:
 * - minValue: Minimum total value for suggestions (default: 0)
 * - maxItems: Maximum number of suggestions (default: 20)
 */
export async function getReorderSuggestions(req, res, next) {
  try {
    const { minValue = 0, maxItems = 20 } = req.query;
    
    // Find items that need reordering (low stock or out of stock)
    const items = await InventoryItem.find({
      $expr: { $lte: ['$quantity', '$minThreshold'] }
    }).sort({ quantity: 1, name: 1 });
    
    // Generate reorder suggestions with intelligent quantities
    const suggestions = items.map(item => {
      const itemObj = item.toObject();
      
      // Calculate suggested reorder quantity
      let suggestedQty = 0;
      if (itemObj.quantity === 0) {
        // Critical: out of stock - suggest 3x minimum threshold
        suggestedQty = Math.max(itemObj.minThreshold * 3, 20);
      } else if (itemObj.quantity <= itemObj.minThreshold) {
        // Low stock - suggest 2x minimum threshold
        suggestedQty = Math.max(itemObj.minThreshold * 2, 10);
      }
      
      const totalCost = suggestedQty * itemObj.price;
      
      return {
        ...mapId(itemObj),
        suggestedReorderQty: suggestedQty,
        estimatedCost: totalCost,
        priority: itemObj.quantity === 0 ? 'critical' : 'high',
        stockStatus: itemObj.quantity === 0 ? 'out' : 'low'
      };
    });
    
    // Filter by minimum value if specified
    const filteredSuggestions = suggestions.filter(s => s.estimatedCost >= Number(minValue));
    
    // Sort by priority (critical first) and cost (highest first)
    const sortedSuggestions = filteredSuggestions
      .sort((a, b) => {
        if (a.priority === 'critical' && b.priority !== 'critical') return -1;
        if (b.priority === 'critical' && a.priority !== 'critical') return 1;
        return b.estimatedCost - a.estimatedCost;
      })
      .slice(0, Number(maxItems));
    
    const totalEstimatedCost = sortedSuggestions.reduce((sum, item) => sum + item.estimatedCost, 0);
    
    res.json({
      success: true,
      data: sortedSuggestions,
      summary: {
        totalItems: sortedSuggestions.length,
        totalEstimatedCost: totalEstimatedCost,
        criticalItems: sortedSuggestions.filter(s => s.priority === 'critical').length,
        lowStockItems: sortedSuggestions.filter(s => s.priority === 'high').length
      }
    });
  } catch (err) { next(err); }
}

/**
 * REDUCE STOCK QUANTITY - PUT /inventory/:id/reduce
 * 
 * Reduces stock quantity for a specific item.
 * This is used when parts are used in repairs, sold, or when inventory adjustments are needed.
 * 
 * Body Parameters:
 * - quantity: Number of items to reduce (required)
 * - reason: Reason for reduction (optional) - 'repair', 'sale', 'adjustment', 'damage', 'other'
 * - jobId: Associated job ID if used in repair (optional)
 * - notes: Additional notes (optional)
 */
export async function reduceStock(req, res, next) {
  try {
    const { quantity, reason = 'adjustment', jobId, notes } = req.body;
    
    // Validate required fields
    if (!quantity || quantity <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        success: false, 
        message: 'Quantity must be a positive number' 
      });
    }
    
    // Find the item
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }
    
    // Check if there's enough stock
    if (item.quantity < quantity) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        success: false, 
        message: `Insufficient stock. Available: ${item.quantity}, Requested: ${quantity}` 
      });
    }
    
    // Calculate new quantity
    const newQuantity = item.quantity - quantity;
    
    // Update the item
    const updatedItem = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      { 
        quantity: newQuantity,
        lastUpdated: new Date()
      },
      { new: true }
    );
    
    // Create stock movement record (optional - for audit trail)
    const stockMovement = {
      itemId: item._id,
      itemName: item.name,
      movementType: 'reduction',
      quantity: -quantity, // Negative for reduction
      reason: reason,
      jobId: jobId,
      notes: notes,
      previousQuantity: item.quantity,
      newQuantity: newQuantity,
      timestamp: new Date()
    };
    
    // Log the stock movement (you could save this to a separate collection)
    console.log('Stock Movement:', stockMovement);
    
    // Return updated item with stock status
    const itemWithStatus = {
      ...updatedItem.toObject(),
      stockStatus: newQuantity === 0 ? 'out' : newQuantity <= item.minThreshold ? 'low' : 'good',
      previousQuantity: item.quantity,
      reductionAmount: quantity,
      reason: reason
    };
    
    res.json({ 
      success: true, 
      data: mapId(itemWithStatus),
      message: `Stock reduced by ${quantity} units. New quantity: ${newQuantity}`,
      stockMovement: stockMovement
    });
  } catch (err) { 
    next(err); 
  }
}

/**
 * BULK STOCK REDUCTION - POST /inventory/bulk-reduce
 * 
 * Reduces stock for multiple items at once.
 * Useful for job completion or bulk adjustments.
 * 
 * Body Parameters:
 * - items: Array of { itemId, quantity, reason, jobId, notes }
 */
export async function bulkReduceStock(req, res, next) {
  try {
    const { items, jobId, reason = 'bulk_adjustment', notes } = req.body;
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        success: false, 
        message: 'Items array is required' 
      });
    }
    
    const results = [];
    const errors = [];
    
    // Process each item
    for (const itemData of items) {
      try {
        const { itemId, quantity, itemReason = reason, itemNotes = notes } = itemData;
        
        // Find the item
        const item = await InventoryItem.findById(itemId);
        if (!item) {
          errors.push({ itemId, error: 'Item not found' });
          continue;
        }
        
        // Check stock availability
        if (item.quantity < quantity) {
          errors.push({ 
            itemId, 
            itemName: item.name,
            error: `Insufficient stock. Available: ${item.quantity}, Requested: ${quantity}` 
          });
          continue;
        }
        
        // Reduce stock
        const newQuantity = item.quantity - quantity;
        const updatedItem = await InventoryItem.findByIdAndUpdate(
          itemId,
          { 
            quantity: newQuantity,
            lastUpdated: new Date()
          },
          { new: true }
        );
        
        results.push({
          itemId,
          itemName: item.name,
          previousQuantity: item.quantity,
          reductionAmount: quantity,
          newQuantity: newQuantity,
          stockStatus: newQuantity === 0 ? 'out' : newQuantity <= item.minThreshold ? 'low' : 'good',
          reason: itemReason
        });
        
      } catch (itemError) {
        errors.push({ 
          itemId: itemData.itemId, 
          error: itemError.message 
        });
      }
    }
    
    res.json({
      success: true,
      data: {
        processed: results.length,
        errors: errors.length,
        results: results,
        errors: errors
      },
      message: `Processed ${results.length} items successfully, ${errors.length} errors`
    });
  } catch (err) { 
    next(err); 
  }
}

/**
 * GET STOCK MOVEMENT HISTORY - GET /inventory/:id/movements
 * 
 * Retrieves stock movement history for a specific item.
 * This helps track when and why stock was reduced.
 */
export async function getStockMovements(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // In a real implementation, you'd have a StockMovement collection
    // For now, we'll return a placeholder response
    res.json({
      success: true,
      data: {
        itemId: req.params.id,
        movements: [],
        message: 'Stock movement tracking not yet implemented'
      }
    });
  } catch (err) { 
    next(err); 
  }
}

/**
 * GET INVENTORY ANALYTICS - GET /inventory/analytics
 * 
 * Provides comprehensive analytics about inventory levels, stock status,
 * and financial metrics for dashboard display.
 */
export async function getInventoryAnalytics(req, res, next) {
  try {
    // Get all inventory items
    const allItems = await InventoryItem.find({});
    
    // Calculate analytics
    const totalItems = allItems.length;
    const outOfStockItems = allItems.filter(item => item.quantity === 0);
    const lowStockItems = allItems.filter(item => 
      item.quantity > 0 && item.quantity <= item.minThreshold
    );
    const inStockItems = allItems.filter(item => item.quantity > item.minThreshold);
    
    // Financial calculations
    const totalInventoryValue = allItems.reduce((sum, item) => 
      sum + (item.quantity * item.price), 0
    );
    
    const lowStockValue = lowStockItems.reduce((sum, item) => 
      sum + (item.quantity * item.price), 0
    );
    
    const outOfStockValue = outOfStockItems.reduce((sum, item) => 
      sum + (item.minThreshold * item.price), 0
    );
    
    // Category breakdown
    const categoryBreakdown = {};
    allItems.forEach(item => {
      const category = item.category || 'Uncategorized';
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = {
          total: 0,
          lowStock: 0,
          outOfStock: 0,
          value: 0
        };
      }
      categoryBreakdown[category].total++;
      if (item.quantity === 0) categoryBreakdown[category].outOfStock++;
      else if (item.quantity <= item.minThreshold) categoryBreakdown[category].lowStock++;
      categoryBreakdown[category].value += item.quantity * item.price;
    });
    
    // Top suppliers by value
    const supplierBreakdown = {};
    allItems.forEach(item => {
      const supplier = item.supplier || 'Unknown';
      if (!supplierBreakdown[supplier]) {
        supplierBreakdown[supplier] = {
          totalItems: 0,
          totalValue: 0,
          lowStockItems: 0
        };
      }
      supplierBreakdown[supplier].totalItems++;
      supplierBreakdown[supplier].totalValue += item.quantity * item.price;
      if (item.quantity <= item.minThreshold) {
        supplierBreakdown[supplier].lowStockItems++;
      }
    });
    
    const topSuppliers = Object.entries(supplierBreakdown)
      .map(([supplier, data]) => ({ supplier, ...data }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalItems,
          outOfStock: outOfStockItems.length,
          lowStock: lowStockItems.length,
          inStock: inStockItems.length,
          totalValue: totalInventoryValue,
          lowStockValue,
          outOfStockValue
        },
        categoryBreakdown: Object.entries(categoryBreakdown).map(([category, data]) => ({
          category,
          ...data
        })),
        topSuppliers,
        stockLevels: {
          outOfStock: mapArrayId(outOfStockItems),
          lowStock: mapArrayId(lowStockItems)
        }
      }
    });
  } catch (err) { next(err); }
}


