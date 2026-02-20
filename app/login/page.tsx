'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      await login(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 ml-0">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border-t-4 border-indigo-600">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">📚</div>
          <h1 className="text-3xl font-bold text-indigo-900">Library Management</h1>
          <p className="text-gray-600 mt-2">Government Portal</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              {...register('password')}
              type="password"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
              placeholder="Enter your password"
            />
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 font-semibold transition shadow-md"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/forgot-password" className="text-indigo-600 hover:underline font-medium">
            Forgot Password?
          </Link>
        </div>

        <p className="text-center mt-4 text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-indigo-600 hover:underline font-semibold">
            Register
          </Link>
        </p>

        <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <p className="font-semibold text-indigo-900 mb-2 text-sm">Demo Credentials:</p>
          <p className="text-gray-700 text-sm">Email: admin@lms.com</p>
          <p className="text-gray-700 text-sm">Password: admin123</p>
        </div>
      </div>
    </div>
  );
}
