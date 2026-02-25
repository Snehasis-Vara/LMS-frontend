'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Transaction, User, Book } from '@/types';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { ConfirmActionButton } from '@/components/ConfirmActionButton';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [trans, bks] = await Promise.all([
        api.get('/transactions'),
        api.get('/books'),
      ]);
      
      setTransactions(trans.data);
      setBooks((bks.data.data || bks.data).filter((b: Book) => b.availableCopies > 0));
      
      // Only fetch users for admin/librarian
      if (user?.role === 'ADMIN' || user?.role === 'LIBRARIAN') {
        const usr = await api.get('/users');
        setUsers(usr.data);
      }
    } catch (error: any) {
      console.error('Failed to load data:', error);
      alert(error.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const onIssue = async (data: any) => {
    try {
      setLoading(true);
      
      // Find an available copy for the selected book
      const inventoryResponse = await api.get('/inventory');
      const availableCopy = inventoryResponse.data.find(
        (c: any) => c.bookId === data.bookId && c.status === 'AVAILABLE'
      );
      
      if (!availableCopy) {
        alert('No available copies for this book');
        setLoading(false);
        return;
      }
      
      // If student, use their own ID
      const issueData = user?.role === 'STUDENT' 
        ? { userId: user.id, bookCopyId: availableCopy.id }
        : { userId: data.userId, bookCopyId: availableCopy.id };
      
      await api.post('/transactions/issue', issueData);
      await fetchData();
      setShowIssueModal(false);
      reset();
      alert('Book issued successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to issue book');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (id: string) => {
    try {
      setLoading(true);
      const response = await api.post('/transactions/return', { transactionId: id });
      await fetchData();
      const fine = response.data.fine || 0;
      if (fine > 0) {
        alert(`Book returned successfully! Fine: ₹${fine}`);
      } else {
        alert('Book returned successfully!');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to return book');
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (id: string) => {
    try {
      setLoading(true);
      await api.post('/transactions/renew', { transactionId: id });
      await fetchData();
      alert('Book renewed successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to renew book');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ISSUED': return 'bg-blue-100 text-blue-800';
      case 'RETURNED': return 'bg-green-100 text-green-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openIssueModal = () => {
    if (user?.role === 'STUDENT') {
      setValue('userId', user.id);
    }
    setShowIssueModal(true);
  };

  // Check if student has any active transactions (ISSUED or OVERDUE)
  const hasActiveTransactions = user?.role === 'STUDENT' && 
    transactions.some(trans => trans.status === 'ISSUED' || trans.status === 'OVERDUE');

  // Check if student has any transactions at all
  const hasAnyTransactions = user?.role === 'STUDENT' && transactions.length > 0;

  // Determine button text and visibility
  const getIssueButton = () => {
    if (user?.role === 'ADMIN' || user?.role === 'LIBRARIAN') {
      return { show: true, text: '+ Issue Book' };
    }
    
    if (user?.role === 'STUDENT') {
      // First-time student (no transactions)
      if (!hasAnyTransactions) {
        return { show: true, text: 'Issue Your First Book' };
      }
      // Student with only returned books (no active transactions)
      if (!hasActiveTransactions) {
        return { show: true, text: '+ Issue Book' };
      }
      // Student with active books
      if (hasActiveTransactions) {
        return { show: true, text: '+ Issue Book' };
      }
    }
    
    return { show: false, text: '' };
  };

  const issueButton = getIssueButton();

  return (
    <ProtectedRoute>
      <div>
        <div className="flex justify-between items-center mb-6">
          {issueButton.show && (
            <button
              onClick={openIssueModal}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 shadow-md transition"
            >
              {issueButton.text}
            </button>
          )}
        </div>

        {loading && transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading transactions...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-indigo-50 border-b">
              <h3 className="text-lg font-semibold text-indigo-900">
                {user?.role === 'STUDENT' ? 'My Transactions' : 'All Transactions'}
              </h3>
            </div>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No transactions found</p>
                {issueButton.show && (
                  <button
                    onClick={openIssueModal}
                    className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    {issueButton.text}
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {(user?.role === 'ADMIN' || user?.role === 'LIBRARIAN') && (
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                      )}
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Book</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Issue Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Due Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Renewals</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map((trans) => (
                      <tr key={trans.id} className="hover:bg-gray-50">
                        {(user?.role === 'ADMIN' || user?.role === 'LIBRARIAN') && (
                          <td className="px-6 py-4 text-gray-900">{trans.user?.name}</td>
                        )}
                        <td className="px-6 py-4 text-gray-900">{trans.bookCopy?.book?.title}</td>
                        <td className="px-6 py-4 text-gray-700">{format(new Date(trans.issueDate), 'MMM dd, yyyy')}</td>
                        <td className="px-6 py-4 text-gray-700">{format(new Date(trans.dueDate), 'MMM dd, yyyy')}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trans.status)}`}>
                            {trans.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{trans.renewCount}/1</td>
                        <td className="px-6 py-4">
                          {trans.status === 'ISSUED' && (
                            <div className="flex gap-2">
                              <ConfirmActionButton
                                action="return"
                                itemName={trans.bookCopy?.book?.title}
                                onConfirm={() => handleReturn(trans.id)}
                                disabled={loading}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition text-sm disabled:bg-gray-400"
                              >
                                Return
                              </ConfirmActionButton>
                              {trans.renewCount < 1 && (
                                <ConfirmActionButton
                                  action="renew"
                                  itemName={trans.bookCopy?.book?.title}
                                  onConfirm={() => handleRenew(trans.id)}
                                  disabled={loading}
                                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition text-sm disabled:bg-gray-400"
                                >
                                  Renew
                                </ConfirmActionButton>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {showIssueModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-indigo-900">Issue Book</h2>
              {books.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">No available books.</p>
                  <button
                    onClick={() => setShowIssueModal(false)} 
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onIssue)} className="space-y-4">
                  {(user?.role === 'ADMIN' || user?.role === 'LIBRARIAN') && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Select User *</label>
                      <select 
                        {...register('userId')} 
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" 
                        required
                      >
                        <option value="">Choose a user</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.email}) - {u.role}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Book *</label>
                    <select 
                      {...register('bookId')} 
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" 
                      required
                    >
                      <option value="">Choose a book</option>
                      {books.map((book) => (
                        <option key={book.id} value={book.id}>
                          {book.title} - {book.author} ({book.availableCopies} available)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <p className="text-sm text-indigo-900 font-medium">Lending Policy:</p>
                    <ul className="text-sm text-gray-700 mt-2 space-y-1">
                      <li>• Borrowing Period: 14 days</li>
                      <li>• Max Renewals: 1 (7 days extension)</li>
                      <li>• Fine: ₹10 per overdue day</li>
                    </ul>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-semibold disabled:bg-gray-400"
                    >
                      {loading ? 'Issuing...' : 'Issue Book'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setShowIssueModal(false); reset(); }} 
                      className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
