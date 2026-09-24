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
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/30 border-emerald-800/40',
    },
    {
      title: 'Total Transactions',
      value: metrics.totalOrders,
      icon: Package,
      color: 'text-blue-400',
      bg: 'bg-blue-950/30 border-blue-800/40',
    },
    {
      title: 'Client Database',
      value: metrics.totalCustomers,
      icon: Users,
      color: 'text-violet-400',
      bg: 'bg-violet-950/30 border-violet-800/40',
    },
    {
      title: 'Active Products',
      value: metrics.totalProducts,
      icon: ShoppingBag,
      color: 'text-amber-400',
      bg: 'bg-amber-950/30 border-amber-800/40',
    },
    {
      title: 'Pending Dispatch',
      value: metrics.pendingOrders,
      icon: Clock,
      color: 'text-orange-400',
      bg: 'bg-orange-950/30 border-orange-800/40',
    },
    {
      title: 'Low Stock Alerts',
      value: metrics.lowStockCount,
      icon: AlertTriangle,
      color: 'text-rose-400',
      bg: 'bg-rose-950/30 border-rose-800/40',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
            Executive Summary
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            Operations Command
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
          <Link
            href="/orders"
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
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
              className="p-5 bg-zinc-900/80 rounded-2xl border border-zinc-800 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  {stat.title}
                </span>
                <div className={`p-2 rounded-xl border ${stat.bg} ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl font-black text-white">{stat.value}</span>
            </div>
          );
        })}
      </div>

      {/* 2. 7-Day Sales Volume Graph */}
      <div className="p-6 sm:p-8 bg-zinc-900/80 rounded-3xl border border-zinc-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold text-zinc-400">Cash Flow Analytics</span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Weekly Revenue Trajectory
            </h3>
          </div>
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Healthy Settlement Rate
          </span>
        </div>

        <div className="h-52 flex items-end justify-between gap-3 pt-6 border-b border-zinc-800">
          {salesChart.map((day: any, idx: number) => {
            const maxVal = Math.max(...salesChart.map((d: any) => d.sales || 0), 100);
            const heightPercent = Math.max(12, (day.sales / maxVal) * 100);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] font-mono font-bold text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatCurrency(day.sales)}
                </span>
                <div
                  className="w-full max-w-[54px] bg-gradient-to-t from-amber-600 to-amber-400 group-hover:from-amber-400 group-hover:to-amber-300 rounded-t-xl transition-all duration-300"
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[10px] font-mono text-zinc-400 truncate w-full text-center">
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
        <div className="p-6 bg-zinc-900/80 rounded-3xl border border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">Recent Transactions</h3>
            <Link
              href="/orders"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              All Orders <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-800/80 text-xs">
            {recentOrders.map((order: any) => (
              <div key={order._id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-white block">
                    {order.orderNumber}
                  </span>
                  <span className="text-zinc-400">
                    {order.shippingAddress?.fullName || 'Customer'} • {order.items?.length || 0} artifacts
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white block">
                    {formatCurrency(order.total)}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.paymentStatus === 'Paid'
                        ? 'bg-emerald-950/60 text-emerald-400'
                        : 'bg-amber-950/60 text-amber-400'
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
        <div className="p-6 bg-zinc-900/80 rounded-3xl border border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
              <AlertTriangle className="w-5 h-5" /> Low Inventory Watch
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              Manage Catalog <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-800/80 text-xs">
            {lowStockProducts.length === 0 ? (
              <p className="text-zinc-500 py-6 text-center">All inventory thresholds are satisfied.</p>
            ) : (
              lowStockProducts.map((prod: any) => (
                <div key={prod._id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white line-clamp-1">{prod.name}</h4>
                    <span className="font-mono text-zinc-500 text-[11px]">{prod.sku}</span>
                  </div>
                  <span className="bg-rose-950/50 text-rose-400 border border-rose-800/40 font-bold px-2.5 py-1 rounded-full text-xs">
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
