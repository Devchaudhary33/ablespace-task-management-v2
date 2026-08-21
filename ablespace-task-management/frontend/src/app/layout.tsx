import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../components/auth-provider';

export const metadata: Metadata = {
  title: 'AbleSpace',
  description: 'AbleSpace Task Management',
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
