import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin routes: require ADMIN role
    if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
      if (!token || (token as any).role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
    }

    // Admin API routes: require ADMIN role
    if (path.startsWith('/api/admin')) {
      if (!token || (token as any).role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        // Public routes
        if (
          path === '/' ||
          path === '/login' ||
          path === '/admin/login' ||
          path.startsWith('/scan') ||
          path.startsWith('/api/auth')
        ) {
          return true
        }
        // Protected customer routes need any session
        if (path === '/wallet' || path === '/shop') {
          return !!token
        }
        // Admin routes handled in middleware function above
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/wallet', '/shop'],
}
