/**
 * API CLIENT - HTTP COMMUNICATION WITH BACKEND
 * 
 * This module handles all HTTP communication between the frontend and backend.
 * It provides a centralized way to make API requests with authentication and error handling.
 * 
 * Key Features:
 * - Automatic JWT token attachment for authenticated requests
 * - Centralized error handling with customizable error handlers
 * - JSON request/response processing
 * - Support for all HTTP methods (GET, POST, PUT, DELETE)
 * 
 * INVENTORY USAGE EXAMPLES:
 * - apiRequest('/inventory') - Get all inventory items
 * - apiRequest('/inventory', { method: 'POST', body: newItem }) - Create item
 * - apiRequest('/inventory/123', { method: 'PUT', body: updates }) - Update item
 * - apiRequest('/inventory/123', { method: 'DELETE' }) - Delete item
 */

// Base API URL - configurable via environment variable
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

/**
 * AUTHENTICATION TOKEN RETRIEVAL
 * 
 * Retrieves JWT token from localStorage for API authentication.
 * Supports multiple storage formats for backwards compatibility.
 * 
 * @returns {string|null} JWT token or null if not found/invalid
 */
function getAuthToken() {
  try {
    // Try direct token storage first
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    // Return direct token or extract from user object
    return token || (user ? JSON.parse(user)?.token : null);
  } catch {
    // Return null if localStorage is unavailable or parsing fails
    return null;
  }
}

// Global error handler - can be customized by consuming modules
let onErrorHandler = null;

/**
 * SET CUSTOM ERROR HANDLER
 * 
 * Allows modules to register custom error handling (e.g., showing toast notifications).
 * Used by inventory components to handle API errors gracefully.
 * 
 * @param {Function} handler - Error handling function
 */
export function setApiErrorHandler(handler) {
  onErrorHandler = handler;
}
/**
 * MAIN API REQUEST FUNCTION - INVENTORY COMMUNICATION HUB
 * 
 * Makes authenticated HTTP requests to the backend API.
 * Used extensively by inventory management for all CRUD operations.
 * 
 * INVENTORY USAGE EXAMPLES:
 * 
 * // Get all inventory items (with search/pagination)
 * const items = await apiRequest('/inventory?search=brake&page=1&limit=10');
 * 
 * // Get specific inventory item
 * const item = await apiRequest('/inventory/64f7a2b8...');
 * 
 * // Create new inventory item
 * const newItem = await apiRequest('/inventory', {
 *   method: 'POST',
 *   body: { name: 'Brake Pads', category: 'Brake System', quantity: 10, price: 45.99 }
 * });
 * 
 * // Update existing inventory item
 * const updated = await apiRequest('/inventory/64f7a2b8...', {
 *   method: 'PUT', 
 *   body: { quantity: 15 }
 * });
 * 
 * // Delete inventory item
 * await apiRequest('/inventory/64f7a2b8...', { method: 'DELETE' });
 */
export async function apiRequest(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getAuthToken(); // Get JWT from localStorage
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),// Send token with request
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'omit'
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : null;
  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    try { if (onErrorHandler) onErrorHandler(error); } catch {}
    throw error;
  }
  return data;
}

export { API_BASE };


