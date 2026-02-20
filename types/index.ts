export type Role = 'ADMIN' | 'LIBRARIAN' | 'STUDENT';
export type BookCopyStatus = 'AVAILABLE' | 'ISSUED' | 'LOST';
export type TransactionStatus = 'ISSUED' | 'RETURNED' | 'OVERDUE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDto {
  name?: string;
  email?: string;
  phone?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publishedYear: number;
  totalCopies: number;
  availableCopies: number;
  createdAt: string;
  updatedAt: string;
  copies?: BookCopy[];
}

export interface BookCopy {
  id: string;
  bookId: string;
  status: BookCopyStatus;
  createdAt: string;
  updatedAt: string;
  book?: Book;
}

export interface Transaction {
  id: string;
  userId: string;
  bookCopyId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: TransactionStatus;
  renewCount: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  bookCopy?: BookCopy;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}
