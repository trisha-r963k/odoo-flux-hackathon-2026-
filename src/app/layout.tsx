import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from '@/components/providers/SessionProvider';

export const metadata: Metadata = {
  title: 'Brightloop Software — Subscription Management & Automated Billing',
  description: 'Unified recurring billing, pricing engine, and executive finance dashboard for Odoo x FLUX Hackathon 2026',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
