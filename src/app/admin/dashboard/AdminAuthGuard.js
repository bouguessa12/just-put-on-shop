'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabaseClient';
import { isAdmin } from '@/app/hooks/useAuth';

export default function AdminAuthGuard({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      const { data } = await getCurrentUser();
      const user = data?.user;
      if (!user) {
        router.replace('/admin/login');
        return;
      }
      const admin = await isAdmin(user.id);
      if (!admin) {
        router.replace('/admin/login');
        return;
      }
      setLoading(false);
    }
    check();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Checking admin access...</div>;
  }

  return <>{children}</>;
} 