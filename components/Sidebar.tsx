'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user || pathname === '/login' || pathname === '/register') return null;

  const isActive = (path: string) => pathname === path ? 'bg-indigo-800' : '';

  return (
    <aside className="w-64 bg-indigo-900 text-white min-h-screen fixed left-0 top-0 shadow-xl">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-8 border-b border-indigo-700 pb-3">📚 Library MS</h1>
        
        <nav className="space-y-2">
          <Link href="/dashboard" className={`block px-4 py-3 rounded hover:bg-indigo-800 transition ${isActive('/dashboard')}`}>
            🏠 Dashboard
          </Link>
          
          <Link href="/books" className={`block px-4 py-3 rounded hover:bg-indigo-800 transition ${isActive('/books')}`}>
            📚 Books
          </Link>
          
          <Link href="/transactions" className={`block px-4 py-3 rounded hover:bg-indigo-800 transition ${isActive('/transactions')}`}>
            🔄 My Transactions
          </Link>
          
          {(user.role === 'ADMIN' || user.role === 'LIBRARIAN') && (
            <Link href="/inventory" className={`block px-4 py-3 rounded hover:bg-indigo-800 transition ${isActive('/inventory')}`}>
              📦 Inventory
            </Link>
          )}
          
          {user.role === 'ADMIN' && (
            <Link href="/users" className={`block px-4 py-3 rounded hover:bg-indigo-800 transition ${isActive('/users')}`}>
              👥 Users
            </Link>
          )}
        </nav>
      </div>
      
      <div className="absolute bottom-0 w-full p-6 border-t border-indigo-700 bg-indigo-950">
        <div className="mb-3">
          <p className="text-sm font-semibold">{user.name}</p>
          <p className="text-xs text-indigo-300">{user.role}</p>
        </div>
        <button onClick={logout} className="w-full bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition">
          Logout
        </button>
      </div>
    </aside>
  );
}
