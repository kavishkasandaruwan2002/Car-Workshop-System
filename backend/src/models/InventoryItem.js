/**
 * INVENTORY ITEM MODEL - DATABASE SCHEMA DEFINITION
 * 
 * This model defines the data structure for inventory items in the garage management system.
 * It handles spare parts, automotive components, and consumables with stock tracking.
 * 
 * Features:
 * - Automatic timestamps (createdAt, updatedAt)
 * - Stock level monitoring with minThreshold alerts
 * - Unique SKU support for inventory tracking
 * - Price and quantity management for valuation
 * - Supplier information for procurement
 */

import mongoose from 'mongoose';

// Define the schema structure for inventory items
const inventoryItemSchema = new mongoose.Schema({
  // ============================================================================
  // BASIC ITEM INFORMATION
  // ============================================================================
  
  // Item name - required field for identification
  name: { 
    type: String, 
    required: true    // Must be provided (e.g., "Brake Pads", "Engine Oil") 
  },
  
  // Category classification for organization and filtering
  category: { 
    type: String, 
    default: ''       // Optional (e.g., "Engine", "Brake System", "Electrical")
  },
  
  // Supplier information for procurement tracking
  supplier: { 
    type: String, 
    default: ''       // Optional (e.g., "AutoParts Inc", "Bosch", "NGK")
  },
  
  // Enhanced supplier information for reordering
  supplierInfo: {
    contactName: { type: String, default: '' },      // Contact person name
    email: { type: String, default: '' },             // Supplier email
    phone: { type: String, default: '' },             // Supplier phone
    address: { type: String, default: '' },           // Supplier address
    website: { type: String, default: '' },          // Supplier website
    leadTime: { type: Number, default: 7 },           // Lead time in days
    minimumOrder: { type: Number, default: 0 },       // Minimum order quantity
    preferredSupplier: { type: Boolean, default: false } // Is this a preferred supplier
  },
  
  // Stock Keeping Unit - unique identifier for inventory tracking
  sku: { 
    type: String, 
    unique: true,     // Must be unique across all items
    sparse: true      // Allows multiple null/undefined values (optional field)
  },
  
  // ============================================================================
  // INVENTORY TRACKING FIELDS
  // ============================================================================
  
  // Current stock quantity - core inventory metric
  quantity: { 
    type: Number, 
    default: 0        // Default to 0 if not specified
  },
  
  // Unit price for cost calculation and valuation
  price: { 
    type: Number, 
    default: 0        // Default to 0 if not specified (in currency units)
  },
  
  // Minimum threshold for low stock alerts - CRITICAL for inventory monitoring
  minThreshold: { 
    type: Number, 
    default: 0        // Alert when quantity <= this value
  },
  
  // ============================================================================
  // TIMESTAMP TRACKING
  // ============================================================================
  
  // Manual timestamp for last inventory update
  lastUpdated: { 
    type: Date, 
    default: Date.now // Set to current time when created/updated
  }
}, { 
  // Mongoose options - automatic timestamp management
  timestamps: true    // Automatically adds createdAt and updatedAt fields
});

// Export the model for use in controllers and other modules
export const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);


