import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listPayments, getPayment, createPayment, updatePayment, deletePayment } from '../controllers/payment.controller.js';

const router = Router();

router.use(authenticate);

// GET all payments
router.get('/', authorize(['owner', 'receptionist', 'customer']), [
  // Pagination validations
  query('page')
    .optional()
    .isInt({ min: 1, max: 10000 }).withMessage('Page must be a positive integer between 1 and 10,000')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 }).withMessage('Limit must be a positive integer between 1 and 1,000')
    .toInt(),
  
  // Sorting validations
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'date', '-date', 'amount', '-amount', 'status', '-status'])
    .withMessage('Sort must be one of: createdAt, -createdAt, date, -date, amount, -amount, status, -status'),
  
  // Filter validations
  query('status')
    .optional()
    .isIn(['completed', 'pending']).withMessage('Status filter must be completed or pending'),
  
  query('paymentMethod')
    .optional()
    .isIn(['card', 'cash']).withMessage('Payment method filter must be card or cash'),
  
  query('minAmount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimum amount must be a positive number')
    .toFloat(),
  
  query('maxAmount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Maximum amount must be a positive number')
    .toFloat()
    .custom((value, { req }) => {
      if (req.query.minAmount && parseFloat(value) < parseFloat(req.query.minAmount)) {
        throw new Error('Maximum amount must be greater than or equal to minimum amount');
      }
      return true;
    }),
  
  query('dateFrom')
    .optional()
    .isISO8601({ strict: false }).withMessage('Date from must be in ISO 8601 format'),
  
  query('dateTo')
    .optional()
    .isISO8601({ strict: false }).withMessage('Date to must be in ISO 8601 format')
    .custom((value, { req }) => {
      if (req.query.dateFrom) {
        const dateFrom = new Date(req.query.dateFrom);
        const dateTo = new Date(value);
        if (isNaN(dateFrom.getTime()) || isNaN(dateTo.getTime())) {
          throw new Error('Invalid date format provided');
        }
        if (dateTo < dateFrom) {
          throw new Error('Date to must be greater than or equal to date from');
        }
      }
      return true;
    }),
  
  // Search validations
  query('search')
    .optional()
    .isString().withMessage('Search must be a string')
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Search query must be 1-100 characters')
    .matches(/^[a-zA-Z0-9\s\-.,!?()]*$/).withMessage('Search contains invalid characters')
], validate, listPayments);

// GET single payment
router.get('/:id', authorize(['owner', 'receptionist', 'customer']), [
  param('id').isMongoId().withMessage('Invalid payment ID')
], validate, getPayment);

