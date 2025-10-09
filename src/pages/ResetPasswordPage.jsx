import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Trophy, AlertCircle } from 'lucide-react';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.error || 'Failed to reset password.');
      }
    } catch (err) {
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
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
          Reset Password
        </h2>
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

        {!message && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="token" value={token} />
            <div>
              <input
                type="password"
                name="password"
                placeholder="New Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded text-sm"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition-colors"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;