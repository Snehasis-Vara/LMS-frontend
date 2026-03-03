'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { User } from '@/types';
import { ConfirmActionButton } from '@/components/ConfirmActionButton';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userTransactions, setUserTransactions] = useState<Record<string, number>>({});

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersResponse, transactionsResponse] = await Promise.all([
        api.get('/users'),
        api.get('/transactions')
      ]);
      setUsers(usersResponse.data);
      
      // Count only active transactions (ISSUED or OVERDUE) per user
      const transactionCounts: Record<string, number> = {};
      transactionsResponse.data.forEach((transaction: { userId: string; status: string }) => {
        if (transaction.status === 'ISSUED' || transaction.status === 'OVERDUE') {
          transactionCounts[transaction.userId] = (transactionCounts[transaction.userId] || 0) + 1;
        }
      });
      setUserTransactions(transactionCounts);
      
      setError('');
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    try {
      await api.delete(`/users/${id}`);
      alert(`User ${name} deleted successfully!`);
      fetchUsers();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Failed to delete user';
      alert(errorMessage || 'Failed to delete user');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Books Issued</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{user.name}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-sm ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'LIBRARIAN' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-sm ${
                          userTransactions[user.id] > 0 
                            ? 'bg-red-100 text-red-800 font-bold' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {userTransactions[user.id] || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <ConfirmActionButton
                          action="delete"
                          itemName={`user ${user.name}`}
                          onConfirm={() => handleDelete(user.id, user.name)}
                          className={`${
                            userTransactions[user.id] > 0 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : 'bg-red-500 hover:bg-red-600'
                          } text-white px-3 py-1 rounded`}
                          disabled={userTransactions[user.id] > 0}
                        >
                          {userTransactions[user.id] > 0 ? 'Cannot Delete' : 'Delete'}
                        </ConfirmActionButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
