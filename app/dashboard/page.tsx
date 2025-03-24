import { auth, currentUser } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/auth/clerk-supabase';
import UserSyncButton from './user-sync-button';

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId) {
    return <div className="p-6">Please sign in to access the dashboard</div>;
  }
  
  // Get Supabase client authenticated with Clerk
  let userData = null;
  let error = null;
  let userCreated = false;
  
  try {
    const supabase = await createClerkSupabaseClient();
    const { data, error: supabaseError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();
    
    if (supabaseError && supabaseError.code === 'PGRST116') {
      // Record not found - we'll let the sync button handle this case
      console.log('User not found in Supabase. Sync button will create it.');
    } else if (supabaseError) {
      throw supabaseError;
    } else {
      userData = data;
    }
  } catch (e: any) {
    console.error('Error fetching user data:', e);
    error = e.message || 'Failed to fetch user data';
  }

  // Get current year
  const currentYear = new Date().getFullYear();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">Gaskin Masters Pool {currentYear}</h1>
        <p className="text-gray-600 mt-2">The tradition unlike any other</p>
      </div>
      
      {!userData ? (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 border-t-4 border-green-600">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-green-800 mb-3">Welcome Back!</h2>
            <p className="text-lg text-gray-700">
              Great to see you again for the {currentYear} Masters Tournament!
            </p>
          </div>
          
          <div className="mb-8 bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="font-semibold text-lg text-green-800 mb-3">Membership Activation Required</h3>
            <p className="text-gray-700 mb-4">
              We've upgraded our system for an even better Masters Pool experience this year. 
              To complete your registration for {currentYear}, please activate your membership below.
            </p>
            
            <UserSyncButton />
          </div>
          
          <div className="text-sm text-gray-500 text-center">
            <p>
              Questions? Contact the pool administrator at{' '}
              <a href="mailto:henry@gaskin.pro" className="text-green-600 hover:underline">
                henry@gaskin.pro
              </a>
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 border-t-4 border-green-600">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-green-800">Welcome back, {userData.first_name || user?.firstName || 'Member'}!</h2>
              <p className="text-gray-600 mt-1">
                Your Masters {currentYear} membership is active
              </p>
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium text-sm">
              Active Member
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Email</h3>
              <p>{userData.email || 'Not available'}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Name</h3>
              <p>{`${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Not available'}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Username</h3>
              <p>{userData.username || 'Not available'}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Member Since</h3>
              <p>{new Date(userData.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="font-medium text-gray-700 mb-3">Update Your Information</h3>
            <p className="text-sm text-gray-600 mb-4">
              If you've updated your profile info in your account settings, you can sync those changes here:
            </p>
            
            <UserSyncButton />
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Tournament Information</h2>
        <p className="mb-4">
          The 2025 Masters Tournament will be held April 10-13 at Augusta National Golf Club.
        </p>
        <p className="mb-4">
          Entry deadline for the pool will be April 9, 2025 at 6:00 PM ET.
        </p>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            "A tradition unlike any other" - The Masters
          </p>
        </div>
      </div>
    </div>
  );
} 