import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for a protected route
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Get the authentication token from the cookies
    const token = request.cookies.get('auth-token')?.value;
    const userRole = request.cookies.get('user-role')?.value;
    
    // If no token is found, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    // If token exists but user is not an admin, redirect to unauthorized page
    // Only for admin-specific routes
    if (request.nextUrl.pathname.startsWith('/dashboard/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    // If token exists, allow the request to proceed
    // In a real application, you would verify the token's validity here
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};