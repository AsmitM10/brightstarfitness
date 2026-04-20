import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminSession = request.cookies.get('admin_session')
    
    if (!adminSession) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Protect user dashboard routes
  if (pathname.startsWith('/dashboard/')) {
    const userSession = request.cookies.get('user_session')
    
    if (!userSession) {
      // No session cookie - redirect to home with login prompt
      const response = NextResponse.redirect(new URL('/?login=required', request.url))
      return response
    }

    // Verify JWT token
    try {
      const { payload } = await jwtVerify(userSession.value, JWT_SECRET)
      
      // Extract slug from URL path
      const urlSlug = pathname.split('/dashboard/')[1]?.split('/')[0]
      
      // Verify user is accessing their own dashboard
      if (payload.slug !== urlSlug) {
        // User trying to access someone else's dashboard
        const response = NextResponse.redirect(new URL('/?error=unauthorized', request.url))
        return response
      }
      
      // Valid session and authorized - allow access
      return NextResponse.next()
    } catch (error) {
      // Invalid or expired token
      const response = NextResponse.redirect(new URL('/?login=expired', request.url))
      // Clear invalid cookie
      response.cookies.delete('user_session')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
  ],
}
