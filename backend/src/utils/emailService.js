/**
 * EMAIL SERVICE - LOW STOCK NOTIFICATIONS
 * 
 * This service handles sending email notifications for low stock alerts.
 * It can be configured to send alerts to managers, owners, or procurement staff.
 * 
 * Features:
 * - Low stock email alerts
 * - Out of stock critical alerts
 * - Bulk reorder suggestions
 * - HTML formatted emails with inventory details
 */

import nodemailer from 'nodemailer';

// Email configuration - update with your SMTP settings
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
};

// Create email transporter
const transporter = nodemailer.createTransporter(emailConfig);

/**
 * Send low stock alert email
 * @param {Array} lowStockItems - Array of items with low stock
 * @param {Array} outOfStockItems - Array of items that are out of stock
 * @param {string} recipientEmail - Email address to send alert to
 */
export async function sendLowStockAlert(lowStockItems, outOfStockItems, recipientEmail) {
  try {
    const totalAlerts = lowStockItems.length + outOfStockItems.length;
    
    if (totalAlerts === 0) {
      console.log('No low stock items to alert about');
      return;
    }

    const htmlContent = generateLowStockEmailHTML(lowStockItems, outOfStockItems);
    
    const mailOptions = {
      from: `"Garage Management System" <${emailConfig.auth.user}>`,
      to: recipientEmail,
      subject: `🚨 Low Stock Alert: ${totalAlerts} items need attention`,
      html: htmlContent,
      text: generateLowStockEmailText(lowStockItems, outOfStockItems)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Low stock alert email sent:', result.messageId);
    return result;
    
  } catch (error) {
    console.error('Error sending low stock alert email:', error);
    throw error;
  }
}

/**
 * Generate HTML content for low stock email
 */
function generateLowStockEmailHTML(lowStockItems, outOfStockItems) {
  const currentDate = new Date().toLocaleDateString();
  
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .alert-section { margin: 20px 0; padding: 15px; border-radius: 8px; }
        .critical { background: #fee; border-left: 4px solid #dc3545; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; }
        .item-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        .item-table th, .item-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .item-table th { background: #f8f9fa; font-weight: bold; }
        .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .status-out { background: #dc3545; color: white; }
        .status-low { background: #ffc107; color: black; }
        .footer { margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🚨 Inventory Stock Alert</h1>
        <p><strong>Date:</strong> ${currentDate}</p>
        <p><strong>Total Items Needing Attention:</strong> ${lowStockItems.length + outOfStockItems.length}</p>
      </div>
  `;

  // Out of Stock Section (Critical)
  if (outOfStockItems.length > 0) {
    html += `
      <div class="alert-section critical">
        <h2>🔴 CRITICAL: Out of Stock Items (${outOfStockItems.length})</h2>
        <p>These items have zero stock and need immediate attention:</p>
        <table class="item-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th>Supplier</th>
              <th>Current Stock</th>
              <th>Min Threshold</th>
              <th>Unit Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    outOfStockItems.forEach(item => {
      html += `
        <tr>
          <td><strong>${item.name}</strong></td>
          <td>${item.category}</td>
          <td>${item.supplier}</td>
          <td>${item.quantity}</td>
          <td>${item.minThreshold}</td>
          <td>$${item.price.toFixed(2)}</td>
          <td><span class="status-badge status-out">OUT OF STOCK</span></td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
  }

  // Low Stock Section (Warning)
  if (lowStockItems.length > 0) {
    html += `
      <div class="alert-section warning">
        <h2>⚠️ WARNING: Low Stock Items (${lowStockItems.length})</h2>
        <p>These items are at or below their minimum threshold:</p>
        <table class="item-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th>Supplier</th>
              <th>Current Stock</th>
              <th>Min Threshold</th>
              <th>Unit Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    lowStockItems.forEach(item => {
      html += `
        <tr>
          <td><strong>${item.name}</strong></td>
          <td>${item.category}</td>
          <td>${item.supplier}</td>
          <td>${item.quantity}</td>
          <td>${item.minThreshold}</td>
          <td>$${item.price.toFixed(2)}</td>
          <td><span class="status-badge status-low">LOW STOCK</span></td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
  }

  // Footer with action items
  html += `
      <div class="footer">
        <h3>📋 Recommended Actions:</h3>
        <ul>
          <li>Review critical out-of-stock items and place urgent orders</li>
          <li>Check low stock items and plan reorders</li>
          <li>Contact suppliers for availability and delivery times</li>
          <li>Update minimum thresholds if needed based on usage patterns</li>
        </ul>
        <p><em>This alert was generated automatically by your Garage Management System.</em></p>
      </div>
    </body>
    </html>
  `;

  return html;
}

/**
 * Generate plain text version of low stock email
 */
function generateLowStockEmailText(lowStockItems, outOfStockItems) {
  let text = `INVENTORY STOCK ALERT\n`;
  text += `Date: ${new Date().toLocaleDateString()}\n`;
  text += `Total Items Needing Attention: ${lowStockItems.length + outOfStockItems.length}\n\n`;

  if (outOfStockItems.length > 0) {
    text += `CRITICAL: OUT OF STOCK ITEMS (${outOfStockItems.length})\n`;
    text += `==========================================\n`;
    outOfStockItems.forEach(item => {
      text += `• ${item.name} (${item.category}) - Supplier: ${item.supplier} - Price: $${item.price.toFixed(2)}\n`;
    });
    text += `\n`;
  }

  if (lowStockItems.length > 0) {
    text += `WARNING: LOW STOCK ITEMS (${lowStockItems.length})\n`;
    text += `==========================================\n`;
    lowStockItems.forEach(item => {
      text += `• ${item.name} (${item.category}) - Stock: ${item.quantity}/${item.minThreshold} - Supplier: ${item.supplier}\n`;
    });
    text += `\n`;
  }

  text += `Recommended Actions:\n`;
  text += `- Review critical out-of-stock items and place urgent orders\n`;
  text += `- Check low stock items and plan reorders\n`;
  text += `- Contact suppliers for availability and delivery times\n`;
  text += `- Update minimum thresholds if needed\n\n`;
  text += `This alert was generated automatically by your Garage Management System.`;

  return text;
}

/**
 * Send bulk reorder suggestion email
 * @param {Array} reorderItems - Items that need reordering
 * @param {string} recipientEmail - Email address to send to
 */
export async function sendReorderSuggestion(reorderItems, recipientEmail) {
  try {
    if (reorderItems.length === 0) {
      console.log('No items need reordering');
      return;
    }

    const htmlContent = generateReorderEmailHTML(reorderItems);
    
    const mailOptions = {
      from: `"Garage Management System" <${emailConfig.auth.user}>`,
      to: recipientEmail,
      subject: `📦 Reorder Suggestions: ${reorderItems.length} items`,
      html: htmlContent,
      text: generateReorderEmailText(reorderItems)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Reorder suggestion email sent:', result.messageId);
    return result;
    
  } catch (error) {
    console.error('Error sending reorder suggestion email:', error);
    throw error;
  }
}

/**
 * Generate HTML for reorder suggestion email
 */
function generateReorderEmailHTML(reorderItems) {
  const currentDate = new Date().toLocaleDateString();
  
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .suggestion-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .suggestion-table th, .suggestion-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .suggestion-table th { background: #f8f9fa; font-weight: bold; }
        .suggestion-table .quantity { text-align: center; }
        .suggestion-table .price { text-align: right; }
        .total-row { background: #f8f9fa; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📦 Reorder Suggestions</h1>
        <p><strong>Date:</strong> ${currentDate}</p>
        <p><strong>Items to Reorder:</strong> ${reorderItems.length}</p>
      </div>
      
      <h2>Suggested Reorder Quantities</h2>
      <table class="suggestion-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Category</th>
            <th>Supplier</th>
            <th>Current Stock</th>
            <th>Min Threshold</th>
            <th>Suggested Qty</th>
            <th>Unit Price</th>
            <th>Total Cost</th>
          </tr>
        </thead>
        <tbody>
  `;

  let totalCost = 0;
  
  reorderItems.forEach(item => {
    const suggestedQty = Math.max(item.minThreshold * 2, 10); // Suggest 2x threshold or minimum 10
    const itemTotal = suggestedQty * item.price;
    totalCost += itemTotal;
    
    html += `
      <tr>
        <td><strong>${item.name}</strong></td>
        <td>${item.category}</td>
        <td>${item.supplier}</td>
        <td class="quantity">${item.quantity}</td>
        <td class="quantity">${item.minThreshold}</td>
        <td class="quantity"><strong>${suggestedQty}</strong></td>
        <td class="price">$${item.price.toFixed(2)}</td>
        <td class="price">$${itemTotal.toFixed(2)}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="7"><strong>Total Estimated Cost:</strong></td>
            <td class="price"><strong>$${totalCost.toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>
      
      <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <h3>📋 Next Steps:</h3>
        <ul>
          <li>Review suggested quantities and adjust as needed</li>
          <li>Contact suppliers to confirm availability and pricing</li>
          <li>Place orders for critical items first</li>
          <li>Update inventory levels after receiving orders</li>
        </ul>
      </div>
    </body>
    </html>
  `;

  return html;
}

/**
 * Generate plain text for reorder suggestion email
 */
function generateReorderEmailText(reorderItems) {
  let text = `REORDER SUGGESTIONS\n`;
  text += `Date: ${new Date().toLocaleDateString()}\n`;
  text += `Items to Reorder: ${reorderItems.length}\n\n`;

  let totalCost = 0;
  
  reorderItems.forEach(item => {
    const suggestedQty = Math.max(item.minThreshold * 2, 10);
    const itemTotal = suggestedQty * item.price;
    totalCost += itemTotal;
    
    text += `• ${item.name} (${item.category})\n`;
    text += `  Current Stock: ${item.quantity} | Min Threshold: ${item.minThreshold}\n`;
    text += `  Suggested Qty: ${suggestedQty} | Unit Price: $${item.price.toFixed(2)}\n`;
    text += `  Supplier: ${item.supplier} | Total Cost: $${itemTotal.toFixed(2)}\n\n`;
  });

  text += `Total Estimated Cost: $${totalCost.toFixed(2)}\n\n`;
  text += `Next Steps:\n`;
  text += `- Review suggested quantities and adjust as needed\n`;
  text += `- Contact suppliers to confirm availability and pricing\n`;
  text += `- Place orders for critical items first\n`;
  text += `- Update inventory levels after receiving orders\n`;

  return text;
}
