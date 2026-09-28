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
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAdminAuthStore } from '../../store/adminAuthStore';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Products Catalog', href: '/products', icon: ShoppingBag },
  { name: 'Categories', href: '/categories', icon: FolderTree },
  { name: 'Orders & Dispatch', href: '/orders', icon: Package },
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
      className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#FAF7F2] border-r border-[#EAE1D1] flex flex-col justify-between h-screen transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-[2px_0_12px_rgba(0,0,0,0.02)] lg:static lg:w-64 lg:h-screen lg:sticky lg:top-0 lg:flex-shrink-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="p-5 sm:p-6 space-y-6 sm:space-y-8 overflow-y-auto">
        {/* Brand Header with Mobile Close Button */}
        <div className="flex items-center justify-between">
          <Link href="/" onClick={handleLinkClick} className="flex items-center gap-3 group">
            <div className="w-11 h-11 relative flex-shrink-0 drop-shadow-md group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/images/nalmara_emblem.png"
                alt="NALMARA"
                width={44}
                height={44}
                priority
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black uppercase tracking-wider text-[#18140B] font-serif truncate">
                  NALMARA
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100/90 text-amber-900 border border-amber-300 font-mono tracking-wider">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] text-[#7A6E63] font-medium tracking-wide">
                Operations Console
              </p>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#6B6055] hover:text-[#18140B] hover:bg-[#F2ECE3] lg:hidden transition-colors"
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
                    ? 'bg-white text-[#18140B] font-semibold shadow-sm border border-[#E0D5C3]'
                    : 'text-[#5C5248] hover:text-[#18140B] hover:bg-[#F2ECE3]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#B8860B]' : 'text-[#7A6E63]'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Area */}
      <div className="p-6 border-t border-[#EAE1D1] space-y-4 bg-[#FAF7F2]">
        <a
          href={storefrontUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white hover:bg-[#F5EFEB] border border-[#EAE1D1] text-[11px] font-medium text-[#4A4036] hover:text-[#18140B] transition-colors shadow-xs"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-[#B8860B]" /> View Storefront
          </span>
          <span className="text-[10px] bg-[#F5EFEB] text-[#7A6E63] px-1.5 py-0.5 rounded font-mono border border-[#E0D5C3]">
            :3000
          </span>
        </a>

        {user && (
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#F5EFEB] text-[#B8860B] flex items-center justify-center font-bold text-xs flex-shrink-0 border border-[#E0D5C3] shadow-xs">
                {user.firstName[0]}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#18140B] truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[10px] text-[#7A6E63] truncate">{user.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[#7A6E63] hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
