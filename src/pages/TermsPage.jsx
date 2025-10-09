import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 relative">
      <Link
        to="/login"
        className="absolute top-6 left-6 text-green-400 hover:text-green-600 font-semibold flex items-center space-x-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 inline-block"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back to Sign In</span>
      </Link>

      <div className="max-w-3xl mx-auto px-6 py-12 text-neutral-900 font-sans">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Welcome</h2>
          <p>
            Welcome to NFL Pool. By using our service, you agree to comply with and be bound by the following terms and conditions.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Use of Service</h2>
          <p>
            You agree to use the service lawfully and not to disrupt or interfere with the platform's normal operations.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Limitations of Liability</h2>
          <p>
            We do not guarantee continuous, uninterrupted service and are not liable for direct or indirect damages.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">Changes to Terms</h2>
          <p>
            We reserve the right to modify the terms at any time. Continued use constitutes agreement to changes.
          </p>
        </section>
      </div>
    </div>
  );
}