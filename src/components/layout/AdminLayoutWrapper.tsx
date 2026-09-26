'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import { ToastProvider } from '../ui/ToastProvider';
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
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-zinc-900">
        <ToastProvider />
        {children}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-[#8C7E72] text-xs">
        Authenticating administrator...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-zinc-900 flex">
      <ToastProvider />
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto bg-[#FAF8F5]">
        <div className="p-8 sm:p-10 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};
