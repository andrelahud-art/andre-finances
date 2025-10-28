'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect directly to dashboard - no authentication required
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mb-4">
          <span className="text-2xl font-bold text-white">AF</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">André Finance</h1>
        <p className="text-slate-400">Redirigiendo al dashboard...</p>
      </div>
    </div>
  );
}
