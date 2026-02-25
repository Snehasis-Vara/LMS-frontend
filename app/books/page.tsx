'use client';

import { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Book } from '@/types';
import { useForm } from 'react-hook-form';
import { ConfirmActionButton } from '@/components/ConfirmActionButton';

export default function BooksPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasOpenedModalForNewBook, setHasOpenedModalForNewBook] = useState(false);
  const [pagination, setPagination] = useState({ skip: 0, limit: 3, total: 0, hasMore: true });
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchBooks = async (searchTerm: string = '', skipValue: number = 0) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        skip: skipValue.toString(),
        limit: '3'
      }).toString();
      
      const response = await api.get(`/books?${params}`);
      setBooks(response.data.data || []);
      setPagination({
        skip: response.data.skip || 0,
        limit: 3,
        total: response.data.total || 0,
        hasMore: response.data.hasMore || false
      });
      setError('');
    } catch (err) {
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(search, 0);
  }, [search]);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      if (editingBook) {
        await api.patch(`/books/${editingBook.id}`, {
          ...data,
          publishedYear: parseInt(data.publishedYear)
        });
      } else {
        await api.post('/books', {
          ...data,
          publishedYear: parseInt(data.publishedYear)
        });
      }
      await fetchBooks(search, pagination.skip);
      setShowModal(false);
      reset();
      setEditingBook(null);
      setHasOpenedModalForNewBook(false);
      alert(editingBook ? 'Book updated successfully!' : 'Book added successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save book');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setValue('title', book.title);
    setValue('author', book.author);
    setValue('isbn', book.isbn);
    setValue('category', book.category);
    setValue('publishedYear', book.publishedYear);
    setShowModal(true);
  };

  const handleDelete = async (id: string, title: string) => {
    try {
      await api.delete(`/books/${id}`);
      await fetchBooks(search, pagination.skip);
      alert('Book deleted successfully!');
    } catch (error) {
      alert('Failed to delete book');
    }
  };

  // Group books by title and count
  const bookGroups = books.reduce((acc, book) => {
    const key = book.title.toLowerCase();
    if (!acc[key]) {
      acc[key] = { book, count: 0 };
    }
    acc[key].count += book.copies?.length || 0;
    return acc;
  }, {} as Record<string, { book: Book; count: number }>);

  const uniqueBooks = Object.values(bookGroups);

  const openIssueModal = () => {
    setShowModal(true);
    setEditingBook(null);
    reset();
    setHasOpenedModalForNewBook(false); // Reset for new book
  };

  const openAddNewBookModal = () => {
    setShowModal(true);
    setEditingBook(null);
    reset();
    setHasOpenedModalForNewBook(false); // Reset for new book
  };

  return (
    <ProtectedRoute>
      <div>
        <div className="flex justify-between items-center mb-6">
          {user?.role === 'ADMIN' && (
            <button
              onClick={openAddNewBookModal}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 shadow-md transition"
            >
              + Add New Book
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Search by title, author, or ISBN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600"
        />
        
        {/* Scroll loading indicator */}
        {loading && books.length > 0 && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-50">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          </div>
        )}
        
        {loading && books.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading books...</p>
          </div>
        ) : uniqueBooks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg">No books found</p>
            {user?.role === 'ADMIN' && (
              <button
                onClick={() => { setShowModal(true); setEditingBook(null); reset(); }}
                className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                Add Your First Book
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uniqueBooks.map(({ book, count }) => (
              <div key={book.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-indigo-900">{book.title}</h3>
                  {count > 0 && (
                    <span className="bg-indigo-100 text-indigo-800 text-sm font-bold px-3 py-1 rounded-full">
                      {count} {count === 1 ? 'copy' : 'copies'}
                    </span>
                  )}
                </div>
                <p className="text-gray-700 mb-1"><span className="font-medium">Author:</span> {book.author}</p>
                <p className="text-gray-700 mb-1"><span className="font-medium">ISBN:</span> {book.isbn}</p>
                <p className="text-gray-700 mb-1"><span className="font-medium">Category:</span> {book.category}</p>
                <p className="text-gray-700 mb-4"><span className="font-medium">Year:</span> {book.publishedYear}</p>
                
                {user?.role === 'ADMIN' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(book)}
                      className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <ConfirmActionButton
                      action="delete"
                      itemName={book.title}
                      onConfirm={() => handleDelete(book.id, book.title)}
                      className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </ConfirmActionButton>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-indigo-900">
                {!hasOpenedModalForNewBook ? 'Add New Book' : 'Edit Book'}
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                  <input 
                    {...register('title', { required: 'Title is required' })} 
                    placeholder="Enter book title" 
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-600" 
                  />
                  {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message as string}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Author *</label>
                  <input 
                    {...register('author', { required: 'Author is required' })} 
                    placeholder="Enter author name" 
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-600" 
                  />
                  {errors.author && <p className="text-red-600 text-sm mt-1">{errors.author.message as string}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">ISBN *</label>
                  <input 
                    {...register('isbn', { required: 'ISBN is required' })} 
                    placeholder="Enter ISBN number" 
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-600" 
                  />
                  {errors.isbn && <p className="text-red-600 text-sm mt-1">{errors.isbn.message as string}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                  <input 
                    {...register('category', { required: 'Category is required' })} 
                    placeholder="Enter category" 
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-600" 
                  />
                  {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category.message as string}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Published Year *</label>
                  <input 
                    {...register('publishedYear', { 
                      required: 'Year is required',
                      min: { value: 1000, message: 'Invalid year' },
                      max: { value: new Date().getFullYear(), message: 'Year cannot be in future' }
                    })} 
                    type="number" 
                    placeholder="Enter published year" 
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-600" 
                  />
                  {errors.publishedYear && <p className="text-red-600 text-sm mt-1">{errors.publishedYear.message as string}</p>}
                </div>
                
                <div className="flex gap-2 pt-2">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-semibold disabled:bg-gray-400"
                  >
                    {loading ? 'Saving...' : 'Save Book'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setShowModal(false); reset(); setEditingBook(null); }} 
                    className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Pagination Controls */}
        {pagination.total > 3 && (
          <div className="flex justify-center items-center gap-4 mt-8 bg-white p-4 rounded-lg shadow">
            <button
              onClick={() => fetchBooks(search, pagination.skip - 3)}
              disabled={pagination.skip === 0}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
            >
              ← Previous
            </button>
            
            <span className="text-gray-700 font-medium">
              Showing {pagination.skip + 1}-{Math.min(pagination.skip + 3, pagination.total)} of {pagination.total}
            </span>
            
            <button
              onClick={() => fetchBooks(search, pagination.skip + 3)}
              disabled={!pagination.hasMore}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
