'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { Toaster } from 'sonner';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' 
    || pathname === '/register' 
    || pathname === '/'
    || pathname === '/forgot-password'
    || pathname === '/verify-otp'
    || pathname === '/reset-password';

  if (isAuthPage) {
    return (
      <>
        {children}
        <Toaster position="top-right" richColors />
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="pt-20 p-6 bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen">
          {children}
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </>
  );
}
