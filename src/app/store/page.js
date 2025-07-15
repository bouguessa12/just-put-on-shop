export const dynamic = 'force-dynamic';
export const ssr = false;

import { redirect } from 'next/navigation';

export default function StorePage() {
  // Force client-side redirect
  if (typeof window !== 'undefined') {
    window.location.href = '/store/client';
    return null;
  }
  
  // Server-side redirect
  redirect('/store/client');
}
