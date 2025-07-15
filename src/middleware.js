import { NextResponse } from 'next/server'

export async function middleware(req) {
  // AUTH DISABLED: Allow all requests for debugging
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
} 