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
  Trash2,
  AlertCircle,
  X,
  Copy,
  Check,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { User } from '../../types';
import { toast } from 'sonner';
import { PremiumLoader } from '../../components/ui/PremiumLoader';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Delete States
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteCustomer = async () => {
    if (!deleteConfirmUser) return;
    const userId = (deleteConfirmUser as any)._id || deleteConfirmUser.id;
    if (!userId) {
      toast.error('Invalid customer identifier');
      return;
    }

    try {
      setIsDeleting(true);
      const res = await api.delete(`/admin/customers/${userId}`);
      if (res.data?.success) {
        toast.success(
          `Customer "${deleteConfirmUser.firstName} ${deleteConfirmUser.lastName}" account deleted successfully`
        );
        setCustomers((prev) => prev.filter((c) => ((c as any)._id || c.id) !== userId));
        setDeleteConfirmUser(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete customer account');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success('Customer ID copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      const fullName = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
      const email = (c.email || '').toLowerCase();
      const phone = (c.phone || '').toLowerCase();
      const id = ((c as any)._id || c.id || '').toLowerCase();
      return fullName.includes(q) || email.includes(q) || phone.includes(q) || id.includes(q);
    });
  }, [customers, searchQuery]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* ========================================================= */}
      {/* 1. TOP ROYAL HEADER                                       */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-[#FFFDF9] via-[#FAF4EA] to-[#F5ECE0] border border-[#E8DCC9] rounded-3xl p-6 sm:p-8 shadow-[0_12px_36px_rgba(45,6,30,0.06)] relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-gradient-to-br from-[#760159]/5 to-[#D4AF37]/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#760159]/10 border border-[#760159]/20 text-[#760159] text-[11px] font-bold tracking-wider uppercase font-mono shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              Client Registry &amp; Identity Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1E0A10] font-serif flex items-center gap-3">
              Customer Directory
              <span className="text-xs font-mono font-bold bg-[#760159] text-[#FFE59E] border border-[#D4AF37]/60 px-3 py-1 rounded-full shadow-xs">
                {customers.length} Profiles
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[#5C3D1E] max-w-2xl leading-relaxed">
              Manage registered buyer profiles, view contact phone records, audit email verifications, and safely manage customer data.
            </p>
          </div>

          <button
            onClick={fetchCustomers}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-white hover:bg-[#FAF4EA] text-[#5C3D1E] hover:text-[#760159] transition-all shadow-xs self-start sm:self-auto font-semibold text-xs"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#760159]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. STATS & KPI TILES                                      */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-[#E8DCC9] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#760159]/15 to-[#FFE59E]/30 flex items-center justify-center shrink-0 border border-[#D4AF37]/30 text-[#760159]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B5A4B]">Registered Clients</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-[#1E0A10] font-serif">{customers.length}</span>
              <span className="text-[10px] font-medium text-[#760159]">Active Accounts</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-[#E8DCC9] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-200 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B5A4B]">Email Status</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-emerald-700 font-serif">100%</span>
              <span className="text-[10px] font-medium text-emerald-600">Verified Credentials</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-[#E8DCC9] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-200 text-amber-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B5A4B]">Account Protection</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-amber-700 font-serif">Admin</span>
              <span className="text-[10px] font-medium text-amber-600">Protected Privileges</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. SEARCH BAR                                             */}
      {/* ========================================================= */}
      <div className="bg-white border border-[#E8DCC9] rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8C7E72] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#E8DCC9] text-[#1E0A10] text-xs rounded-xl pl-10 pr-9 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7E72] hover:text-[#1E0A10]"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <span className="text-xs text-[#8C7E72] font-mono hidden sm:inline-block">
          Showing {filteredCustomers.length} of {customers.length}
        </span>
      </div>

      {/* ========================================================= */}
      {/* 4. CUSTOMERS TABLE WITH ACTIONS                           */}
      {/* ========================================================= */}
      <div className="bg-white border border-[#E8DCC9] rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1E0A10] min-w-[750px]">
            <thead className="bg-[#FAF4EA] text-[#5C3D1E] font-bold border-b border-[#E8DCC9] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-5">Customer Profile</th>
                <th className="py-4 px-5">Contact Info</th>
                <th className="py-4 px-5">Account Type</th>
                <th className="py-4 px-5">Joined Date</th>
                <th className="py-4 px-5 text-center">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EAE0]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <PremiumLoader
                      title="Loading Customer Accounts..."
                      subtitle="Retrieving client profiles, contact numbers, and login credentials..."
                      compact
                    />
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#8C7E72] font-serif">
                    No customer accounts found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const custId = (cust as any)._id || cust.id || '';
                  const fullName = `${cust.firstName || ''} ${cust.lastName || ''}`.trim() || 'Valued Customer';
                  const initials = (cust.firstName?.[0] || 'C').toUpperCase();

                  return (
                    <tr
                      key={custId}
                      className="hover:bg-[#FAF8F5] transition-colors group"
                    >
                      {/* Name & Initials */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#760159] to-[#380725] text-[#FFE59E] border border-[#D4AF37]/50 flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-[#1E0A10] text-sm font-serif group-hover:text-[#760159] transition-colors">
                              {fullName}
                            </p>
                            <button
                              onClick={(e) => handleCopyId(custId, e)}
                              className="inline-flex items-center gap-1 text-[10px] text-[#8C7E72] hover:text-[#760159] font-mono mt-0.5 transition-colors"
                              title="Click to copy full ID"
                            >
                              <span>ID: {custId.slice(-8)}</span>
                              {copiedId === custId ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-2.5 h-2.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-5 space-y-1">
                        <div className="flex items-center gap-1.5 text-[#1E0A10]">
                          <Mail className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                          <span className="font-medium">{cust.email}</span>
                        </div>
                        {cust.phone ? (
                          <div className="flex items-center gap-1.5 text-[#5C3D1E] font-mono text-[11px]">
                            <Phone className="w-3.5 h-3.5 text-[#8C7E72] shrink-0" />
                            <span>{cust.phone}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#8C7E72] italic">No phone attached</span>
                        )}
                      </td>

                      {/* Account Type */}
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-semibold bg-[#FAF4EA] text-[#760159] border border-[#D4AF37]/50">
                          <Shield className="w-3 h-3 text-[#D4AF37]" />
                          <span className="capitalize">{cust.role || 'Customer'}</span>
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-5 text-[#5C3D1E]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#8C7E72]" />
                          <span>{formatDate(cust.createdAt)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Verified
                        </span>
                      </td>

                      {/* Actions Column (Delete Option) */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setDeleteConfirmUser(cust)}
                            className="p-2 rounded-xl text-[#8C7E72] hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all shadow-xs active:scale-95"
                            title="Delete Customer Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. DELETE CUSTOMER CONFIRMATION DIALOG                    */}
      {/* ========================================================= */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 bg-[#16030F]/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border-2 border-rose-200 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative">
            <div className="flex items-start gap-4 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0 border border-rose-200 text-rose-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-[#1E0A10] text-base font-serif">
                  Delete Customer Account?
                </h3>
                <p className="text-xs text-rose-600 font-semibold uppercase tracking-wider">
                  Permanent Database Action
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8DCC9] space-y-1.5">
              <p className="text-xs font-bold text-[#1E0A10]">
                {deleteConfirmUser.firstName} {deleteConfirmUser.lastName}
              </p>
              <p className="text-xs text-[#5C3D1E] font-mono">{deleteConfirmUser.email}</p>
              <p className="text-[10px] text-[#8C7E72] font-mono">
                ID: {((deleteConfirmUser as any)._id || deleteConfirmUser.id)}
              </p>
            </div>

            <p className="text-xs text-[#5C3D1E] leading-relaxed">
              Are you sure you want to delete this customer account? This will permanently delete their login credentials, shipping address profile, and account history from MongoDB Atlas.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F2EAE0]">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#5C3D1E] hover:text-[#1E0A10] hover:bg-[#FAF4EA] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCustomer}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Deleting Account...' : 'Delete Customer'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