// CREATE payment
router.post('/', authorize(['owner', 'receptionist', 'customer']), [
  // Amount validations
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01, max: 999999.99 }).withMessage('Amount must be between 0.01 and 999,999.99')
    .custom((value) => {
      // Allow integers and decimals with up to 2 decimal places
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        throw new Error('Amount must be a valid number');
      }
      // Check decimal places by converting to string and counting after decimal point
      const decimalPart = value.toString().split('.')[1];
      if (decimalPart && decimalPart.length > 2) {
        throw new Error('Amount must have at most 2 decimal places');
      }
      return true;
    }),
  
  // Payment method validations
  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['card', 'cash']).withMessage('Payment method must be card or cash'),
  
  // Description validations
  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .trim()
    .isLength({ min: 1, max: 500 }).withMessage('Description must be 1-500 characters')
    .matches(/^[a-zA-Z0-9\s\-.,!?()]*$/).withMessage('Description contains invalid characters'),
  
  // Date validations
  body('date')
    .optional()
    .isISO8601().withMessage('Date must be in ISO 8601 format')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      
      if (date < oneYearAgo) {
        throw new Error('Date cannot be more than 1 year in the past');
      }
      if (date > oneYearFromNow) {
        throw new Error('Date cannot be more than 1 year in the future');
      }
      return true;
    }),
  
  // Status validations
  body('status')
    .optional()
    .isIn(['completed', 'pending']).withMessage('Status must be completed or pending'),
  
  // Transaction ID validations
  body('transactionId')
    .optional()
    .isString().withMessage('Transaction ID must be a string')
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Transaction ID must be 3-100 characters')
    .matches(/^[a-zA-Z0-9\-_]+$/).withMessage('Transaction ID can only contain letters, numbers, hyphens, and underscores'),
  
  // Card last four validations (conditional on payment method)
  body('cardLastFour')
    .optional()
    .isString().withMessage('Card last four must be a string')
    .isLength({ min: 4, max: 4 }).withMessage('Card last four must be exactly 4 digits')
    .matches(/^\d{4}$/).withMessage('Card last four must contain only digits')
    .custom((value, { req }) => {
      if (req.body.paymentMethod === 'card' && !value) {
        throw new Error('Card last four digits are required for card payments');
      }
      return true;
    }),
  
  // Card number validation (conditional on payment method)
  body('cardNumber')
    .optional()
    .isString().withMessage('Card number must be a string')
    .custom((value, { req }) => {
      if (req.body.paymentMethod === 'card') {
        if (!value) {
          throw new Error('Card number is required for card payments');
        }
        // Remove spaces and hyphens for validation
        const cleanCardNumber = value.replace(/[\s-]/g, '');
        if (!cleanCardNumber.match(/^\d{16}$/)) {
          throw new Error('Card number must be exactly 16 digits');
        }
      }
      return true;
    }),
  
  // CVV validation (conditional on payment method)
  body('cvv')
    .optional()
    .isString().withMessage('CVV must be a string')
    .custom((value, { req }) => {
      if (req.body.paymentMethod === 'card') {
        if (!value) {
          throw new Error('CVV is required for card payments');
        }
        if (!value.match(/^\d{3}$/)) {
          throw new Error('CVV must be exactly 3 digits');
        }
      }
      return true;
    }),
  
  // Expiry date validation (conditional on payment method)
  body('expiryDate')
    .optional()
    .isString().withMessage('Expiry date must be a string')
    .custom((value, { req }) => {
      if (req.body.paymentMethod === 'card') {
        if (!value) {
          throw new Error('Expiry date is required for card payments');
        }
        
        // Check format MM/YY or MM/YYYY
        if (!value.match(/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/)) {
          throw new Error('Expiry date must be in MM/YY or MM/YYYY format');
        }
        
        const [month, year] = value.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
        
        // Convert 2-digit year to 4-digit year
        let fullYear = parseInt(year);
        if (year.length === 2) {
          fullYear = 2000 + parseInt(year);
        }
        
        const expiryMonth = parseInt(month);
        
        // Check if the expiry date is in the past
        if (fullYear < currentYear || (fullYear === currentYear && expiryMonth < currentMonth)) {
          throw new Error('Expiry date cannot be in the past');
        }
        
        // Check if expiry date is too far in the future (more than 10 years)
        if (fullYear > currentYear + 10) {
          throw new Error('Expiry date cannot be more than 10 years in the future');
        }
      }
      return true;
    }),
  
  // Job sheet ID validations
  body('jobSheetId')
    .optional()
    .isInt({ min: 1 }).withMessage('Job sheet ID must be a positive integer'),
  
  // Car ID validations
  body('carId')
    .optional()
    .isInt({ min: 1 }).withMessage('Car ID must be a positive integer')
], validate, createPayment);

