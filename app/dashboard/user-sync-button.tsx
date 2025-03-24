'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

export default function UserSyncButton() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    data?: any;
  } | null>(null);

  const syncUser = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setResult(null);
    
    try {
      // Force sync the current user with Supabase
      const response = await fetch('/api/sync-current-user', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync user');
      }
      
      setResult({
        success: true,
        message: 'Welcome back to Masters 2025!',
        data
      });
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'An error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <button 
        onClick={syncUser} 
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium disabled:opacity-50 transition-all duration-200 shadow-md"
      >
        {isLoading ? 'Activating Your Membership...' : 'Activate Your Masters 2025 Membership'}
      </button>
      
      {result && (
        <div className={`mt-4 p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <p className="font-medium text-lg">{result.message}</p>
          {result.success && (
            <div className="mt-2 space-y-2 text-sm">
              <p>
                It's great to have you back for another exciting year of the Gaskin Masters Pool!
              </p>
              <p>
                Your membership has been successfully activated for the 2025 tournament.
              </p>
            </div>
          )}
        </div>
      )}
      
      <p className="text-sm text-gray-500 mt-2 text-center">
        Click above to activate your membership and continue your Masters Pool tradition
      </p>
    </div>
  );
} 