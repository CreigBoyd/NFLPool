import React, { useState } from 'react';
import { Trophy, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

function ForgotPasswordPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
     
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('If the account exists, a password reset link has been sent.');
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch {
      setError('Network error.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8" style={{ backgroundColor: '#A8A8A8' }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <div className="flex justify-center">
          <Trophy className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">Forgot Password</h2>
      </div>

      <div className="mx-auto w-full max-w-md bg-white p-8 rounded-lg shadow">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-red-800 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-green-800 flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            name="emailOrUsername"
            placeholder="Enter your email or username"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition-colors"
          >
            {loading ? 'Sending...' : 'Send Password Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;