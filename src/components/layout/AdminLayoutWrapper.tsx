'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import { useAdminAuthStore } from '../../store/adminAuthStore';

export const AdminLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAdminAuthStore();

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    const verify = async () => {
      const valid = await checkAuth();
      if (!valid && !isLoginPage) {
        router.push('/login');
      }
    };
    verify();
  }, [checkAuth, isLoginPage, router]);

  if (isLoginPage) {
    return <div className="min-h-screen bg-zinc-950 text-zinc-100">{children}</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 text-xs">
        Authenticating administrator...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto bg-zinc-900/30">
        <div className="p-8 sm:p-10 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};
