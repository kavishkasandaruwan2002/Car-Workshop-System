import React, { useState } from 'react';
import { useToast } from '../components/Toast';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const { show } = useToast();

  function handleSubmit(event) {
    event.preventDefault();
    if (!email) {
      setStatusMessage('Please enter your email address.');
      show('Please enter your email address.', 'error');
      return;
    }
    // Placeholder: integrate with backend to send reset link
    setStatusMessage('If this email exists, a reset link has been sent.');
    show('If this email exists, a reset link has been sent.', 'success');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white shadow rounded p-6">
        <h1 className="text-2xl font-semibold mb-4">Forgot Password</h1>
        <p className="text-sm text-gray-600 mb-6">
          Enter the email address associated with your account and we'll send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Send Reset Link
          </button>
        </form>
        {statusMessage && (
          <div className="mt-4 text-sm text-gray-700">{statusMessage}</div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;


