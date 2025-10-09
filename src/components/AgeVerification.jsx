// AgeVerification.jsx
import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

function AgeVerification({ isOpen, onVerified, onCancel }) {
  const [birthYear, setBirthYear] = useState('');
  const [error, setError] = useState('');

  const handleVerify = (e) => {
    e.preventDefault();
    setError('');

    const year = parseInt(birthYear);
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;

    if (!year || year < 1900 || year > currentYear) {
      setError('Please enter a valid birth year');
      return;
    }

    if (age < 18) {
      setError('You must be 18 or older to create an account');
      return;
    }

    // Store verification in sessionStorage
    sessionStorage.setItem('age_verified', 'true');
    setBirthYear('');
    setError('');
    onVerified();
  };

  const handleCancel = () => {
    setBirthYear('');
    setError('');
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-800 rounded-xl shadow-2xl max-w-md w-full p-8 border border-green-600/30">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-600/20 p-4 rounded-full">
            <ShieldCheck className="h-12 w-12 text-green-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Age Verification Required
        </h2>
        
        {/* Subtitle */}
        <p className="text-gray-400 text-center mb-6">
          This site contains betting content. You must be 18 or older to continue.
        </p>

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label htmlFor="birthYear" className="block text-sm font-medium text-gray-300 mb-2">
              Enter Your Birth Year
            </label>
            <input
              id="birthYear"
              type="number"
              placeholder="YYYY"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              min="1900"
              max={new Date().getFullYear()}
              required
              autoFocus
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
            >
              Verify Age
            </button>
          </div>
        </form>

        {/* Footer Note */}
        <p className="text-xs text-gray-500 text-center mt-6">
          By continuing, you confirm that you meet the legal age requirement for betting in your jurisdiction.
        </p>
      </div>
    </div>
  );
}

export default AgeVerification;