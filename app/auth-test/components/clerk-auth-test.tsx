'use client';

import { useSupabaseClient } from '@/lib/auth/clerk-supabase-client';
import { useUser } from '@clerk/nextjs';
import { useState } from 'react';

export default function ClerkAuthTest() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const supabase = useSupabaseClient();
  const [testResult, setTestResult] = useState<{
    data: any;
    error: any;
    status: 'idle' | 'loading' | 'success' | 'error';
  }>({
    data: null,
    error: null,
    status: 'idle'
  });

  async function runAuthTest() {
    try {
      setTestResult({ ...testResult, status: 'loading' });
      
      // Try to query a table that requires authentication
      const { data, error } = await supabase
        .from('users')  // Using the users table
        .select('*')
        .limit(5);
      
      setTestResult({
        data,
        error,
        status: error ? 'error' : 'success'
      });
    } catch (error) {
      setTestResult({
        data: null,
        error: error instanceof Error ? error.message : String(error),
        status: 'error'
      });
    }
  }

  if (!isUserLoaded) {
    return <div className="h-48 w-full bg-gray-200 animate-pulse rounded"></div>;
  }

  if (!user) {
    return (
      <div className="p-6 border rounded-lg bg-white shadow">
        <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
        <p className="mb-4">Please sign in to test the Clerk-Supabase integration.</p>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg bg-white shadow">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Logged in as: {user.fullName || user.username || user.primaryEmailAddress?.emailAddress}</h2>
        <p className="text-sm text-gray-500">User ID: {user.id}</p>
      </div>
      
      <div className="my-4">
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={runAuthTest}
          disabled={testResult.status === 'loading'}
        >
          {testResult.status === 'loading' ? 'Testing...' : 'Test Supabase Auth'}
        </button>
      </div>
      
      {testResult.status !== 'idle' && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Test Results:</h3>
          <div className="bg-slate-100 rounded-md p-4 overflow-auto max-h-96">
            <pre className="text-sm">
              {JSON.stringify({
                status: testResult.status,
                data: testResult.data,
                error: testResult.error
              }, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
} 