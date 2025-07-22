'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }) {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('isAdmin') !== 'true') {
        router.replace('/admin/login');
      }
    }
  }, [router]);
  return <>{children}</>;
}

