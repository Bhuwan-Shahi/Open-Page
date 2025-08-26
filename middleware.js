import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Public routes that don't need authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/books',
    '/api/books',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/verify-otp',
    '/api/auth/resend-otp'
  ]

  // Admin-only routes
  const adminRoutes = [
    '/admin'
  ]

  // Protected routes (require authentication)
  const protectedRoutes = [
    '/cart',
    '/checkout',
    '/profile',
    '/orders'
  ]

  // Check if route is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Get token from cookies
  const token = request.cookies.get('authToken')?.value

  if (!token) {
    // Redirect to login for protected routes
    if (protectedRoutes.some(route => pathname.startsWith(route)) || 
        adminRoutes.some(route => pathname.startsWith(route))) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Check admin routes
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (decoded.role !== 'ADMIN') {
        // Redirect non-admin users to home
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', decoded.userId)
    requestHeaders.set('x-user-email', decoded.email)
    requestHeaders.set('x-user-role', decoded.role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    // Invalid token - clear it and redirect to login for protected routes
    const response = protectedRoutes.some(route => pathname.startsWith(route)) || 
                    adminRoutes.some(route => pathname.startsWith(route))
      ? NextResponse.redirect(new URL('/login', request.url))
      : NextResponse.next()
    
    response.cookies.delete('authToken')
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
