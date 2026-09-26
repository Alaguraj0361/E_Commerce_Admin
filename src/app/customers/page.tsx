'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  Shield,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { User } from '../../types';
import { toast } from 'sonner';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/customers');
      if (res.data?.success) {
        setCustomers(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load customer directory');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      const email = c.email.toLowerCase();
      const query = searchQuery.toLowerCase();
      return fullName.includes(query) || email.includes(query);
    });
  }, [customers, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#18140B] flex items-center gap-3">
            Customer Directory
            <span className="text-xs font-mono font-normal bg-[#F5EFEB] text-[#18140B] border border-[#EAE1D1] text-[#3D342B] px-2 py-0.5 rounded-full">
              {customers.length} Profiles
            </span>
          </h1>
          <p className="text-xs text-[#6B6055] mt-1">
            Registered customer accounts, verified emails, and client activity logs.
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          className="p-2.5 rounded-xl border border-[#EAE1D1] hover:border-[#EAE1D1] bg-white text-[#6B6055] hover:text-[#18140B] transition-colors self-start sm:self-auto"
          title="Refresh List"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter and Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 bg-white border border-[#EAE1D1] p-4 rounded-2xl flex items-center">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#8C7E72] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customers by name or email address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#EAE1D1] text-[#2D2319] text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#B8860B]/50 transition-colors"
            />
          </div>
        </div>

        <div className="bg-white border border-[#EAE1D1] p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-[#B8860B] flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[#6B6055] font-semibold uppercase tracking-wider">
              Registered Clients
            </p>
            <p className="text-lg font-black text-[#18140B] font-mono">{customers.length}</p>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-[#EAE1D1] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#3D342B]">
            <thead className="bg-[#FAF7F2] text-[#6B6055] font-semibold border-b border-[#EAE1D1] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Account Type</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE1D1]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#8C7E72]">
                    {isLoading ? 'Loading customer records...' : 'No customers found.'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id || (cust as any)._id}
                    className="hover:bg-[#FAF7F2]/60 transition-colors group"
                  >
                    {/* Name & Initials */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 text-[#B8860B] flex items-center justify-center font-bold text-xs border border-[#EAE1D1] flex-shrink-0">
                          {cust.firstName?.[0] || 'C'}
                        </div>
                        <div>
                          <p className="font-bold text-[#18140B] text-xs">
                            {cust.firstName} {cust.lastName}
                          </p>
                          <span className="text-[10px] text-[#8C7E72] font-mono">
                            ID: {(cust.id || (cust as any)._id)?.slice(-8)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-[#3D342B]">
                        <Mail className="w-3.5 h-3.5 text-[#8C7E72]" />
                        <span>{cust.email}</span>
                      </div>
                      {cust.phone && (
                        <div className="flex items-center gap-1.5 text-[#6B6055] font-mono text-[11px]">
                          <Phone className="w-3.5 h-3.5 text-[#8C7E72]" />
                          <span>{cust.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* Account Type */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#F5EFEB] text-[#18140B] border border-[#EAE1D1] text-[#3D342B] border border-[#EAE1D1]">
                        <Shield className="w-3 h-3 text-[#B8860B]" /> Customer
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="py-3.5 px-4 text-[#6B6055] text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#8C7E72]" />
                        <span>{formatDate(cust.createdAt)}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Verified
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
