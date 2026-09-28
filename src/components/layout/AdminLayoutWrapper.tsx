'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, ExternalLink } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { ToastProvider } from '../ui/ToastProvider';
import { useAdminAuthStore } from '../../store/adminAuthStore';

export const AdminLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, checkAuth } = useAdminAuthStore();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3000';

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
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center gap-3 text-[#8C7E72] text-xs">
        <Image
          src="/images/nalmara_emblem.png"
          alt="Nalmara"
          width={44}
          height={44}
          className="w-11 h-11 object-contain animate-pulse"
        />
        <span>Authenticating administrator...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-zinc-900 flex flex-col lg:flex-row">
      <ToastProvider />

      {/* Mobile Backdrop Overlay */}
      {isMobileNavOpen && (
        <div
          onClick={() => setIsMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Admin Sidebar (Slide-over drawer on mobile, static on desktop) */}
      <AdminSidebar
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Top Navbar (Hidden on lg screens) */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EAE1D1] lg:hidden shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="p-2 rounded-xl text-[#5C5248] hover:text-[#18140B] hover:bg-[#F2ECE3] border border-[#EAE1D1] bg-white transition-colors shadow-xs"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 relative flex-shrink-0 drop-shadow-xs">
                <Image
                  src="/images/nalmara_emblem.png"
                  alt="NALMARA"
                  width={28}
                  height={28}
                  priority
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-[#18140B] font-serif">
                  NALMARA
                </span>
                <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-mono">
                  ADMIN
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white hover:bg-[#F5EFEB] border border-[#EAE1D1] text-[#7A6E63] hover:text-[#18140B] transition-colors"
              title="View Storefront"
            >
              <ExternalLink className="w-4 h-4 text-[#B8860B]" />
            </a>

            {user && (
              <div className="w-8 h-8 rounded-full bg-[#F5EFEB] text-[#B8860B] flex items-center justify-center font-bold text-xs border border-[#E0D5C3] shadow-xs">
                {user.firstName[0]}
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area with Adaptive Padding */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-7xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
