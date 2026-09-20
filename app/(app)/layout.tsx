'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { Navigation } from '@/components/navigation';
import { TrialGate } from '@/components/trial-gate';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <TrialGate>
          <div className="lg:pl-60">
            <main className="py-8">
              {children}
            </main>
          </div>
        </TrialGate>
      </div>
    </ProtectedRoute>
  );
}
