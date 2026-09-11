import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// Dummy middleware for Phase 1.0 until auth is hooked up in Phase 1.1
export function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
