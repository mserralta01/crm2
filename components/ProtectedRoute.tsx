"use client";

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  adminOnly = false 
}: ProtectedRouteProps) {
  const { currentUser, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If not authenticated, redirect to login
      if (!currentUser) {
        router.push('/auth/login');
      } 
      // If admin-only route and user is not admin, redirect to unauthorized
      else if (adminOnly && !isAdmin) {
        router.push('/unauthorized');
      }
    }
  }, [currentUser, loading, adminOnly, isAdmin, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated or not admin (when required), don't render children
  if (!currentUser || (adminOnly && !isAdmin)) {
    return null;
  }

  // Render children if authenticated and has proper permissions
  return <>{children}</>;
} 