'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldCheck, Loader2, KeyRound } from 'lucide-react';
import { api } from '../../lib/api';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setUser } = useAdminAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success && res.data.data?.user) {
        const user = res.data.data.user;
        if (user.role !== 'admin') {
          toast.error('Access Denied: Administrator privileges required');
          setIsLoading(false);
          return;
        }

        if (res.data.data?.token) {
          localStorage.setItem('admin_token', res.data.data.token);
        }

        setUser(user);
        toast.success(`Welcome to Command, ${user.firstName}!`);
        router.push('/');
      }
    } catch (error: any) {
      toast.error(error.customMessage || 'Invalid administrator credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail('admin@ecommerce.com');
    setPassword('Admin@123456');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAF8F5]">
      <div className="max-w-md w-full bg-white border border-[#EAE1D1] rounded-3xl p-8 sm:p-10 shadow-xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D4AF37] via-[#B8860B] to-[#996D00] text-white flex items-center justify-center font-black text-lg mx-auto mb-4 shadow-md tracking-wider">
            EF
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-[#18140B]">
            EFFIDOO <span className="text-[#B8860B] font-mono">ADMIN</span>
          </h1>
          <p className="text-xs text-[#7A6E63]">
            Internal Operations & Systems Management Portal
          </p>
        </div>

        {/* Quick Fill Button */}
        <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE1D1] text-xs flex items-center justify-between">
          <div>
            <span className="font-bold text-[#18140B] block">Master Admin Access</span>
            <span className="text-[11px] text-[#7A6E63] font-mono">admin@ecommerce.com</span>
          </div>
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="px-3 py-1.5 bg-white hover:bg-[#F5EFEB] border border-[#E0D5C3] text-[#B8860B] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <KeyRound className="w-3.5 h-3.5" /> Auto-Fill
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5C5248] mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8C7E72] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ecommerce.com"
                className="w-full bg-[#FAF8F5] border border-[#E0D5C3] rounded-xl py-3 pl-10 pr-4 text-sm text-[#18140B] placeholder-[#9E9488] focus:outline-none focus:border-[#B8860B] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5C5248] mb-1.5">
              Secure Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8C7E72] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FAF8F5] border border-[#E0D5C3] rounded-xl py-3 pl-10 pr-4 text-sm text-[#18140B] placeholder-[#9E9488] focus:outline-none focus:border-[#B8860B] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#D4AF37] via-[#C5A262] to-[#B8860B] hover:brightness-105 text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-4 active:scale-[0.99]"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enter Operations Console'}
          </button>
        </form>

        <div className="text-center pt-2 text-[11px] text-[#7A6E63]">
          Security Level: Tier 1 Administrative Gateway
        </div>
      </div>
    </div>
  );
}
