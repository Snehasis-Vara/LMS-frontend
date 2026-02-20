'use client';

import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import ChangePasswordModal from './ChangePasswordModal';

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showChangePassword, setShowChangePassword] = useState(false);

  if (!user || pathname === '/login' || pathname === '/register') return null;

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  const avatarUrl = user.profileImage
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${user.profileImage}`
    : undefined;

  return (
    <>
      <header className="bg-white shadow-md border-b-2 border-indigo-200 fixed top-0 right-0 left-64 z-10">
        <div className="px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-indigo-900">
            {pathname === '/dashboard' && 'Dashboard'}
            {pathname === '/books' && 'Books Management'}
            {pathname === '/inventory' && 'Inventory Management'}
            {pathname === '/transactions' && 'Transactions'}
            {pathname === '/users' && 'User Management'}
            {pathname === '/profile' && 'Profile'}
            {pathname === '/profile/edit' && 'Edit Profile'}
          </h2>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 font-medium">{user.email}</span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="w-10 h-10 rounded-full cursor-pointer">
                  <AvatarImage src={avatarUrl} alt={user.name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/profile/edit')}>
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowChangePassword(true)}>
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <ChangePasswordModal open={showChangePassword} onClose={() => setShowChangePassword(false)} />
    </>
  );
}
