'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Ruler,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Edit2,
  Trash2,
  Eye,
  Printer,
  X,
  ExternalLink,
  MessageCircle,
  IndianRupee,
  Layers,
  Sparkles,
  Sliders,
  ChevronDown,
  ArrowRight,
  Crown,
  Zap,
  Copy,
  Check,
  RotateCcw,
  Sparkle,
  ArrowUpRight,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStitchingStore } from '../../../store/stitchingStore';
import { StitchingDispatchOrder, StitchingCategory } from '../../../types';
import { formatCurrency } from '../../../lib/utils';
import { PremiumLoader } from '../../../components/ui/PremiumLoader';

const STATUS_PIPELINE: StitchingDispatchOrder['status'][] = [
  'Order Confirmed',
  'Fabric Received',
  'Pattern Cutting',
  'Embroidery / Aari',
  'Stitching In Progress',
  'Trial / Alteration',
  'Ironing & Packed',
  'Ready for Dispatch',
  'Dispatched',
  'Delivered',
];

function getInitials(name: string): string {
  if (!name) return 'AT';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function DispatchContent() {
  const searchParams = useSearchParams();
  const prefillMeasurementId = searchParams.get('measurementId') || '';
  const initialCategory = searchParams.get('category') || '';

  const {
    dispatchOrders,
    categories,
    measurements,
    addDispatchOrder,
    updateDispatchOrder,
    deleteDispatchOrder,
    updateDispatchStatus,
  } = useStitchingStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<StitchingDispatchOrder | null>(null);
  const [viewingOrder, setViewingOrder] = useState<StitchingDispatchOrder | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [selectedMeasurementId, setSelectedMeasurementId] = useState('');
  const [estimatedDispatchDate, setEstimatedDispatchDate] = useState('');
  const [additionalInformation, setAdditionalInformation] = useState('');
  const [liningType, setLiningType] = useState('Pure Mulmul Cotton (Pre-Washed)');
  const [fabricProvidedBy, setFabricProvidedBy] = useState<'Customer Provided' | 'Store Fabric' | 'Purchased with Saree'>('Customer Provided');
  const [assignedTailor, setAssignedTailor] = useState('Master Murugan (Atelier 1)');
  const [priority, setPriority] = useState<'Normal' | 'Express (48h)' | 'Urgent Wedding VIP'>('Normal');
  const [status, setStatus] = useState<StitchingDispatchOrder['status']>('Order Confirmed');
  const [stitchingCharge, setStitchingCharge] = useState<number>(550);
  const [advancePaid, setAdvancePaid] = useState<number>(300);
  const [courierPartner, setCourierPartner] = useState('ST Courier Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Auto-open create modal if measurementId is in query params
  React.useEffect(() => {
    if (prefillMeasurementId && measurements.length > 0) {
      const match = measurements.find(
        (m) => m._id === prefillMeasurementId || m.measurementCode === prefillMeasurementId
      );
      if (match) {
        openCreateModalWithMeasurement(match);
      }
    }
  }, [prefillMeasurementId, measurements]);

  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedField(text);
      toast.success(`Copied ${label} to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const openCreateModalWithMeasurement = (m: any) => {
    setEditingOrder(null);
    setDate(new Date().toISOString().split('T')[0]);
    setCustomerName(m.customerName);
    setCustomerPhone(m.customerPhone);
    setCustomerAddress(m.customerCity ? `${m.customerCity}` : '');
    setCategorySlug(m.categorySlug);
    setSelectedMeasurementId(m._id);

    const cat = categories.find((c) => c.slug === m.categorySlug);
    const turnaround = cat?.estimatedTurnaroundDays || 3;
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + turnaround);
    setEstimatedDispatchDate(estDate.toISOString().split('T')[0]);

    setStitchingCharge(cat?.basePrice || 500);
    setAdvancePaid(cat ? Math.round(cat.basePrice / 2) : 250);
    setAdditionalInformation(`Measurements pre-filled from ${m.measurementCode}. ${m.specialInstructions || ''}`);
    setIsFormModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingOrder(null);
    setDate(new Date().toISOString().split('T')[0]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    const firstCat = categories[0]?.slug || 'saree-blouse-stitching';
    setCategorySlug(firstCat);
    setSelectedMeasurementId('');

    const cat = categories.find((c) => c.slug === firstCat);
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + (cat?.estimatedTurnaroundDays || 3));
    setEstimatedDispatchDate(estDate.toISOString().split('T')[0]);

    setAdditionalInformation('');
    setLiningType('Pure Mulmul Cotton (Pre-Washed)');
    setFabricProvidedBy('Customer Provided');
    setAssignedTailor('Master Murugan (Atelier 1)');
    setPriority('Normal');
    setStatus('Order Confirmed');
    setStitchingCharge(cat?.basePrice || 500);
    setAdvancePaid(cat ? Math.round(cat.basePrice / 2) : 250);
    setCourierPartner('ST Courier Express');
    setTrackingNumber('');
    setNotes('');
    setIsFormModalOpen(true);
  };

  const openEditModal = (order: StitchingDispatchOrder) => {
    setEditingOrder(order);
    setDate(order.date);
    setCustomerName(order.customerName);
    setCustomerPhone(order.customerPhone);
    setCustomerAddress(order.customerAddress || '');
    setCategorySlug(order.categorySlug);
    setSelectedMeasurementId(order.measurementId || '');
    setEstimatedDispatchDate(order.estimatedDispatchDate);
    setAdditionalInformation(order.additionalInformation || '');
    setLiningType(order.liningType || 'Pure Mulmul Cotton (Pre-Washed)');
    setFabricProvidedBy(order.fabricProvidedBy || 'Customer Provided');
    setAssignedTailor(order.assignedTailor || 'Master Murugan (Atelier 1)');
    setPriority(order.priority || 'Normal');
    setStatus(order.status);
    setStitchingCharge(order.stitchingCharge || 0);
    setAdvancePaid(order.advancePaid || 0);
    setCourierPartner(order.courierPartner || 'ST Courier Express');
    setTrackingNumber(order.trackingNumber || '');
    setNotes(order.notes || '');
    setIsFormModalOpen(true);
  };

  const matchedCustomerMeasurements = useMemo(() => {
    if (!customerPhone && !customerName) return measurements;
    const phoneClean = customerPhone.replace(/[^0-9]/g, '');
    return measurements.filter((m) => {
      const matchPhone = phoneClean && m.customerPhone.replace(/[^0-9]/g, '').includes(phoneClean);
      const matchName = customerName && m.customerName.toLowerCase().includes(customerName.toLowerCase().trim());
      return matchPhone || matchName;
    });
  }, [measurements, customerPhone, customerName]);

  const handleMeasurementSelection = (measurementId: string) => {
    setSelectedMeasurementId(measurementId);
    if (!measurementId) return;
    const found = measurements.find((m) => m._id === measurementId);
    if (found) {
      if (!customerName) setCustomerName(found.customerName);
      if (!customerPhone) setCustomerPhone(found.customerPhone);
      if (found.categorySlug && found.categorySlug !== categorySlug) {
        setCategorySlug(found.categorySlug);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !categorySlug || !estimatedDispatchDate) {
      toast.error('Please fill in required fields: Customer Name, Phone, Category, and Estimated Date');
      return;
    }

    const cat = categories.find((c) => c.slug === categorySlug);
    const categoryName = cat?.name || categorySlug;

    let measurementCode: string | undefined = undefined;
    let measurementSummary: string | undefined = undefined;
    if (selectedMeasurementId) {
      const m = measurements.find((item) => item._id === selectedMeasurementId);
      if (m) {
        measurementCode = m.measurementCode;
        const vals = Object.entries(m.measurements || {})
          .filter(([_, v]) => Boolean(v))
          .slice(0, 3)
          .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}${m.unit === 'inches' ? '"' : 'cm'}`)
          .join(', ');
        measurementSummary = vals ? `${vals}...` : undefined;
      }
    }

    const balanceDue = Math.max(0, Number(stitchingCharge) - Number(advancePaid));

    if (editingOrder) {
      updateDispatchOrder(editingOrder._id, {
        date,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        categorySlug,
        categoryName,
        measurementId: selectedMeasurementId || undefined,
        measurementCode,
        measurementSummary,
        estimatedDispatchDate,
        additionalInformation: additionalInformation.trim(),
        liningType,
        fabricProvidedBy,
        assignedTailor,
        priority,
        status,
        stitchingCharge: Number(stitchingCharge) || 0,
        advancePaid: Number(advancePaid) || 0,
        balanceDue,
        courierPartner,
        trackingNumber: trackingNumber.trim(),
        notes: notes.trim(),
      });
      toast.success(`Job ${editingOrder.stitchingOrderNumber} updated successfully!`);
    } else {
      const created = addDispatchOrder({
        date,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        categorySlug,
        categoryName,
        measurementId: selectedMeasurementId || undefined,
        measurementCode,
        measurementSummary,
        estimatedDispatchDate,
        additionalInformation: additionalInformation.trim(),
        liningType,
        fabricProvidedBy,
        assignedTailor,
        priority,
        status,
        stitchingCharge: Number(stitchingCharge) || 0,
        advancePaid: Number(advancePaid) || 0,
        balanceDue,
        courierPartner,
        trackingNumber: trackingNumber.trim(),
        notes: notes.trim(),
      });
      toast.success(`Stitching job ${created.stitchingOrderNumber} created successfully!`);
    }

    setIsFormModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteDispatchOrder(id);
    setDeleteConfirmId(null);
    if (viewingOrder?._id === id) setViewingOrder(null);
    toast.success('Stitching dispatch record removed');
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return dispatchOrders.filter((o) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.stitchingOrderNumber.toLowerCase().includes(q) ||
        (o.measurementCode && o.measurementCode.toLowerCase().includes(q)) ||
        (o.assignedTailor && o.assignedTailor.toLowerCase().includes(q)) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q));

      let matchesStatus = true;
      if (statusFilter === 'active') {
        matchesStatus = o.status !== 'Delivered' && o.status !== 'Dispatched';
      } else if (statusFilter === 'ready') {
        matchesStatus = o.status === 'Ready for Dispatch';
      } else if (statusFilter === 'dispatched') {
        matchesStatus = o.status === 'Dispatched' || o.status === 'Delivered';
      } else if (statusFilter !== 'all') {
        matchesStatus = o.status === statusFilter;
      }

      const matchesCategory = !categoryFilter || o.categorySlug === categoryFilter;
      const matchesPriority = priorityFilter === 'all' || o.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });
  }, [dispatchOrders, searchQuery, statusFilter, categoryFilter, priorityFilter]);

  // Priority styling
  const renderPriorityBadge = (p: string) => {
    switch (p) {
      case 'Urgent Wedding VIP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-[#FFF6D6] border border-rose-300/40 shadow-xs">
            <Crown className="w-3 h-3 text-[#FFE59E] animate-pulse" />
            <span>VIP WEDDING</span>
          </span>
        );
      case 'Express (48h)':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-gradient-to-r from-amber-100 to-amber-200 text-amber-950 border border-amber-400/60 shadow-2xs">
            <Zap className="w-3 h-3 text-amber-700 fill-amber-600" />
            <span>EXPRESS 48H</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-zinc-700 bg-zinc-100 border border-zinc-200">
            <Check className="w-2.5 h-2.5 text-zinc-500" />
            <span>Standard</span>
          </span>
        );
    }
  };

  // Status visual pill
  const getStatusStyles = (s: string) => {
    switch (s) {
      case 'Delivered':
        return {
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
          dot: 'bg-emerald-600',
        };
      case 'Dispatched':
        return {
          bg: 'bg-blue-50 text-blue-900 border-blue-300',
          dot: 'bg-blue-600',
        };
      case 'Ready for Dispatch':
        return {
          bg: 'bg-amber-50 text-amber-950 border-[#D4AF37] font-bold shadow-xs',
          dot: 'bg-amber-500 animate-ping',
        };
      case 'Stitching In Progress':
      case 'Embroidery / Aari':
        return {
          bg: 'bg-purple-50 text-purple-900 border-purple-300',
          dot: 'bg-purple-600',
        };
      case 'Pattern Cutting':
      case 'Fabric Received':
        return {
          bg: 'bg-orange-50 text-orange-900 border-orange-200',
          dot: 'bg-orange-500',
        };
      default:
        return {
          bg: 'bg-zinc-50 text-zinc-800 border-zinc-200',
          dot: 'bg-zinc-400',
        };
    }
  };

  // Date notice
  const getDateNotice = (estDateStr: string, statusStr: string) => {
    if (statusStr === 'Delivered' || statusStr === 'Dispatched') {
      return (
        <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
        </span>
      );
    }
    const target = new Date(estDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-300 animate-pulse">
          <AlertTriangle className="w-3 h-3 text-rose-600" /> Overdue by {Math.abs(diffDays)}d
        </span>
      );
    }
    if (diffDays === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-amber-900 bg-gradient-to-r from-amber-100 to-amber-200 px-2 py-0.5 rounded-md border border-amber-400">
          <Clock className="w-3 h-3 text-amber-700" /> Due Today
        </span>
      );
    }
    if (diffDays === 1) {
      return (
        <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-300">
          <Clock className="w-3 h-3 text-blue-700" /> Due Tomorrow
        </span>
      );
    }
    return (
      <span className="text-[11px] font-medium text-[#8C5818] flex items-center gap-1">
        <Clock className="w-3 h-3 text-[#D4AF37]" /> in {diffDays} days
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-[1680px] mx-auto min-h-screen text-[#2A0E1B]">
      {/* Top Haute Couture Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#200414] via-[#350723] to-[#200414] p-6 sm:p-8 text-[#FFFDF9] border border-[#D4AF37]/50 shadow-xl">
        {/* Decorative Golden Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#D4AF37]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#FFE59E] text-xs font-serif font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#FFE59E]" />
              <span>Nalmara Haute Couture Atelier</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-white flex items-center gap-3">
              Stitching Product Dispatch Details
            </h1>
            <p className="text-xs sm:text-sm text-[#FFE59E]/80 max-w-2xl font-light leading-relaxed">
              Track custom tailoring orders, client measurements, artisan tailor allocations, priority deadlines, and courier dispatch logistics.
            </p>
          </div>

          {/* Action Hub */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/stitching/measurements"
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-[#D4AF37]/60 text-[#FFE8A3] text-xs font-serif font-bold flex items-center gap-2 backdrop-blur-md transition-all shadow-sm hover:scale-[1.02]"
            >
              <Ruler className="w-4 h-4 text-[#D4AF37]" />
              <span>Customer Measurements</span>
            </Link>
            <Link
              href="/stitching/categories"
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-[#D4AF37]/60 text-[#FFE8A3] text-xs font-serif font-bold flex items-center gap-2 backdrop-blur-md transition-all shadow-sm hover:scale-[1.02]"
            >
              <Sliders className="w-4 h-4 text-[#D4AF37]" />
              <span>Category Master</span>
            </Link>
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FFF6D6] via-[#FFE59E] to-[#D4AF37] text-[#200414] text-xs font-serif font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_4px_20px_rgba(212,175,55,0.35)] hover:shadow-[0_6px_25px_rgba(212,175,55,0.5)] hover:scale-[1.03] transition-all cursor-pointer border border-[#FFFDF9]"
            >
              <Plus className="w-4 h-4 text-[#200414] stroke-[3]" />
              <span>New Stitching Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Strip - Redesigned as Luxury Architectural Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1 */}
        <div
          onClick={() => setStatusFilter('active')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 relative overflow-hidden group shadow-sm ${
            statusFilter === 'active'
              ? 'bg-gradient-to-br from-[#280619] to-[#3D0A26] text-white border-[#D4AF37] ring-2 ring-[#D4AF37]'
              : 'bg-white hover:bg-[#FFFDF9] border-[#E8DCC8] hover:border-[#D4AF37] text-[#280619]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10.5px] font-serif font-bold uppercase tracking-wider ${
                statusFilter === 'active' ? 'text-[#FFE59E]' : 'text-[#8C5818]'
              }`}
            >
              Active Stitching Jobs
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                statusFilter === 'active'
                  ? 'bg-[#FFE59E]/20 text-[#FFE59E]'
                  : 'bg-[#FAF0DD] text-[#8C5818] border border-[#D4AF37]/50'
              }`}
            >
              <Scissors className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-serif font-black tracking-tight">
              {dispatchOrders.filter((o) => o.status !== 'Delivered' && o.status !== 'Dispatched').length}
            </p>
            <span
              className={`text-xs ${
                statusFilter === 'active' ? 'text-[#FFE59E]/70' : 'text-[#6B4B35]'
              }`}
            >
              orders in production
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[10.5px]">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className={statusFilter === 'active' ? 'text-[#FFE59E]/90' : 'text-[#8C5818]'}>
              Cutting, Aari & Tailoring Stages
            </span>
          </div>
        </div>

        {/* Tile 2 */}
        <div
          onClick={() => setStatusFilter('ready')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 relative overflow-hidden group shadow-sm ${
            statusFilter === 'ready'
              ? 'bg-gradient-to-br from-[#280619] to-[#3D0A26] text-white border-[#D4AF37] ring-2 ring-[#D4AF37]'
              : 'bg-white hover:bg-[#FFFDF9] border-[#E8DCC8] hover:border-[#D4AF37] text-[#280619]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10.5px] font-serif font-bold uppercase tracking-wider ${
                statusFilter === 'ready' ? 'text-[#FFE59E]' : 'text-amber-800'
              }`}
            >
              Ready for Dispatch
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                statusFilter === 'ready'
                  ? 'bg-amber-400/20 text-[#FFE59E]'
                  : 'bg-amber-50 text-amber-800 border border-amber-300'
              }`}
            >
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-serif font-black tracking-tight text-amber-800">
              {dispatchOrders.filter((o) => o.status === 'Ready for Dispatch').length}
            </p>
            <span
              className={`text-xs ${
                statusFilter === 'ready' ? 'text-[#FFE59E]/70' : 'text-[#6B4B35]'
              }`}
            >
              orders packed
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[10.5px] text-amber-800">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            <span>Ironed, QA Verified & Boxed</span>
          </div>
        </div>

        {/* Tile 3 */}
        <div
          onClick={() => setPriorityFilter(priorityFilter === 'Urgent Wedding VIP' ? 'all' : 'Urgent Wedding VIP')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 relative overflow-hidden group shadow-sm ${
            priorityFilter === 'Urgent Wedding VIP'
              ? 'bg-gradient-to-br from-rose-950 to-[#3D0A26] text-white border-rose-400 ring-2 ring-rose-400'
              : 'bg-white hover:bg-rose-50/40 border-[#E8DCC8] hover:border-rose-300 text-[#280619]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10.5px] font-serif font-bold uppercase tracking-wider ${
                priorityFilter === 'Urgent Wedding VIP' ? 'text-rose-200' : 'text-rose-800'
              }`}
            >
              Urgent Wedding VIP
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                priorityFilter === 'Urgent Wedding VIP'
                  ? 'bg-rose-500/20 text-rose-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-serif font-black tracking-tight text-rose-800">
              {dispatchOrders.filter((o) => o.priority === 'Urgent Wedding VIP').length}
            </p>
            <span
              className={`text-xs ${
                priorityFilter === 'Urgent Wedding VIP' ? 'text-rose-200' : 'text-[#6B4B35]'
              }`}
            >
              high-priority clients
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[10.5px] text-rose-700">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Requires Express Workshop Attention</span>
          </div>
        </div>

        {/* Tile 4 */}
        <div
          onClick={() => setStatusFilter('dispatched')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 relative overflow-hidden group shadow-sm ${
            statusFilter === 'dispatched'
              ? 'bg-gradient-to-br from-emerald-950 to-[#133020] text-white border-emerald-400 ring-2 ring-emerald-400'
              : 'bg-white hover:bg-emerald-50/40 border-[#E8DCC8] hover:border-emerald-300 text-[#280619]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10.5px] font-serif font-bold uppercase tracking-wider ${
                statusFilter === 'dispatched' ? 'text-emerald-200' : 'text-emerald-800'
              }`}
            >
              Total Dispatched & Done
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                statusFilter === 'dispatched'
                  ? 'bg-emerald-500/20 text-emerald-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-serif font-black tracking-tight text-emerald-800">
              {dispatchOrders.filter((o) => o.status === 'Dispatched' || o.status === 'Delivered').length}
            </p>
            <span
              className={`text-xs ${
                statusFilter === 'dispatched' ? 'text-emerald-200' : 'text-[#6B4B35]'
              }`}
            >
              orders on the way / delivered
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[10.5px] text-emerald-700">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Assigned to Courier Logistics</span>
          </div>
        </div>
      </div>

      {/* Filter and Quick Tabs Toolbar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8DCC8] shadow-sm space-y-4">
        {/* Quick Filter Status Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#E8DCC8]/70">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-[#200414] text-[#FFE8A3] shadow-xs'
                  : 'bg-[#FAF8F5] text-[#6B4B35] hover:bg-[#FAF0DD] border border-[#E8DCC8]'
              }`}
            >
              All Orders ({dispatchOrders.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all ${
                statusFilter === 'active'
                  ? 'bg-[#200414] text-[#FFE8A3] shadow-xs'
                  : 'bg-[#FAF8F5] text-[#6B4B35] hover:bg-[#FAF0DD] border border-[#E8DCC8]'
              }`}
            >
              In Production ({dispatchOrders.filter((o) => o.status !== 'Delivered' && o.status !== 'Dispatched').length})
            </button>
            <button
              onClick={() => setStatusFilter('ready')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all ${
                statusFilter === 'ready'
                  ? 'bg-amber-900 text-[#FFE8A3] shadow-xs'
                  : 'bg-[#FAF8F5] text-[#6B4B35] hover:bg-[#FAF0DD] border border-[#E8DCC8]'
              }`}
            >
              Ready for Dispatch ({dispatchOrders.filter((o) => o.status === 'Ready for Dispatch').length})
            </button>
            <button
              onClick={() => setStatusFilter('dispatched')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all ${
                statusFilter === 'dispatched'
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#6B4B35] hover:bg-[#FAF0DD] border border-[#E8DCC8]'
              }`}
            >
              Dispatched / Delivered
            </button>
          </div>

          <div className="text-xs font-serif text-[#8C5818]">
            Showing <strong>{filteredOrders.length}</strong> of {dispatchOrders.length} dispatch records
          </div>
        </div>

        {/* Detailed Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C5818] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job #, client, phone, tailor, AWB..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs font-medium text-[#200414] placeholder-[#8C5818]/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Detailed Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs font-serif font-bold text-[#200414] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer appearance-none"
            >
              <option value="all">Status: All Pipelines ({dispatchOrders.length})</option>
              <option value="active">Status: In Production (Active)</option>
              <option value="ready">Status: Ready for Dispatch</option>
              <option value="dispatched">Status: Dispatched / Delivered</option>
              {STATUS_PIPELINE.map((st) => (
                <option key={st} value={st}>
                  Stage: {st}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#8C5818] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs font-serif font-bold text-[#200414] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer appearance-none"
            >
              <option value="">Garment: All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#8C5818] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Priority Filter */}
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs font-serif font-bold text-[#200414] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer appearance-none"
              >
                <option value="all">Priority: All Tiers</option>
                <option value="Normal">Normal Queue</option>
                <option value="Express (48h)">Express (48h)</option>
                <option value="Urgent Wedding VIP">Urgent Wedding VIP</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#8C5818] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {(searchQuery || statusFilter !== 'all' || categoryFilter || priorityFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setCategoryFilter('');
                  setPriorityFilter('all');
                }}
                className="p-2.5 rounded-xl bg-[#FAF0DD] hover:bg-[#FFE59E] text-[#8C5818] hover:text-[#200414] transition-colors border border-[#D4AF37]/50"
                title="Reset all filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Dispatch Details Table - Ultra Premium Haute Couture Design */}
      <div className="bg-white rounded-3xl border border-[#E8DCC8] shadow-[0_12px_45px_-10px_rgba(40,6,25,0.08)] overflow-hidden">
        {/* Table Sub-Header Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#FAF8F5] to-white border-b border-[#E8DCC8] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] shadow-xs" />
            <h2 className="font-serif font-bold text-sm text-[#200414] tracking-wide">
              Live Workshop & Dispatch Manifest
            </h2>
            <span className="text-[11px] font-mono text-[#8C5818] bg-[#FAF0DD] px-2 py-0.5 rounded-md border border-[#D4AF37]/40">
              {filteredOrders.length} records active
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#8C5818]">
            <span className="hidden sm:inline-flex items-center gap-1 font-serif text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Auto-saved to Atelier Storage
            </span>
          </div>
        </div>

        {/* Scrollable Container with defined min-width so columns NEVER cramp */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[1280px]">
            <thead>
              <tr className="bg-gradient-to-r from-[#200414] via-[#2F061E] to-[#200414] text-[#FFE8A3] border-b-2 border-[#D4AF37] font-serif uppercase tracking-[0.12em] text-[10.5px]">
                <th className="py-4 px-5 font-bold w-[160px]">
                  <div className="flex items-center gap-1.5">
                    <span>Job # / Date</span>
                  </div>
                </th>
                <th className="py-4 px-5 font-bold w-[240px]">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#FFE8A3]" />
                    <span>Customer Info</span>
                  </div>
                </th>
                <th className="py-4 px-5 font-bold w-[200px]">
                  <div className="flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-[#FFE8A3]" />
                    <span>Category (Master)</span>
                  </div>
                </th>
                <th className="py-4 px-5 font-bold w-[240px]">
                  <div className="flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-[#FFE8A3]" />
                    <span>Client Measurement</span>
                  </div>
                </th>
                <th className="py-4 px-5 font-bold w-[170px]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#FFE8A3]" />
                    <span>Est. Dispatch Date</span>
                  </div>
                </th>
                <th className="py-4 px-5 font-bold w-[200px]">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#FFE8A3]" />
                    <span>Workflow Status</span>
                  </div>
                </th>
                <th className="py-4 px-5 font-bold w-[180px]">
                  <div className="flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-[#FFE8A3]" />
                    <span>Tailor & Billing</span>
                  </div>
                </th>
                <th className="py-4 px-5 font-bold text-right w-[130px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCC8]/60">
              {filteredOrders.map((order, idx) => {
                const isSelected = viewingOrder?._id === order._id;
                const statusInfo = getStatusStyles(order.status);
                const priorityBorder =
                  order.priority === 'Urgent Wedding VIP'
                    ? 'border-l-4 border-l-rose-600'
                    : order.priority === 'Express (48h)'
                    ? 'border-l-4 border-l-amber-500'
                    : 'border-l-4 border-l-transparent';

                return (
                  <tr
                    key={order._id}
                    className={`transition-all duration-150 ${priorityBorder} ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF8F5]/50'
                    } ${
                      isSelected
                        ? 'bg-[#FFF6D6]/50 ring-2 ring-[#D4AF37]'
                        : 'hover:bg-[#FFF9EE] hover:shadow-xs'
                    }`}
                  >
                    {/* Column 1: Job # & Date */}
                    <td className="py-4 px-5 align-top">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-xs text-[#200414] bg-[#FAF0DD] px-2.5 py-1 rounded-lg border border-[#D4AF37]/60 shadow-2xs">
                          {order.stitchingOrderNumber}
                        </span>
                        <button
                          onClick={() => copyToClipboard(order.stitchingOrderNumber, 'Job #')}
                          className="text-zinc-400 hover:text-[#8C5818] p-1 rounded transition-colors"
                          title="Copy Job #"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-[#8C5818] mt-2">
                        <Calendar className="w-3 h-3 text-[#D4AF37]" />
                        <span>Booked: {order.date}</span>
                      </div>

                      <div className="mt-2">{renderPriorityBadge(order.priority)}</div>
                    </td>

                    {/* Column 2: Customer Info */}
                    <td className="py-4 px-5 align-top">
                      <div className="flex items-start gap-3">
                        {/* Monogram Avatar */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#200414] to-[#450A2C] text-[#FFE8A3] border-2 border-[#D4AF37]/60 flex items-center justify-center font-serif font-black text-xs shadow-xs shrink-0 mt-0.5">
                          {getInitials(order.customerName)}
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-serif font-bold text-sm text-[#200414] leading-snug">
                            {order.customerName}
                          </h4>

                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium text-[#5C3D1E]">{order.customerPhone}</span>
                            <a
                              href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `Namaste ${order.customerName}, this is Nalmara Fashion Atelier regarding your ${order.categoryName} order (${order.stitchingOrderNumber}). Current status: ${order.status}. Estimated dispatch date: ${order.estimatedDispatchDate}.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-md text-emerald-700 hover:bg-emerald-50 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                            </a>
                          </div>

                          {order.customerAddress && (
                            <p
                              className="text-[10.5px] text-[#8C5818] flex items-center gap-1 max-w-[200px] truncate"
                              title={order.customerAddress}
                            >
                              <MapPin className="w-3 h-3 text-[#D4AF37] shrink-0" />
                              <span className="truncate">{order.customerAddress}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Column 3: Category (Master) */}
                    <td className="py-4 px-5 align-top">
                      <div className="space-y-1.5">
                        <Link
                          href={`/stitching/categories`}
                          title="Open Category Master to inspect standard turnaround & templates"
                          className="inline-flex items-center gap-1.5 font-serif font-bold text-xs text-[#200414] hover:text-[#8C5818] bg-[#FAF0DD] px-3 py-1 rounded-full border border-[#D4AF37]/60 group transition-all shadow-2xs"
                        >
                          <Scissors className="w-3 h-3 text-[#8C5818]" />
                          <span>{order.categoryName}</span>
                          <ArrowUpRight className="w-3 h-3 text-[#8C5818] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>

                        <div className="text-[10.5px] text-[#6B4B35]">
                          Fabric: <strong className="text-[#200414]">{order.fabricProvidedBy || 'Customer'}</strong>
                        </div>

                        {order.liningType && (
                          <div className="text-[10px] text-[#8C5818] truncate max-w-[180px]" title={order.liningType}>
                            Lining: {order.liningType}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Column 4: Client Measurement (Directly clickable to customer's exact measurements!) */}
                    <td className="py-4 px-5 align-top">
                      {order.measurementCode || order.measurementId ? (
                        <Link
                          href={`/stitching/measurements?id=${order.measurementId || order.measurementCode}`}
                          className="block p-3 rounded-2xl bg-gradient-to-br from-[#FFFDF9] to-[#FAF0DD]/80 border-2 border-[#D4AF37]/70 hover:border-[#200414] hover:shadow-md transition-all group"
                          title="Click to view customer's exact measurement values on Measurements page"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-xs text-[#8C5818] group-hover:text-[#200414] flex items-center gap-1.5">
                              <Ruler className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>{order.measurementCode || 'Inspect Card'}</span>
                            </span>
                            <span className="text-[10px] font-bold text-[#8C5818] group-hover:text-[#200414] flex items-center gap-0.5">
                              <span>Open</span>
                              <ArrowRight className="w-3 h-3 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
                            </span>
                          </div>

                          {order.measurementSummary ? (
                            <p className="text-[10.5px] text-[#200414] font-semibold mt-1.5 truncate">
                              {order.measurementSummary}
                            </p>
                          ) : (
                            <p className="text-[10px] text-[#6B4B35] mt-1 font-medium">Custom fitted specs</p>
                          )}

                          <div className="mt-1.5 pt-1.5 border-t border-[#D4AF37]/30 flex items-center justify-between text-[9px] text-[#8C5818] font-semibold">
                            <span>Tailor Workshop Record</span>
                            <span className="underline">View Sheet ➔</span>
                          </div>
                        </Link>
                      ) : (
                        <div className="p-3 rounded-2xl bg-zinc-50 border border-dashed border-zinc-300 text-center">
                          <span className="text-[11px] text-zinc-500 font-medium block">No measurement linked</span>
                          <Link
                            href={`/stitching/measurements`}
                            className="inline-flex items-center gap-1 text-[10.5px] text-[#8C5818] font-bold hover:underline mt-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Link Measurement</span>
                          </Link>
                        </div>
                      )}
                    </td>

                    {/* Column 5: Est. Dispatch Date */}
                    <td className="py-4 px-5 align-top">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-[#200414]">
                          <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{order.estimatedDispatchDate}</span>
                        </div>

                        <div>{getDateNotice(order.estimatedDispatchDate, order.status)}</div>

                        {order.actualDispatchDate && (
                          <span className="text-[10px] text-emerald-800 font-medium block">
                            Shipped: {order.actualDispatchDate}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Column 6: Workflow Status */}
                    <td className="py-4 px-5 align-top">
                      <div className="space-y-1.5">
                        <div className="relative inline-block w-full">
                          <select
                            value={order.status}
                            onChange={(e) => updateDispatchStatus(order._id, e.target.value as any)}
                            className={`w-full text-xs font-serif font-bold pl-7 pr-7 py-1.5 rounded-full border cursor-pointer focus:outline-none appearance-none transition-all ${statusInfo.bg}`}
                          >
                            {STATUS_PIPELINE.map((st) => (
                              <option key={st} value={st} className="bg-white text-[#200414]">
                                {st}
                              </option>
                            ))}
                          </select>
                          <span
                            className={`w-2 h-2 rounded-full absolute left-3 top-1/2 -translate-y-1/2 ${statusInfo.dot}`}
                          />
                          <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>

                        {order.trackingNumber && (
                          <div className="flex items-center gap-1 text-[10.5px] font-mono text-[#5C3D1E] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E8DCC8]">
                            <Truck className="w-3 h-3 text-[#D4AF37] shrink-0" />
                            <span className="truncate">{order.trackingNumber}</span>
                            <button
                              onClick={() => copyToClipboard(order.trackingNumber!, 'AWB Tracking')}
                              className="text-zinc-400 hover:text-[#8C5818] ml-auto p-0.5"
                              title="Copy Tracking #"
                            >
                              <Copy className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Column 7: Tailor & Billing */}
                    <td className="py-4 px-5 align-top">
                      <div className="space-y-1">
                        <div className="text-xs font-serif font-bold text-[#200414] flex items-center gap-1">
                          <Scissors className="w-3 h-3 text-[#D4AF37]" />
                          <span>{order.assignedTailor || 'Unassigned'}</span>
                        </div>

                        <div className="text-xs font-semibold text-[#5C3D1E]">
                          Total: <strong className="text-[#200414]">{formatCurrency(order.stitchingCharge)}</strong>
                        </div>

                        <div>
                          {order.balanceDue > 0 ? (
                            <span className="inline-block px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
                              Bal: ₹{order.balanceDue}
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                              Fully Paid ✓
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Column 8: Actions */}
                    <td className="py-4 px-5 align-top text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingOrder(order)}
                          title="View Atelier Job Card"
                          className="p-2 rounded-xl text-[#8C5818] hover:bg-[#FFE59E]/50 hover:text-[#200414] transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(order)}
                          title="Edit Stitching Details"
                          className="p-2 rounded-xl text-[#8C5818] hover:bg-[#FFE59E]/50 hover:text-[#200414] transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(order._id)}
                          title="Delete Order"
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-20 p-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#FAF0DD] border border-[#D4AF37]/50 flex items-center justify-center mx-auto text-[#D4AF37]">
              <Package className="w-8 h-8 opacity-80" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#200414]">No stitching orders matched</h3>
            <p className="text-xs text-[#5C3D1E] max-w-sm mx-auto leading-relaxed">
              No active records matched your filter criteria. Try resetting filters or book a new stitching order.
            </p>
            <div className="pt-2">
              <button
                onClick={openCreateModal}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FFF6D6] via-[#FFE59E] to-[#D4AF37] text-[#200414] text-xs font-serif font-black uppercase tracking-wider shadow-md hover:scale-105 transition-all"
              >
                + Book New Stitching Order
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Order Detail / Atelier Job Sheet Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#FFFDF9] rounded-3xl border-2 border-[#D4AF37] max-w-2xl w-full my-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-gradient-to-r from-[#200414] to-[#3D0A26] text-[#FFFDF9] flex items-center justify-between border-b-2 border-[#D4AF37]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-[#FFE59E] text-[#200414] px-2.5 py-0.5 rounded-md">
                    {viewingOrder.stitchingOrderNumber}
                  </span>
                  <span className="text-xs text-[#FFE59E]/80">Booked on {viewingOrder.date}</span>
                </div>
                <h2 className="text-xl font-serif font-bold text-white mt-1">
                  {viewingOrder.customerName} — {viewingOrder.categoryName}
                </h2>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="p-1.5 rounded-xl text-[#FFE59E] hover:bg-[#FFE59E]/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
              {/* Status Banner */}
              <div className="p-4 rounded-2xl bg-[#FAF0DD]/70 border border-[#D4AF37]/50 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-serif font-bold text-[#8C5818]">Current Progress Stage</span>
                  <p className="font-serif font-black text-lg text-[#200414] mt-0.5">
                    {viewingOrder.status}
                  </p>
                  <p className="text-[11px] text-[#5C3D1E]">
                    Est. Dispatch Deadline: <strong>{viewingOrder.estimatedDispatchDate}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-serif font-bold text-[#8C5818]">Priority Tier</span>
                  <div className="mt-1">{renderPriorityBadge(viewingOrder.priority)}</div>
                </div>
              </div>

              {/* Customer & Tailor Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-[#E8DCC8] shadow-2xs">
                  <span className="text-[10px] uppercase font-serif font-bold text-[#8C5818] block mb-1">
                    Customer Information
                  </span>
                  <p className="font-bold text-sm text-[#200414]">{viewingOrder.customerName}</p>
                  <p className="text-xs text-[#5C3D1E] mt-0.5">Phone: {viewingOrder.customerPhone}</p>
                  {viewingOrder.customerAddress && (
                    <p className="text-[11px] text-[#8C5818] mt-1">{viewingOrder.customerAddress}</p>
                  )}
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E8DCC8] shadow-2xs">
                  <span className="text-[10px] uppercase font-serif font-bold text-[#8C5818] block mb-1">
                    Atelier Workshop Details
                  </span>
                  <p className="font-bold text-sm text-[#200414]">
                    Master: {viewingOrder.assignedTailor || 'General Atelier'}
                  </p>
                  <p className="text-xs text-[#5C3D1E] mt-0.5">
                    Fabric: <strong>{viewingOrder.fabricProvidedBy}</strong>
                  </p>
                  <p className="text-xs text-[#8C5818] mt-0.5">
                    Lining: {viewingOrder.liningType}
                  </p>
                </div>
              </div>

              {/* Linked Measurement Highlight */}
              <div className="bg-[#FAF0DD]/50 p-4 rounded-2xl border border-[#D4AF37] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-serif font-bold text-[#8C5818]">
                    Linked Body Measurement Card
                  </span>
                  <p className="font-serif font-bold text-sm text-[#200414] mt-0.5">
                    {viewingOrder.measurementCode ? `${viewingOrder.measurementCode} (${viewingOrder.categoryName})` : 'No measurement attached'}
                  </p>
                  {viewingOrder.measurementSummary && (
                    <p className="text-xs text-[#5C3D1E] mt-0.5">{viewingOrder.measurementSummary}</p>
                  )}
                </div>
                {viewingOrder.measurementId && (
                  <Link
                    href={`/stitching/measurements?id=${viewingOrder.measurementId}`}
                    target="_blank"
                    className="px-4 py-2 rounded-xl bg-[#200414] text-[#FFE8A3] border border-[#D4AF37] font-serif font-bold text-xs flex items-center gap-1.5 hover:bg-[#3D0A26] shadow-sm transition-colors"
                  >
                    <span>Inspect Measurements</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {/* Additional Information */}
              {viewingOrder.additionalInformation && (
                <div className="bg-white p-4 rounded-2xl border border-[#E8DCC8]">
                  <span className="text-[10px] uppercase font-serif font-bold text-[#8C5818] block mb-1">
                    Additional Styling & Atelier Instructions
                  </span>
                  <p className="text-xs text-[#200414] leading-relaxed whitespace-pre-wrap">
                    {viewingOrder.additionalInformation}
                  </p>
                </div>
              )}

              {/* Financials & Courier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-[#E8DCC8]">
                  <span className="text-[10px] uppercase font-serif font-bold text-[#8C5818] block mb-1">
                    Payment & Fees
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span>Stitching Charge:</span>
                      <strong>{formatCurrency(viewingOrder.stitchingCharge)}</strong>
                    </div>
                    <div className="flex justify-between text-emerald-800">
                      <span>Advance Paid:</span>
                      <strong>{formatCurrency(viewingOrder.advancePaid)}</strong>
                    </div>
                    <div className="flex justify-between border-t border-[#E8DCC8] pt-1.5 text-rose-800 font-bold">
                      <span>Balance Due:</span>
                      <strong>{formatCurrency(viewingOrder.balanceDue)}</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E8DCC8]">
                  <span className="text-[10px] uppercase font-serif font-bold text-[#8C5818] block mb-1">
                    Courier & Dispatch
                  </span>
                  <p className="text-xs text-[#200414]">
                    Courier: <strong>{viewingOrder.courierPartner || 'Not Dispatched Yet'}</strong>
                  </p>
                  <p className="text-xs font-mono text-[#8C5818] mt-1">
                    Tracking AWB: {viewingOrder.trackingNumber || 'Pending'}
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-[#E8DCC8] flex flex-wrap items-center justify-between gap-3">
                <a
                  href={`https://wa.me/${viewingOrder.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Namaste ${viewingOrder.customerName}, this is Nalmara Fashion Atelier Thoothukudi regarding your ${viewingOrder.categoryName} order (${viewingOrder.stitchingOrderNumber}). Status: ${viewingOrder.status}. Estimated dispatch date: ${viewingOrder.estimatedDispatchDate}. Thank you!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Notify via WhatsApp</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const printWin = window.open('', '_blank');
                      if (printWin) {
                        printWin.document.write(`
                          <html>
                            <head>
                              <title>Nalmara Atelier Job Sheet - ${viewingOrder.stitchingOrderNumber}</title>
                              <style>
                                body { font-family: sans-serif; padding: 25px; color: #200414; }
                                h1 { margin: 0; color: #200414; font-size: 22px; }
                                .border-box { border: 2px solid #D4AF37; padding: 15px; border-radius: 8px; margin-top: 15px; }
                                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                                th, td { border: 1px solid #ddd; padding: 8px; font-size: 13px; }
                                th { background: #FAF0DD; text-align: left; }
                              </style>
                            </head>
                            <body>
                              <h1>NALMARA FASHION • Atelier Workshop Job Card</h1>
                              <p>Job #: <strong>${viewingOrder.stitchingOrderNumber}</strong> | Date: <strong>${viewingOrder.date}</strong> | Priority: <strong>${viewingOrder.priority}</strong></p>
                              <div class="border-box">
                                <p>Client: <strong>${viewingOrder.customerName}</strong> (${viewingOrder.customerPhone})</p>
                                <p>Garment: <strong>${viewingOrder.categoryName}</strong> | Master: <strong>${viewingOrder.assignedTailor}</strong></p>
                                <p>Est. Dispatch Deadline: <strong>${viewingOrder.estimatedDispatchDate}</strong></p>
                                <p>Measurement Code: <strong>${viewingOrder.measurementCode || 'N/A'}</strong></p>
                                <p>Lining: <strong>${viewingOrder.liningType}</strong> | Fabric: <strong>${viewingOrder.fabricProvidedBy}</strong></p>
                              </div>
                              <h3>Instructions:</h3>
                              <p>${viewingOrder.additionalInformation || 'None'}</p>
                              <h3>Financials:</h3>
                              <p>Stitching Fee: ₹${viewingOrder.stitchingCharge} | Advance: ₹${viewingOrder.advancePaid} | Balance Due: <strong>₹${viewingOrder.balanceDue}</strong></p>
                            </body>
                          </html>
                        `);
                        printWin.document.close();
                        printWin.print();
                      }
                    }}
                    className="px-4 py-2.5 rounded-2xl border border-[#D4AF37] text-xs font-serif font-bold text-[#8C5818] hover:bg-[#FAF0DD] flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Atelier Card</span>
                  </button>

                  <button
                    onClick={() => {
                      const toEdit = viewingOrder;
                      setViewingOrder(null);
                      openEditModal(toEdit);
                    }}
                    className="px-4 py-2.5 rounded-2xl border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Order Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#FFFDF9] rounded-3xl border-2 border-[#D4AF37] max-w-3xl w-full my-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-gradient-to-r from-[#200414] to-[#3D0A26] text-[#FFFDF9] flex items-center justify-between border-b-2 border-[#D4AF37]">
              <div>
                <span className="text-[10px] font-serif font-bold uppercase tracking-widest text-[#FFE8A3]">
                  Haute Couture Atelier
                </span>
                <h2 className="text-xl font-serif font-bold text-white">
                  {editingOrder ? `Edit Job: ${editingOrder.stitchingOrderNumber}` : 'New Stitching Job & Dispatch Order'}
                </h2>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-xl text-[#FFE8A3] hover:bg-[#FFE8A3]/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Row 1: Booking Date & Category (Master) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-serif font-bold text-[#200414] mb-1">
                    Booking / Order Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs font-medium text-[#200414] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-serif font-bold text-[#200414]">
                      Garment Category (Master) *
                    </label>
                    <Link
                      href="/stitching/categories"
                      target="_blank"
                      className="text-[10px] font-serif font-bold text-[#8C5818] hover:underline flex items-center gap-0.5"
                    >
                      <span>Category Master</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                  <select
                    value={categorySlug}
                    onChange={(e) => {
                      setCategorySlug(e.target.value);
                      const cat = categories.find((c) => c.slug === e.target.value);
                      if (cat) {
                        const turnaround = cat.estimatedTurnaroundDays || 3;
                        const est = new Date();
                        est.setDate(est.getDate() + turnaround);
                        setEstimatedDispatchDate(est.toISOString().split('T')[0]);
                        setStitchingCharge(cat.basePrice || 500);
                        setAdvancePaid(Math.round(cat.basePrice / 2));
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs font-serif font-bold text-[#200414] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name} (from ₹{c.basePrice})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Customer Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-serif font-bold text-[#200414] mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Kavitha Ramachandran"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs font-medium text-[#200414] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block font-serif font-bold text-[#200414] mb-1">
                    Mobile / WhatsApp Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98421 55678"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs font-medium text-[#200414] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-serif font-bold text-[#200414] mb-1">
                  Delivery / Shipping Address
                </label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Door No, Street, Landmark, City & PIN code..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs text-[#200414] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              {/* Row 3: LINK CLIENT MEASUREMENT */}
              <div className="p-4 rounded-2xl bg-[#FAF0DD]/60 border-2 border-[#D4AF37]/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-serif font-bold text-xs text-[#200414] flex items-center gap-1.5">
                    <Ruler className="w-4 h-4 text-[#D4AF37]" />
                    <span>Attach Customer Measurement Record</span>
                  </label>
                  <Link
                    href="/stitching/measurements"
                    target="_blank"
                    className="text-[10.5px] font-serif font-bold text-[#8C5818] hover:underline flex items-center gap-0.5"
                  >
                    <span>Record New Measurements</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                </div>

                <select
                  value={selectedMeasurementId}
                  onChange={(e) => handleMeasurementSelection(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D4AF37]/60 text-xs font-medium text-[#200414] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                >
                  <option value="">-- Select Client Measurement Card (Optional) --</option>
                  {matchedCustomerMeasurements.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.measurementCode} — {m.customerName} ({m.categoryName}) - {m.date}
                    </option>
                  ))}
                </select>

                <p className="text-[10.5px] text-[#6B4B35]">
                  When linked, clicking this measurement on the dispatch details list will take you directly to this client&apos;s full measurement values page.
                </p>
              </div>

              {/* Row 4: Estimated Date, Priority & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-serif font-bold text-[#200414] mb-1">
                    Est. Dispatch Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={estimatedDispatchDate}
                    onChange={(e) => setEstimatedDispatchDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs font-bold text-[#200414] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-serif font-bold text-[#200414] mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs font-serif font-bold text-[#200414] cursor-pointer"
                  >
                    <option value="Normal">Normal (Standard Queue)</option>
                    <option value="Express (48h)">Express (48 Hours Priority)</option>
                    <option value="Urgent Wedding VIP">Urgent Wedding VIP (Immediate)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-serif font-bold text-[#200414] mb-1">
                    Current Status
                  </label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs font-serif font-bold text-[#200414] cursor-pointer"
                  >
                    {STATUS_PIPELINE.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 5: Additional Information */}
              <div>
                <label className="block font-serif font-bold text-[#200414] mb-1">
                  Additional Information (Fabric, Design & Neckline Specifications)
                </label>
                <textarea
                  rows={2}
                  value={additionalInformation}
                  onChange={(e) => setAdditionalInformation(e.target.value)}
                  placeholder="e.g. Princess cut, boat neck with contrast gold tissue piping, dori latkans, padded cups..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs text-[#200414] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              {/* Row 6: Fabric Source, Lining, Master Tailor */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-serif font-bold text-[#200414] mb-1">
                    Fabric Sourced From
                  </label>
                  <select
                    value={fabricProvidedBy}
                    onChange={(e: any) => setFabricProvidedBy(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs text-[#200414]"
                  >
                    <option value="Customer Provided">Customer Provided Material</option>
                    <option value="Store Fabric">Store Fabric Collection</option>
                    <option value="Purchased with Saree">Purchased with Saree Bit</option>
                  </select>
                </div>

                <div>
                  <label className="block font-serif font-bold text-[#200414] mb-1">
                    Lining Quality
                  </label>
                  <input
                    type="text"
                    value={liningType}
                    onChange={(e) => setLiningType(e.target.value)}
                    placeholder="e.g. Pure Mulmul Cotton"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs text-[#200414]"
                  />
                </div>

                <div>
                  <label className="block font-serif font-bold text-[#200414] mb-1">
                    Assigned Master Tailor
                  </label>
                  <input
                    type="text"
                    value={assignedTailor}
                    onChange={(e) => setAssignedTailor(e.target.value)}
                    placeholder="e.g. Master Murugan (Atelier 1)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs text-[#200414]"
                  />
                </div>
              </div>

              {/* Row 7: Pricing & Advance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#FAF0DD]/40 p-3.5 rounded-2xl border border-[#D4AF37]/50">
                <div>
                  <label className="block font-serif font-bold text-[#200414] mb-1">
                    Stitching Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stitchingCharge}
                    onChange={(e) => setStitchingCharge(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D4AF37]/60 text-xs font-bold text-[#200414]"
                  />
                </div>

                <div>
                  <label className="block font-serif font-bold text-[#200414] mb-1">
                    Advance Paid (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={advancePaid}
                    onChange={(e) => setAdvancePaid(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D4AF37]/60 text-xs font-bold text-emerald-800"
                  />
                </div>

                <div>
                  <label className="block font-serif font-bold text-[#200414] mb-1">
                    Balance Due (₹)
                  </label>
                  <div className="px-3.5 py-2 rounded-xl bg-white border border-zinc-300 text-xs font-black text-rose-800">
                    ₹{Math.max(0, Number(stitchingCharge) - Number(advancePaid))}
                  </div>
                </div>
              </div>

              {/* Row 8: Courier Partner & AWB Tracking */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-serif font-bold text-[#200414] mb-1">
                    Courier Partner
                  </label>
                  <input
                    type="text"
                    value={courierPartner}
                    onChange={(e) => setCourierPartner(e.target.value)}
                    placeholder="ST Courier / DTDC / Local Pickup"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs text-[#200414]"
                  />
                </div>
                <div>
                  <label className="block font-serif font-bold text-[#200414] mb-1">
                    Consignment / AWB Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. STC984210982"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs font-mono text-[#200414]"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#E8DCC8] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#FFF6D6] via-[#FFE59E] to-[#D4AF37] text-[#200414] text-xs font-serif font-black uppercase tracking-wider shadow-md hover:scale-[1.02] cursor-pointer"
                >
                  {editingOrder ? 'Update Stitching Job' : 'Create Stitching Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#FFFDF9] rounded-3xl border-2 border-[#D4AF37] p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-serif font-bold text-base text-[#200414]">Delete Stitching Job?</h3>
            <p className="text-xs text-[#5C3D1E] leading-relaxed">
              Are you sure you want to delete this stitching dispatch record? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StitchingDispatchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center p-6">
          <PremiumLoader
            title="Loading Stitching Product Dispatch Details..."
            subtitle="Fetching client measurements, artisan allocations, priority deadlines and courier logistics..."
          />
        </div>
      }
    >
      <DispatchContent />
    </Suspense>
  );
}
