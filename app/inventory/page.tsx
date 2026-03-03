'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { ConfirmActionButton } from '@/components/ConfirmActionButton';

interface BookStats {
  id: string;
  title: string;
  author: string;
  totalCopies: number;
  availableCopies: number;
  issuedCopies: number;
}

export default function InventoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<BookStats[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'LIBRARIAN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/books?limit=1000');
      
      const statsPromises = response.data.data.map((book: any) =>
        api.get(`/books/${book.id}/stats`)
      );
      const statsResults = await Promise.all(statsPromises);
      setBooks(statsResults.map(r => r.data));
    } catch (error: any) {
      console.error('Failed to load inventory:', error);
      alert(error.response?.data?.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCopies = async (bookId: string, count: number) => {
    try {
      setLoading(true);
      const response = await api.post(`/books/${bookId}/add-copies`, { count });
      await fetchData();
      alert(response.data.message || `${count} copies added successfully!`);
    } catch (error: any) {
      console.error('Add copies error:', error);
      alert(error.response?.data?.message || 'Failed to add copies');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCopies = async (bookId: string, count: number) => {
    try {
      setLoading(true);
      const response = await api.post(`/books/${bookId}/remove-copies`, { count });
      await fetchData();
      alert(response.data.message || `${count} copies removed successfully!`);
    } catch (error: any) {
      console.error('Remove copies error:', error);
      alert(error.response?.data?.message || 'Failed to remove copies');
    } finally {
      setLoading(false);
    }
  };

  const promptAndAdd = (bookId: string, bookTitle: string) => {
    const count = prompt(`How many copies of "${bookTitle}" to add?`, '1');
    if (count && parseInt(count) > 0) {
      handleAddCopies(bookId, parseInt(count));
    }
  };

  const promptAndRemove = (bookId: string, bookTitle: string, availableCopies: number) => {
    if (availableCopies === 0) {
      alert('No available copies to remove');
      return;
    }
    const count = prompt(`How many copies of "${bookTitle}" to remove? (Max: ${availableCopies})`, '1');
    if (count && parseInt(count) > 0) {
      if (parseInt(count) > availableCopies) {
        alert(`Cannot remove ${count} copies. Only ${availableCopies} available.`);
        return;
      }
      handleRemoveCopies(bookId, parseInt(count));
    }
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'LIBRARIAN')) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-2">Manage book copies and availability</p>
        </div>

        {loading && books.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading inventory...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No books in inventory</p>
            <p className="text-gray-500 mt-2">Add books first to manage inventory</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-indigo-50 border-b">
              <h3 className="text-lg font-semibold text-indigo-900">Book Inventory</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Book Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Author</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Total Copies</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Available</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Issued</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {books.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900 font-medium">{book.title}</td>
                      <td className="px-6 py-4 text-gray-700">{book.author}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-800 font-semibold">
                          {book.totalCopies}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-800 font-semibold">
                          {book.availableCopies}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-yellow-800 font-semibold">
                          {book.issuedCopies}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          <ConfirmActionButton
                            action="add"
                            itemName={`copies to ${book.title}`}
                            onConfirm={() => promptAndAdd(book.id, book.title)}
                            disabled={loading}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm disabled:bg-gray-400"
                          >
                            + Add
                          </ConfirmActionButton>
                          <ConfirmActionButton
                            action="remove"
                            itemName={`copies from ${book.title}`}
                            onConfirm={() => promptAndRemove(book.id, book.title, book.availableCopies)}
                            disabled={loading || book.availableCopies === 0}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm disabled:bg-gray-400"
                          >
                            - Remove
                          </ConfirmActionButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
