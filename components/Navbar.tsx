'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import ProfileDropdown from './ProfileDropdown';

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isActive = (path: string) => pathname === path ? 'bg-blue-700' : '';

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="text-xl font-bold">
            📚 Library MS
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className={`px-3 py-2 rounded hover:bg-blue-700 ${isActive('/dashboard')}`}>
              Dashboard
            </Link>
            <Link href="/books" className={`px-3 py-2 rounded hover:bg-blue-700 ${isActive('/books')}`}>
              Books
            </Link>
            {(user.role === 'ADMIN' || user.role === 'LIBRARIAN') && (
              <>
                <Link href="/inventory" className={`px-3 py-2 rounded hover:bg-blue-700 ${isActive('/inventory')}`}>
                  Inventory
                </Link>
                <Link href="/transactions" className={`px-3 py-2 rounded hover:bg-blue-700 ${isActive('/transactions')}`}>
                  Transactions
                </Link>
              </>
            )}
            {user.role === 'ADMIN' && (
              <Link href="/users" className={`px-3 py-2 rounded hover:bg-blue-700 ${isActive('/users')}`}>
                Users
              </Link>
            )}
            
            <div className="ml-4 border-l pl-4">
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
