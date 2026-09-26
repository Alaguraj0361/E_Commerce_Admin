'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Tag,
  Plus,
  Search,
  Trash2,
  AlertCircle,
  X,
  RefreshCw,
  Percent,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { api } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Coupon } from '../../types';
import { toast } from 'sonner';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [minimumOrderAmount, setMinimumOrderAmount] = useState<number>(50);
  const [maximumDiscount, setMaximumDiscount] = useState<number>(100);
  const [expiryDate, setExpiryDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [usageLimit, setUsageLimit] = useState<number>(100);
  const [perUserLimit, setPerUserLimit] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/coupons');
      if (res.data?.success) {
        setCoupons(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load promotional coupons');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreateModal = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValue(15);
    setMinimumOrderAmount(50);
    setMaximumDiscount(100);
    setExpiryDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    setUsageLimit(100);
    setPerUserLimit(1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Promo code is required');
      return;
    }
    if (discountValue <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue,
        minimumOrderAmount: minimumOrderAmount || 0,
        maximumDiscount: discountType === 'percentage' ? maximumDiscount : undefined,
        expiryDate: new Date(expiryDate).toISOString(),
        usageLimit: usageLimit || undefined,
        perUserLimit: perUserLimit || 1,
        isActive,
      };

      const res = await api.post('/coupons', payload);
      if (res.data?.success) {
        toast.success(`Coupon ${payload.code} created successfully`);
        setIsModalOpen(false);
        fetchCoupons();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await api.delete(`/coupons/${id}`);
      if (res.data?.success) {
        toast.success('Coupon removed successfully');
        setCoupons((prev) => prev.filter((c) => c._id !== id));
        setDeleteConfirmId(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => c.code.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [coupons, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#18140B] flex items-center gap-3">
            Promotions & Coupons
            <span className="text-xs font-mono font-normal bg-[#F5EFEB] text-[#18140B] border border-[#EAE1D1] text-[#3D342B] px-2 py-0.5 rounded-full">
              {coupons.length} Active Codes
            </span>
          </h1>
          <p className="text-xs text-[#6B6055] mt-1">
            Create discount vouchers, configure spend thresholds, and enforce redemption limits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCoupons}
            className="p-2.5 rounded-xl border border-[#EAE1D1] hover:border-[#EAE1D1] bg-white text-[#6B6055] hover:text-[#18140B] transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:brightness-105 text-[#18140B] shadow-sm font-bold text-xs tracking-wide transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" /> Create Voucher
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border border-[#EAE1D1] p-4 rounded-2xl">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#8C7E72] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search coupon codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#EAE1D1] text-[#2D2319] text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#B8860B]/50 transition-colors"
          />
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white border border-[#EAE1D1] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#3D342B]">
            <thead className="bg-[#FAF7F2] text-[#6B6055] font-semibold border-b border-[#EAE1D1] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-4">Discount Value</th>
                <th className="py-3.5 px-4">Thresholds</th>
                <th className="py-3.5 px-4">Expiration</th>
                <th className="py-3.5 px-4">Usage & Caps</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE1D1]">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8C7E72]">
                    {isLoading ? 'Loading promotional vouchers...' : 'No promotional coupons found.'}
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const isExpired = new Date(coupon.expiryDate) < new Date();

                  return (
                    <tr
                      key={coupon._id}
                      className="hover:bg-[#FAF7F2]/60 transition-colors group"
                    >
                      {/* Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-[#B8860B] bg-[#FAF8F5] border border-[#B8860B]/30 px-2.5 py-1 rounded-lg text-xs tracking-wider">
                            {coupon.code}
                          </span>
                        </div>
                      </td>

                      {/* Value */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#18140B] text-xs flex items-center gap-1">
                          {coupon.discountType === 'percentage' ? (
                            <>
                              <Percent className="w-3.5 h-3.5 text-[#B8860B]" />
                              {coupon.discountValue}% OFF
                            </>
                          ) : (
                            <>
                              <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                              {formatCurrency(coupon.discountValue)} OFF
                            </>
                          )}
                        </span>
                      </td>

                      {/* Thresholds */}
                      <td className="py-3.5 px-4 space-y-0.5 text-[11px]">
                        {coupon.minimumOrderAmount ? (
                          <p className="text-[#3D342B]">
                            Min. Spend: {formatCurrency(coupon.minimumOrderAmount)}
                          </p>
                        ) : (
                          <p className="text-[#8C7E72]">No minimum</p>
                        )}
                        {coupon.maximumDiscount && (
                          <p className="text-[#6B6055]">
                            Max Cap: {formatCurrency(coupon.maximumDiscount)}
                          </p>
                        )}
                      </td>

                      {/* Expiration */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Clock
                            className={`w-3.5 h-3.5 ${
                              isExpired ? 'text-rose-400' : 'text-[#6B6055]'
                            }`}
                          />
                          <span
                            className={`text-xs ${
                              isExpired ? 'text-rose-400 font-semibold' : 'text-[#3D342B]'
                            }`}
                          >
                            {formatDate(coupon.expiryDate)}
                          </span>
                        </div>
                        {isExpired && (
                          <span className="text-[9px] text-rose-400 font-mono">Expired</span>
                        )}
                      </td>

                      {/* Usage */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[#18140B] text-xs font-semibold">
                            {coupon.usedCount || 0}
                          </span>
                          <span className="text-[#8C7E72]">/</span>
                          <span className="font-mono text-[#6B6055] text-xs">
                            {coupon.usageLimit ? `${coupon.usageLimit} max` : 'Unlimited'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            coupon.isActive && !isExpired
                              ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40'
                              : 'bg-[#F5EFEB] text-[#18140B] border border-[#EAE1D1] text-[#8C7E72] border border-[#EAE1D1]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              coupon.isActive && !isExpired ? 'bg-emerald-400' : 'bg-zinc-500'
                            }`}
                          />
                          {coupon.isActive && !isExpired ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setDeleteConfirmId(coupon._id)}
                          className="p-1.5 rounded-lg text-[#6B6055] hover:text-rose-400 hover:bg-rose-50 transition-colors"
                          title="Revoke Coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EAE1D1] rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-bold text-[#18140B] text-sm">Revoke Voucher?</h3>
            </div>
            <p className="text-xs text-[#6B6055] leading-relaxed">
              Are you sure you want to delete this promotional coupon code? Customers will no longer be
              able to apply it at checkout.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#6B6055] hover:text-[#18140B] hover:bg-[#F5EFEB] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-[#18140B] transition-all shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EAE1D1] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EAE1D1] pb-3">
              <h2 className="text-base font-bold text-[#18140B]">Create Promotional Voucher</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#6B6055] hover:text-[#18140B] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#6B6055] mb-1.5">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER25, VIP50"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#FAF8F5] border border-[#EAE1D1] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#B8860B] uppercase tracking-wider focus:outline-none focus:border-[#B8860B]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B6055] mb-1.5">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE1D1] rounded-xl px-3 py-2 text-xs text-[#18140B]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6B6055] mb-1.5">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE1D1] rounded-xl px-3 py-2 text-xs font-mono text-[#18140B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B6055] mb-1.5">
                    Min. Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minimumOrderAmount}
                    onChange={(e) => setMinimumOrderAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE1D1] rounded-xl px-3 py-2 text-xs font-mono text-[#18140B]"
                  />
                </div>

                {discountType === 'percentage' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B6055] mb-1.5">
                      Max Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={maximumDiscount}
                      onChange={(e) => setMaximumDiscount(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#FAF8F5] border border-[#EAE1D1] rounded-xl px-3 py-2 text-xs font-mono text-[#18140B]"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B6055] mb-1.5">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE1D1] rounded-xl px-3 py-2 text-xs text-[#18140B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6B6055] mb-1.5">
                    Total Usage Cap
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(parseInt(e.target.value, 10) || 100)}
                    className="w-full bg-[#FAF8F5] border border-[#EAE1D1] rounded-xl px-3 py-2 text-xs font-mono text-[#18140B]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 bg-[#FAF8F5] border border-[#EAE1D1] p-3 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded accent-[#B8860B] w-4 h-4"
                />
                <span className="text-xs font-semibold text-[#18140B]">Enable Voucher Immediately</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAE1D1]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B6055] hover:text-[#18140B] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:brightness-105 text-[#18140B] shadow-sm font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Issue Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
