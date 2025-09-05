import React from 'react';
import { EmailTestComponent } from '@/components/EmailTestComponent';

export default function EmailTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Email Service Test
          </h1>
          <p className="text-gray-600">
            Test the Resend email service integration with pre-built templates and custom emails.
          </p>
        </div>
        
        <EmailTestComponent />
      </div>
    </div>
  );
}
