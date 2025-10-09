import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPage() {
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
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Data Collection</h2>
        <p>
          We collect limited personal information necessary to provide and improve services.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Data Use</h2>
        <p>All collected data is used in accordance with applicable laws and only to enhance your experience.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Cookies</h2>
        <p>We use cookies to personalize content and analyze traffic on our site.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Security</h2>
        <p>We implement reasonable security measures to safeguard your information.</p>
      </section>
    </div></div>
  );
}