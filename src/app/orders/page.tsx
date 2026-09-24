'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  RefreshCw,
  ExternalLink,
  MapPin,
  CreditCard,
  X,
  FileText,
} from 'lucide-react';
import { api } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Order } from '../../types';
import { toast } from 'sonner';

const STATUS_OPTIONS = [
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
] as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Order for Inspection / Status update
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>('Processing');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [timelineNote, setTimelineNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/orders/admin/all?limit=100');
      if (res.data?.success) {
        setOrders(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load orders');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setTrackingNumber(order.trackingNumber || '');
    setTimelineNote('');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUpdating(true);
    try {
      const res = await api.put(`/orders/admin/${selectedOrder._id}/status`, {
        orderStatus: newStatus,
        trackingNumber: trackingNumber.trim() || undefined,
        note: timelineNote.trim() || `Status updated to ${newStatus} by Dispatch Console`,
      });

      if (res.data?.success) {
        toast.success(`Order status updated to ${newStatus}`);
        const updated = res.data.data;
        setSelectedOrder(updated);
        setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
        setTimelineNote('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const userObj = typeof o.user === 'object' ? o.user : null;
      const userName = userObj ? `${userObj.firstName} ${userObj.lastName}` : '';
      const userEmail = userObj?.email || '';
      const orderNum = o.orderNumber || '';
      const custName = o.shippingAddress?.fullName || '';

      const matchesSearch =
        orderNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        custName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || o.orderStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800/40">
            <CheckCircle2 className="w-3 h-3" /> Delivered
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-950/70 text-sky-400 border border-sky-800/40">
            <Truck className="w-3 h-3" /> Shipped
          </span>
        );
      case 'Processing':
      case 'Packed':
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/70 text-amber-400 border border-amber-800/40">
            <Clock className="w-3 h-3" /> {status}
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950/70 text-rose-400 border border-rose-800/40">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded">
            PAID
          </span>
        );
      case 'Pending':
        return (
          <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/50 border border-amber-800/40 px-2 py-0.5 rounded">
            PENDING
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-950/50 border border-rose-800/40 px-2 py-0.5 rounded">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
            Orders & Logistics
            <span className="text-xs font-mono font-normal bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">
              {orders.length} Orders
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Track real-time transactions, process fulfillment milestones, and assign courier tracking.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white transition-colors self-start sm:self-auto"
          title="Refresh List"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter and Tabs */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order number or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-amber-400/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['all', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab
                  ? 'bg-amber-400 text-zinc-950 font-bold'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {tab === 'all' ? 'All Orders' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/90 text-zinc-400 font-semibold border-b border-zinc-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items Summary</th>
                <th className="py-3.5 px-4">Financials</th>
                <th className="py-3.5 px-4">Fulfillment</th>
                <th className="py-3.5 px-4">Tracking</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    {isLoading ? 'Loading order manifests...' : 'No matching orders found.'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const userObj = typeof order.user === 'object' ? order.user : null;
                  const customerName =
                    order.shippingAddress?.fullName ||
                    (userObj ? `${userObj.firstName} ${userObj.lastName}` : 'Guest Customer');
                  const customerEmail = userObj?.email || 'Registered account';

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-zinc-800/30 transition-colors group cursor-pointer"
                      onClick={() => openOrderDetails(order)}
                    >
                      {/* Order Number & Date */}
                      <td className="py-3 px-4">
                        <p className="font-mono font-bold text-amber-400 hover:underline">
                          #{order.orderNumber}
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{formatDate(order.createdAt)}</p>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <p className="font-semibold text-white">{customerName}</p>
                        <p className="text-[10px] text-zinc-400">{customerEmail}</p>
                      </td>

                      {/* Items */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {order.items?.slice(0, 3).map((item, i) => (
                            <div
                              key={i}
                              className="w-7 h-7 rounded-lg bg-zinc-950 border border-zinc-800 relative overflow-hidden flex-shrink-0"
                            >
                              <Image
                                src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                          {order.items && order.items.length > 3 && (
                            <span className="text-[10px] font-mono text-zinc-500 pl-1">
                              +{order.items.length - 3}
                            </span>
                          )}
                          <span className="text-[11px] text-zinc-400 ml-1">
                            ({order.items?.reduce((s, it) => s + it.quantity, 0)} pcs)
                          </span>
                        </div>
                      </td>

                      {/* Financials */}
                      <td className="py-3 px-4">
                        <p className="font-mono font-bold text-white text-xs">
                          {formatCurrency(order.total)}
                        </p>
                        <div className="mt-0.5">{getPaymentBadge(order.paymentStatus)}</div>
                      </td>

                      {/* Fulfillment Status */}
                      <td className="py-3 px-4">{getStatusBadge(order.orderStatus)}</td>

                      {/* Tracking */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {order.trackingNumber ? (
                          <span className="text-zinc-300 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                            {order.trackingNumber}
                          </span>
                        ) : (
                          <span className="text-zinc-600 italic">Not assigned</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openOrderDetails(order);
                          }}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-medium transition-colors"
                        >
                          Inspect
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

      {/* Order Details & Status Updater Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-black text-white font-mono">
                    Order #{selectedOrder.orderNumber}
                  </h2>
                  {getStatusBadge(selectedOrder.orderStatus)}
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Placed on {formatDate(selectedOrder.createdAt)} • Payment Method:{' '}
                  <span className="uppercase font-mono text-amber-400">
                    {selectedOrder.paymentMethod}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Updater Form */}
            <form
              onSubmit={handleUpdateStatus}
              className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3"
            >
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4" /> Dispatch & Status Control
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1 font-semibold">
                    Change Fulfillment Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-xl px-3 py-2 focus:border-amber-400/50"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1 font-semibold">
                    Courier Tracking Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DHL-9982410"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-white rounded-xl px-3 py-2 focus:border-amber-400/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1 font-semibold">
                  Milestone Note (recorded in timeline)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Handed over to air freight carrier hub"
                  value={timelineNote}
                  onChange={(e) => setTimelineNote(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-xl px-3 py-2 focus:border-amber-400/50"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Update Fulfillment Status'}
                </button>
              </div>
            </form>

            {/* Line Items */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" /> Manifest Line Items (
                {selectedOrder.items?.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 relative overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-white text-xs">{item.name}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-white text-xs">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Destination & Financial Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> Delivery Address
                </h4>
                <div className="text-xs text-zinc-300 space-y-0.5">
                  <p className="font-bold text-white">{selectedOrder.shippingAddress?.fullName}</p>
                  <p>{selectedOrder.shippingAddress?.addressLine1}</p>
                  {selectedOrder.shippingAddress?.addressLine2 && (
                    <p>{selectedOrder.shippingAddress?.addressLine2}</p>
                  )}
                  <p>
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}{' '}
                    {selectedOrder.shippingAddress?.postalCode}
                  </p>
                  <p className="text-zinc-500">{selectedOrder.shippingAddress?.country}</p>
                  <p className="text-zinc-400 font-mono text-[11px] pt-1">
                    Phone: {selectedOrder.shippingAddress?.phone}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" /> Financial Summary
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount ({selectedOrder.couponCode || 'Coupon'}):</span>
                      <span className="font-mono">-{formatCurrency(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-400">
                    <span>Shipping:</span>
                    <span className="font-mono">{formatCurrency(selectedOrder.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Tax:</span>
                    <span className="font-mono">{formatCurrency(selectedOrder.tax)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold pt-2 border-t border-zinc-800">
                    <span>Total Amount:</span>
                    <span className="font-mono text-amber-400 text-sm">
                      {formatCurrency(selectedOrder.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline History */}
            <div className="space-y-3 border-t border-zinc-800 pt-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Milestone Tracking Audit Log
              </h4>
              <div className="space-y-2">
                {selectedOrder.timeline?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 text-xs p-2.5 rounded-lg bg-zinc-950/40 border border-zinc-800/50"
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white uppercase text-[11px]">
                          {item.status}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {formatDate(item.timestamp)}
                        </span>
                      </div>
                      {item.note && <p className="text-zinc-400 text-[11px] mt-0.5">{item.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
