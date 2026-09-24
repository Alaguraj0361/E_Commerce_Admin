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
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-zinc-950 flex items-center justify-center font-black text-lg mx-auto mb-4 shadow-lg">
            EF
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white">
            EFFIDOO <span className="text-amber-400 font-mono">CORE</span>
          </h1>
          <p className="text-xs text-zinc-400">
            Internal Operations & Systems Management Portal
          </p>
        </div>

        {/* Quick Fill Button */}
        <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800/80 text-xs flex items-center justify-between">
          <div>
            <span className="font-bold text-zinc-200 block">Master Admin Access</span>
            <span className="text-[11px] text-zinc-400 font-mono">admin@ecommerce.com</span>
          </div>
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5" /> Auto-Fill
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ecommerce.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Secure Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enter Operations Console'}
          </button>
        </form>

        <div className="text-center pt-2 text-[11px] text-zinc-400">
          Security Level: Tier 1 Administrative Gateway
        </div>
      </div>
    </div>
  );
}