// UPDATE payment
router.put('/:id', authorize(['owner', 'receptionist', 'customer']), [
  // ID validation
  param('id').isMongoId().withMessage('Invalid payment ID'),
  
  // Amount validations (optional for update)
  body('amount')
    .optional()
    .isFloat({ min: 0.01, max: 999999.99 }).withMessage('Amount must be between 0.01 and 999,999.99')
    .custom((value) => {
      // Allow integers and decimals with up to 2 decimal places
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        throw new Error('Amount must be a valid number');
      }
      // Check decimal places by converting to string and counting after decimal point
      const decimalPart = value.toString().split('.')[1];
      if (decimalPart && decimalPart.length > 2) {
        throw new Error('Amount must have at most 2 decimal places');
      }
      return true;
    }),
  
  // Payment method validations
  body('paymentMethod')
    .optional()
    .isIn(['card', 'cash']).withMessage('Payment method must be card or cash'),
  
  // Description validations
  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .trim()
    .isLength({ min: 1, max: 500 }).withMessage('Description must be 1-500 characters')
    .matches(/^[a-zA-Z0-9\s\-.,!?()]*$/).withMessage('Description contains invalid characters'),
  
  // Date validations
  body('date')
    .optional()
    .isISO8601().withMessage('Date must be in ISO 8601 format')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      
      if (date < oneYearAgo) {
        throw new Error('Date cannot be more than 1 year in the past');
      }
      if (date > oneYearFromNow) {
        throw new Error('Date cannot be more than 1 year in the future');
      }
      return true;
    }),
  
  // Status validations
  body('status')
    .optional()
    .isIn(['completed', 'pending']).withMessage('Status must be completed or pending'),
  
  // Transaction ID validations
  body('transactionId')
    .optional()
    .isString().withMessage('Transaction ID must be a string')
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Transaction ID must be 3-100 characters')
    .matches(/^[a-zA-Z0-9\-_]+$/).withMessage('Transaction ID can only contain letters, numbers, hyphens, and underscores'),
  
  // Card last four validations
  body('cardLastFour')
    .optional()
    .isString().withMessage('Card last four must be a string')
    .isLength({ min: 4, max: 4 }).withMessage('Card last four must be exactly 4 digits')
    .matches(/^\d{4}$/).withMessage('Card last four must contain only digits'),
  
  // Card number validation (conditional on payment method)
  body('cardNumber')
    .optional()
    .isString().withMessage('Card number must be a string')
    .custom((value, { req }) => {
      if (req.body.paymentMethod === 'card') {
        if (!value) {
          throw new Error('Card number is required for card payments');
        }
        // Remove spaces and hyphens for validation
        const cleanCardNumber = value.replace(/[\s-]/g, '');
        if (!cleanCardNumber.match(/^\d{16}$/)) {
          throw new Error('Card number must be exactly 16 digits');
        }
      }
      return true;
    }),
  
  // CVV validation (conditional on payment method)
  body('cvv')
    .optional()
    .isString().withMessage('CVV must be a string')
    .custom((value, { req }) => {
      if (req.body.paymentMethod === 'card') {
        if (!value) {
          throw new Error('CVV is required for card payments');
        }
        if (!value.match(/^\d{3}$/)) {
          throw new Error('CVV must be exactly 3 digits');
        }
      }
      return true;
    }),
  
  // Expiry date validation (conditional on payment method)
  body('expiryDate')
    .optional()
    .isString().withMessage('Expiry date must be a string')
    .custom((value, { req }) => {
      if (req.body.paymentMethod === 'card') {
        if (!value) {
          throw new Error('Expiry date is required for card payments');
        }
        
        // Check format MM/YY or MM/YYYY
        if (!value.match(/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/)) {
          throw new Error('Expiry date must be in MM/YY or MM/YYYY format');
        }
        
        const [month, year] = value.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
        
        // Convert 2-digit year to 4-digit year
        let fullYear = parseInt(year);
        if (year.length === 2) {
          fullYear = 2000 + parseInt(year);
        }
        
        const expiryMonth = parseInt(month);
        
        // Check if the expiry date is in the past
        if (fullYear < currentYear || (fullYear === currentYear && expiryMonth < currentMonth)) {
          throw new Error('Expiry date cannot be in the past');
        }
        
        // Check if expiry date is too far in the future (more than 10 years)
        if (fullYear > currentYear + 10) {
          throw new Error('Expiry date cannot be more than 10 years in the future');
        }
      }
      return true;
    }),
  
  // Job sheet ID validations
  body('jobSheetId')
    .optional()
    .isInt({ min: 1 }).withMessage('Job sheet ID must be a positive integer'),
  
  // Car ID validations
  body('carId')
    .optional()
    .isInt({ min: 1 }).withMessage('Car ID must be a positive integer'),
  
  // Validate that at least one field is provided for update
  body()
    .custom((value, { req }) => {
      const allowedFields = ['amount', 'paymentMethod', 'description', 'date', 'status', 'transactionId', 'cardLastFour', 'cardNumber', 'cvv', 'expiryDate', 'jobSheetId', 'carId'];
      const bodyKeys = Object.keys(req.body || {});
      
      if (bodyKeys.length === 0) {
        throw new Error('Request body cannot be empty');
      }
      
      const validFields = bodyKeys.filter(key => allowedFields.includes(key));
      if (validFields.length === 0) {
        throw new Error('Request must contain at least one valid field to update');
      }
      
      return true;
    })
], validate, updatePayment);

// DELETE payment
router.delete('/:id', authorize(['owner', 'receptionist', 'customer']), [
  param('id').isMongoId().withMessage('Invalid payment ID')
], validate, deletePayment);

export default router;


