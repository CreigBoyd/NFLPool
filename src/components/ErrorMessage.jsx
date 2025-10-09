import React from 'react';

export function ErrorMessage({ error, onDismiss }) {
  if (!error) return null;

  return (
    <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {error.errorCode ? error.errorCode.replace(/_/g, ' ') : 'Error'}
          </h3>
          <p className="mt-1 text-sm text-red-700">
            {error.message || 'An unexpected error occurred'}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-3 text-red-400 hover:text-red-600"
          >
            <span className="text-xl">&times;</span>
          </button>
        )}
      </div>
    </div>
  );
}