'use client';

import React from 'react';
import Link from 'next/link';
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

export const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAdminAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3000';

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col justify-between h-screen sticky top-0 flex-shrink-0">
      <div className="p-6 space-y-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-zinc-950 flex items-center justify-center font-black text-sm shadow-md">
            EF
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-wider text-white">
              EFFIDOO <span className="text-amber-400 font-mono">CORE</span>
            </h1>
            <p className="text-[10px] text-zinc-400 font-medium">Executive Admin Console</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 text-xs">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-800/90 text-white font-semibold shadow-sm border border-zinc-700/50'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Area */}
      <div className="p-6 border-t border-zinc-900 space-y-4">
        <a
          href={storefrontUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 text-[11px] font-medium text-zinc-300 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" /> View Storefront
          </span>
          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">
            :3000
          </span>
        </a>

        {user && (
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-zinc-800 text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-zinc-700">
                {user.firstName[0]}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-200 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
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
