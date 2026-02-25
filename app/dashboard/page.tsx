'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ books: 0, users: 0, transactions: 0, inventory: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [booksRes, inventoryRes, transactionsRes, usersRes] = await Promise.all([
          api.get('/books'),
          user?.role === 'ADMIN' || user?.role === 'LIBRARIAN' ? api.get('/inventory') : Promise.resolve({ data: [] }),
          api.get('/transactions'),
          user?.role === 'ADMIN' ? api.get('/users') : Promise.resolve({ data: [] }),
        ]);
        
        const booksData = booksRes.data.data || booksRes.data;
        const inventoryData = inventoryRes.data;
        const transactionsData = transactionsRes.data;
        const usersData = usersRes.data;
        
        setStats({
          books: booksData.length,
          inventory: inventoryData.length,
          transactions: transactionsData.length,
          users: usersData.length,
        });
      } catch (error: any) {
        console.error('Failed to fetch stats:', error);
      }
    };
    if (user) {
      fetchStats();
    }
  }, [user]);

  return (
    <ProtectedRoute>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-gray-600 text-sm font-medium">Total Books</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.books}</p>
          </div>
          
          {(user?.role === 'ADMIN' || user?.role === 'LIBRARIAN') && (
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
              <h3 className="text-gray-600 text-sm font-medium">Inventory Copies</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.inventory}</p>
            </div>
          )}
          
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
            <h3 className="text-gray-600 text-sm font-medium">{user?.role === 'STUDENT' ? 'My Transactions' : 'Transactions'}</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.transactions}</p>
          </div>
          
          {user?.role === 'ADMIN' && (
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
              <h3 className="text-gray-600 text-sm font-medium">Total Users</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.users}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/books" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">📚 Browse Books</h3>
            <p className="text-gray-600">View and search all available books</p>
          </Link>

          <Link href="/transactions" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">🔄 My Transactions</h3>
            <p className="text-gray-600">Issue, return, and renew books</p>
          </Link>
          
          {(user?.role === 'ADMIN' || user?.role === 'LIBRARIAN') && (
            <>
              <Link href="/inventory" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">📦 Inventory</h3>
                <p className="text-gray-600">Manage book copies and availability</p>
              </Link>
            </>
          )}
          
          {user?.role === 'ADMIN' && (
            <Link href="/users" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">👥 Users</h3>
              <p className="text-gray-600">Manage system users</p>
            </Link>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
