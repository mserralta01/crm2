import { cookies } from 'next/headers';
import { User } from 'firebase/auth';
import { UserRole } from '@/contexts/AuthContext';

// Set authentication cookies
export const setAuthCookies = (user: User, role: UserRole) => {
  // Get the cookies store
  const cookieStore = cookies();
  
  // Set the auth token cookie (Firebase ID token)
  cookieStore.set('auth-token', user.uid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });
  
  // Set the user role cookie
  cookieStore.set('user-role', role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });
};

// Clear authentication cookies
export const clearAuthCookies = () => {
  const cookieStore = cookies();
  
  cookieStore.delete('auth-token');
  cookieStore.delete('user-role');
};

// Get authentication cookies
export const getAuthCookies = () => {
  const cookieStore = cookies();
  
  return {
    token: cookieStore.get('auth-token')?.value,
    role: cookieStore.get('user-role')?.value as UserRole | undefined,
  };
}; 