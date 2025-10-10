/**
 * ENHANCED INPUT COMPONENT - CONSISTENT TEXT COLORS AND STYLING
 * 
 * This component provides a standardized input field with proper text colors,
 * accessibility features, and consistent styling across the application.
 * 
 * Features:
 * - Proper text color visibility in all states
 * - Error and success state styling
 * - Dark mode support
 * - Accessibility features
 * - Consistent placeholder colors
 */

import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Input = forwardRef(({ 
  className, 
  type = "text", 
  error = false, 
  success = false, 
  disabled = false,
  ...props 
}, ref) => {
  return (
    <input
      type={type}
      className={cn(
        // Base styles with explicit text colors
        "w-full px-3 py-2 border rounded-lg transition-all duration-200",
        "text-gray-900 placeholder-gray-500 bg-white",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
        "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed",
        
        // Error state
        error && "border-red-300 bg-red-50 text-gray-900 focus:ring-red-500 focus:border-red-500",
        
        // Success state
        success && "border-green-300 bg-green-50 text-gray-900 focus:ring-green-500 focus:border-green-500",
        
        // Default state
        !error && !success && "border-gray-300 hover:border-gray-400",
        
        // Dark mode support
        "dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400",
        "dark:focus:ring-blue-400 dark:focus:border-blue-400",
        "dark:disabled:bg-gray-700 dark:disabled:text-gray-400",
        
        // Error state in dark mode
        error && "dark:border-red-400 dark:bg-red-900/20 dark:text-gray-100",
        
        // Success state in dark mode
        success && "dark:border-green-400 dark:bg-green-900/20 dark:text-gray-100",
        
        className
      )}
      ref={ref}
      disabled={disabled}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };

/**
 * SELECT COMPONENT - CONSISTENT DROPDOWN STYLING
 */
export const Select = forwardRef(({ 
  className, 
  error = false, 
  success = false, 
  disabled = false,
  children,
  ...props 
}, ref) => {
  return (
    <select
      className={cn(
        // Base styles with explicit text colors
        "w-full px-3 py-2 border rounded-lg transition-all duration-200",
        "text-gray-900 bg-white",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
        "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed",
        
        // Error state
        error && "border-red-300 bg-red-50 text-gray-900 focus:ring-red-500 focus:border-red-500",
        
        // Success state
        success && "border-green-300 bg-green-50 text-gray-900 focus:ring-green-500 focus:border-green-500",
        
        // Default state
        !error && !success && "border-gray-300 hover:border-gray-400",
        
        // Dark mode support
        "dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100",
        "dark:focus:ring-blue-400 dark:focus:border-blue-400",
        "dark:disabled:bg-gray-700 dark:disabled:text-gray-400",
        
        // Error state in dark mode
        error && "dark:border-red-400 dark:bg-red-900/20 dark:text-gray-100",
        
        // Success state in dark mode
        success && "dark:border-green-400 dark:bg-green-900/20 dark:text-gray-100",
        
        className
      )}
      ref={ref}
      disabled={disabled}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = "Select";

/**
 * TEXTAREA COMPONENT - CONSISTENT TEXTAREA STYLING
 */
export const Textarea = forwardRef(({ 
  className, 
  error = false, 
  success = false, 
  disabled = false,
  ...props 
}, ref) => {
  return (
    <textarea
      className={cn(
        // Base styles with explicit text colors
        "w-full px-3 py-2 border rounded-lg transition-all duration-200 resize-y",
        "text-gray-900 placeholder-gray-500 bg-white",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
        "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed",
        
        // Error state
        error && "border-red-300 bg-red-50 text-gray-900 focus:ring-red-500 focus:border-red-500",
        
        // Success state
        success && "border-green-300 bg-green-50 text-gray-900 focus:ring-green-500 focus:border-green-500",
        
        // Default state
        !error && !success && "border-gray-300 hover:border-gray-400",
        
        // Dark mode support
        "dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400",
        "dark:focus:ring-blue-400 dark:focus:border-blue-400",
        "dark:disabled:bg-gray-700 dark:disabled:text-gray-400",
        
        // Error state in dark mode
        error && "dark:border-red-400 dark:bg-red-900/20 dark:text-gray-100",
        
        // Success state in dark mode
        success && "dark:border-green-400 dark:bg-green-900/20 dark:text-gray-100",
        
        className
      )}
      ref={ref}
      disabled={disabled}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export default Input;
