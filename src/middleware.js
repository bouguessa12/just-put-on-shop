import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// List of allowed admin emails
const ADMIN_EMAILS = [
  'mohamedalaabouguessa@gmail.com',
  // Add more admin emails here
];

export async function middleware(req) {
  const res = NextResponse.next();

  // TEMPORARILY DISABLE ALL MIDDLEWARE CHECKS
  // const supabase = createServerClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL,
  //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  //   {
  //     cookies: {
  //       get(name) {
  //         return req.cookies.get(name)?.value;
  //       },
  //       set(name, value, options) {
  //         req.cookies.set({ name, value, ...options });
  //         res.cookies.set({ name, value, ...options });
  //       },
  //       remove(name, options) {
  //         req.cookies.set({ name, value: '', ...options });
  //         res.cookies.set({ name, value: '', ...options });
  //       },
  //     },
  //   }
  // );

  // const {
  //   data: { session },
  // } = await supabase.auth.getSession();

  // // If not authenticated, redirect to login
  // if (
  //   req.nextUrl.pathname.startsWith('/admin') &&
  //   req.nextUrl.pathname !== '/admin/login' &&
  //   !session
  // ) {
  //   const redirectUrl = req.nextUrl.clone();
  //   redirectUrl.pathname = '/admin/login';
  //   return NextResponse.redirect(redirectUrl);
  // }

  // // If authenticated but not an admin, redirect to home
  // if (
  //   req.nextUrl.pathname.startsWith('/admin') &&
  //   req.nextUrl.pathname !== '/admin/login' &&
  //   session &&
  //   (!session.user || !ADMIN_EMAILS.includes(session.user.email))
  // ) {
  //   const redirectUrl = req.nextUrl.clone();
  //   redirectUrl.pathname = '/';
  //   return NextResponse.redirect(redirectUrl);
  // }

  // // If on login page and already authenticated as admin, redirect to dashboard
  // if (
  //   req.nextUrl.pathname === '/admin/login' &&
  //   session &&
  //   session.user &&
  //   ADMIN_EMAILS.includes(session.user.email)
  // ) {
  //   const redirectUrl = req.nextUrl.clone();
  //   redirectUrl.pathname = '/admin/dashboard';
  //   return NextResponse.redirect(redirectUrl);
  // }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
}; 