'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  IndianRupee,
  Package,
  Users,
  ShoppingBag,
  AlertTriangle,
  Clock,
  TrendingUp,
  Tag,
  ArrowRight,
  Plus,
  ArrowUpRight,
} from 'lucide-react';
import { api } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/admin/analytics');
        if (res.data?.success && res.data.data) {
          setAnalytics(res.data.data);
        }
      } catch (error) {
        console.error('Failed to load admin analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-zinc-500 text-xs">
        Loading operations metrics...
      </div>
    );
  }

  const { metrics, salesChart, recentOrders, lowStockProducts } = analytics || {
    metrics: {
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      pendingOrders: 0,
      lowStockCount: 0,
    },
    salesChart: [],
    recentOrders: [],
    lowStockProducts: [],
  };

  const statCards = [
    {
      title: 'Net Revenue',
      value: formatCurrency(metrics.totalRevenue || 0),
      icon: IndianRupee,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
    },
    {
      title: 'Total Transactions',
      value: metrics.totalOrders,
      icon: Package,
      color: 'text-amber-800',
      bg: 'bg-amber-50 border-amber-200',
    },
    {
      title: 'Client Database',
      value: metrics.totalCustomers,
      icon: Users,
      color: 'text-indigo-700',
      bg: 'bg-indigo-50 border-indigo-200',
    },
    {
      title: 'Active Products',
      value: metrics.totalProducts,
      icon: ShoppingBag,
      color: 'text-[#B8860B]',
      bg: 'bg-[#FBF7EE] border-[#EAE1D1]',
    },
    {
      title: 'Pending Dispatch',
      value: metrics.pendingOrders,
      icon: Clock,
      color: 'text-orange-700',
      bg: 'bg-orange-50 border-orange-200',
    },
    {
      title: 'Low Stock Alerts',
      value: metrics.lowStockCount,
      icon: AlertTriangle,
      color: 'text-rose-700',
      bg: 'bg-rose-50 border-rose-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE1D1]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#B8860B]">
            Executive Summary
          </span>
          <h1 className="text-3xl font-black text-[#18140B] tracking-tight mt-1">
            Operations Command
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:brightness-105 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
          <Link
            href="/orders"
            className="bg-white hover:bg-[#F5EFEB] text-[#18140B] border border-[#EAE1D1] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
          >
            Review Orders
          </Link>
        </div>
      </div>

      {/* 1. Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="p-5 bg-white rounded-2xl border border-[#EAE1D1] shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6055]">
                  {stat.title}
                </span>
                <div className={`p-2 rounded-xl border ${stat.bg} ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl font-black text-[#18140B]">{stat.value}</span>
            </div>
          );
        })}
      </div>

      {/* 2. 7-Day Sales Volume Graph */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-[#EAE1D1] shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold text-[#7A6E63]">Cash Flow Analytics</span>
            <h3 className="text-lg font-bold text-[#18140B] mt-0.5">
              Weekly Revenue Trajectory
            </h3>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Healthy Settlement Rate
          </span>
        </div>

        <div className="h-52 flex items-end justify-between gap-3 pt-6 border-b border-[#EAE1D1]">
          {salesChart.map((day: any, idx: number) => {
            const maxVal = Math.max(...salesChart.map((d: any) => d.sales || 0), 100);
            const heightPercent = Math.max(12, (day.sales / maxVal) * 100);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] font-mono font-bold text-[#6B6055] opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatCurrency(day.sales)}
                </span>
                <div
                  className="w-full max-w-[54px] bg-gradient-to-t from-[#B8860B] to-[#D4AF37] group-hover:from-[#996D00] group-hover:to-[#C5A262] rounded-t-xl transition-all duration-300 shadow-xs"
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[10px] font-mono text-[#7A6E63] truncate w-full text-center">
                  {day.date.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Recent Transactions + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="p-6 bg-white rounded-3xl border border-[#EAE1D1] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#18140B]">Recent Transactions</h3>
            <Link
              href="/orders"
              className="text-xs font-bold text-[#B8860B] hover:text-[#996D00] flex items-center gap-1"
            >
              All Orders <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#EAE1D1] text-xs">
            {recentOrders.map((order: any) => (
              <div key={order._id} className="py-3.5 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-[#18140B] block">
                    {order.orderNumber}
                  </span>
                  <span className="text-[#6B6055]">
                    {order.shippingAddress?.fullName || 'Customer'} • {order.items?.length || 0} artifacts
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#18140B] block">
                    {formatCurrency(order.total)}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      order.paymentStatus === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Watch */}
        <div className="p-6 bg-white rounded-3xl border border-[#EAE1D1] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
              <AlertTriangle className="w-5 h-5 text-rose-600" /> Low Inventory Watch
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-[#B8860B] hover:text-[#996D00] flex items-center gap-1"
            >
              Manage Catalog <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#EAE1D1] text-xs">
            {lowStockProducts.length === 0 ? (
              <p className="text-[#7A6E63] py-6 text-center">All inventory thresholds are satisfied.</p>
            ) : (
              lowStockProducts.map((prod: any) => (
                <div key={prod._id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-[#18140B] line-clamp-1">{prod.name}</h4>
                    <span className="font-mono text-[#7A6E63] text-[11px]">{prod.sku}</span>
                  </div>
                  <span className="bg-rose-50 text-rose-700 border border-rose-200 font-bold px-2.5 py-1 rounded-full text-xs">
                    {prod.stock} left in stock
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
