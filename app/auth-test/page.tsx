import { Metadata } from 'next';
import ClerkAuthTest from './components/clerk-auth-test';

export const metadata: Metadata = {
  title: 'Clerk-Supabase Integration Test',
  description: 'Testing the new Clerk-Supabase third-party auth integration',
};

export default function AuthTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Clerk-Supabase Integration Test</h1>
      <ClerkAuthTest />
    </div>
  );
} 