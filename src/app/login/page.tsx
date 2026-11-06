'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, Mail, ShieldCheck, Loader2 } from 'lucide-react';
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
        toast.success(`Welcome back, ${user.firstName}!`);
        router.push('/');
      }
    } catch (error: any) {
      toast.error(error.customMessage || 'Invalid administrator credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FDF6EC]">
      <div className="max-w-md w-full rounded-3xl p-[2.5px] bg-gradient-to-b from-[#FFE59E] via-[#D4AF37] to-[#8C5818] shadow-[0_22px_54px_rgba(45,6,30,0.16)]">
        <div className="bg-gradient-to-b from-[#FFFDF9] via-[#FAF0DD] to-[#F3E0C0] rounded-[22px] p-8 sm:p-10 space-y-7 relative">
          <div className="absolute inset-2.5 rounded-[16px] border border-[#D4AF37]/35 pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-3 relative z-10">
            <div className="w-20 h-20 mx-auto relative rounded-full overflow-hidden border-2 border-[#D4AF37] bg-[#0E0B09] shadow-md">
              <Image
                src="/images/nalmara-logo.jpg"
                alt="NALMARA FASHION"
                width={80}
                height={80}
                priority
                unoptimized
                className="w-full h-full object-cover scale-[1.35]"
              />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-wider text-[#23120B] font-serif">
                NALMARA FASHION{' '}
                <span className="text-[#681145] font-mono text-sm font-bold">ADMIN</span>
              </h1>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#380725] border border-[#D4AF37] text-[#FFE59E] text-[10px] font-bold tracking-wider uppercase font-mono mt-2 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FFE59E]" />
                Operations Command Center
              </div>
            </div>
            <p className="text-xs text-[#5C3D1E] pt-0.5 font-medium">
              Authorized Storefront &amp; Catalog Management Portal
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#23120B] mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C6518] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter administrator email"
                  className="w-full bg-[#FFFDF9] border border-[#D4AF37]/75 rounded-xl py-3 pl-10 pr-4 text-sm text-[#23120B] placeholder-[#8C7E72] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#23120B] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C6518] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#FFFDF9] border border-[#D4AF37]/75 rounded-xl py-3 pl-10 pr-4 text-sm text-[#23120B] placeholder-[#8C7E72] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#5B0E3D] via-[#3D0829] to-[#5B0E3D] hover:from-[#73124C] hover:to-[#4E0B34] text-[#FFE59E] border border-[#D4AF37] py-3.5 rounded-full text-xs font-serif font-bold uppercase tracking-[0.18em] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-4 active:scale-[0.99] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#FFE59E]" />
                  Authenticating...
                </>
              ) : (
                'Sign In to Admin Console'
              )}
            </button>
          </form>

          <div className="text-center pt-1 text-[11px] text-[#6B5035] relative z-10">
            NALMARA FASHION • Thoothukudi, Tamil Nadu
          </div>
        </div>
      </div>
    </div>
  );
}
