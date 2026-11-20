'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  Package,
  Tag,
  Users,
  MessageSquareQuote,
  ExternalLink,
  LogOut,
  X,
  Scissors,
  Ruler,
  Sliders,
} from 'lucide-react';
import { useAdminAuthStore } from '../../store/adminAuthStore';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Products Catalog', href: '/products', icon: ShoppingBag },
  { name: 'Categories', href: '/categories', icon: FolderTree },
  { name: 'Orders & Dispatch', href: '/orders', icon: Package },
  { name: 'Stitching & Dispatch', href: '/stitching/dispatch', icon: Scissors, badge: 'Atelier' },
  { name: 'Customer Measurements', href: '/stitching/measurements', icon: Ruler },
  { name: 'Stitching Categories', href: '/stitching/categories', icon: Sliders },
  { name: 'Promotions & Coupons', href: '/coupons', icon: Tag },
  { name: 'Customer Database', href: '/customers', icon: Users },
  { name: 'Review Moderation', href: '/reviews', icon: MessageSquareQuote },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AdminSidebar = ({ isOpen = false, onClose }: AdminSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAdminAuthStore();

  const handleLogout = async () => {
    await logout();
    if (onClose) onClose();
    router.push('/login');
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3000';

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-gradient-to-b from-[#280619] via-[#340721] to-[#220415] border-r-2 border-[#D4AF37]/80 flex flex-col justify-between h-screen transition-transform duration-300 ease-in-out shadow-2xl lg:static lg:w-64 lg:h-screen lg:sticky lg:top-0 lg:flex-shrink-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="p-5 sm:p-6 space-y-6 sm:space-y-8 overflow-y-auto">
        {/* Brand Header with Mobile Close Button */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/30">
          <Link href="/" onClick={handleLinkClick} className="flex items-center gap-3 group">
            <div className="w-11 h-11 relative rounded-full overflow-hidden border-2 border-[#D4AF37] bg-[#16020D] flex-shrink-0 shadow-[0_4px_14px_rgba(212,175,55,0.3)] group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/images/nalmara-logo.jpg"
                alt="NALMARA"
                width={44}
                height={44}
                priority
                unoptimized
                className="w-full h-full object-cover scale-[1.35]"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black uppercase tracking-wider text-[#FFFDF9] font-serif truncate">
                  NALMARA
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-[#FFF6D6] to-[#D4AF37] text-[#280619] font-mono tracking-wider">
                  ROYAL
                </span>
              </div>
              <p className="text-[10px] text-[#FFE59E]/80 font-medium tracking-wide">
                Operations Console
              </p>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#FFE59E] hover:bg-[#380725] lg:hidden transition-colors"
            title="Close navigation menu"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5 text-xs">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FFF6D6] via-[#FFE59E] to-[#D4AF37] text-[#280619] font-bold shadow-[0_6px_16px_rgba(212,175,55,0.28)] border border-[#FFFDF9]'
                    : 'text-[#FAF0DD]/80 hover:text-[#FFE59E] hover:bg-[#380725]/80 border border-transparent hover:border-[#D4AF37]/40'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#280619]' : 'text-[#D4AF37]'}`} />
                    <span>{item.name}</span>
                  </div>
                  {(item as any).badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        isActive
                          ? 'bg-[#280619] text-[#FFE59E]'
                          : 'bg-[#FFE59E]/20 text-[#FFE59E] border border-[#D4AF37]/40'
                      }`}
                    >
                      {(item as any).badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Area */}
      <div className="p-5 border-t border-[#D4AF37]/35 space-y-4 bg-[#1E0312]/80">
        <a
          href={storefrontUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#380725] hover:bg-[#4E0B34] border border-[#D4AF37]/70 text-[11px] font-semibold text-[#FFE59E] transition-colors shadow-xs"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" /> Live Storefront
          </span>
          <span className="text-[9.5px] bg-[#220415] text-[#FFE59E] px-1.5 py-0.5 rounded font-mono border border-[#D4AF37]/40">
            OPEN
          </span>
        </a>

        {user && (
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#FFE59E] to-[#D4AF37] text-[#280619] flex items-center justify-center font-bold text-xs flex-shrink-0 border border-[#FFFDF9] shadow-xs">
                {user.firstName?.[0] || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#FFFDF9] truncate">
                  {user.firstName || 'Admin'} {user.lastName || ''}
                </p>
                <p className="text-[10px] text-[#FAF0DD]/70 truncate">{user.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[#FFE59E]/80 hover:text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
