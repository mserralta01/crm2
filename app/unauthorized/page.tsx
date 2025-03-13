"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="max-w-md w-full p-8 bg-background border rounded-lg shadow-lg">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-destructive/10 rounded-full">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight">Access Denied</h1>
          
          <p className="text-muted-foreground">
            You don't have permission to access this page. This area is restricted to administrators only.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full pt-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => router.push('/dashboard')}
            >
              Go to Dashboard
            </Button>
            
            <Button 
              className="w-full gradient-bg" 
              onClick={() => router.push('/')}
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 