import './globals.css';
import type { Metadata } from 'next';
import { Figtree } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/auth-context';
import { I18nProvider } from '@/contexts/i18n-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Navigation } from '@/components/navigation';
import { TrialGate } from '@/components/trial-gate';

const figtree = Figtree({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MediControl - Sistema de Gestión de Citas Médicas',
  description: 'Sistema completo para la gestión de pacientes, citas médicas, prescripciones y facturación',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={figtree.className}>
        <AuthProvider>
          <I18nProvider>
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
          </I18nProvider>
        </AuthProvider>
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
