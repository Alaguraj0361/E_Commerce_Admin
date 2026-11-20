'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Ruler,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  Eye,
  Printer,
  Package,
  Scissors,
  ArrowRight,
  CheckCircle2,
  X,
  FileText,
  Sliders,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ArrowUpRight,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStitchingStore } from '../../../store/stitchingStore';
import { StitchingMeasurement, StitchingCategory } from '../../../types';
import { PremiumLoader } from '../../../components/ui/PremiumLoader';

function getInitials(name: string): string {
  if (!name) return 'AT';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function MeasurementsContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';

  const {
    measurements,
    categories,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,
  } = useStitchingStore();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(initialCategory);
  const [dateFilter, setDateFilter] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<StitchingMeasurement | null>(null);
  const [viewingMeasurement, setViewingMeasurement] = useState<StitchingMeasurement | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerCity, setCustomerCity] = useState('Thoothukudi');
  const [categorySlug, setCategorySlug] = useState('');
  const [measurementValues, setMeasurementValues] = useState<Record<string, string>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [fitPreference, setFitPreference] = useState<'Standard Fit' | 'Comfort Fit' | 'Snug / Tight Fit'>('Comfort Fit');
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  // Handle URL deep-linking (e.g. coming from Dispatch page via ?id=MEAS-1001)
  useEffect(() => {
    if (initialId && measurements.length > 0) {
      const match = measurements.find(
        (m) =>
          m._id.toLowerCase() === initialId.toLowerCase() ||
          m.measurementCode.toLowerCase() === initialId.toLowerCase()
      );
      if (match) {
        setViewingMeasurement(match);
        setSearchQuery(match.measurementCode);
        toast.info(`Inspecting customer measurement sheet for ${match.customerName} (${match.measurementCode})`);
      }
    }
  }, [initialId, measurements]);

  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedField(text);
      toast.success(`Copied ${label} to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Selected category object for active form
  const activeCategoryObj = useMemo(() => {
    return categories.find((c) => c.slug === categorySlug) || categories[0];
  }, [categories, categorySlug]);

  // Filtered list
  const filteredMeasurements = useMemo(() => {
    return measurements.filter((m) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        m.customerName.toLowerCase().includes(q) ||
        m.customerPhone.includes(q) ||
        m.measurementCode.toLowerCase().includes(q) ||
        (m.customerCity && m.customerCity.toLowerCase().includes(q));

      const matchesCategory = !selectedCategoryFilter || m.categorySlug === selectedCategoryFilter;
      const matchesDate = !dateFilter || m.date === dateFilter;

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [measurements, searchQuery, selectedCategoryFilter, dateFilter]);

  const openCreateModal = () => {
    setEditingMeasurement(null);
    setDate(new Date().toISOString().split('T')[0]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setCustomerCity('Thoothukudi');
    const firstCat = categories[0]?.slug || 'saree-blouse-stitching';
    setCategorySlug(firstCat);
    setSpecialInstructions('');
    setFitPreference('Comfort Fit');
    setUnit('inches');

    // Pre-populate initial template measurement inputs
    const initialVals: Record<string, string> = {};
    const cat = categories.find((c) => c.slug === firstCat);
    if (cat?.fields) {
      cat.fields.forEach((f) => {
        initialVals[f.key] = '';
      });
    }
    setMeasurementValues(initialVals);
    setIsFormModalOpen(true);
  };

  const openEditModal = (m: StitchingMeasurement) => {
    setEditingMeasurement(m);
    setDate(m.date);
    setCustomerName(m.customerName);
    setCustomerPhone(m.customerPhone);
    setCustomerEmail(m.customerEmail || '');
    setCustomerCity(m.customerCity || '');
    setCategorySlug(m.categorySlug);
    setMeasurementValues({ ...(m.measurements || {}) });
    setSpecialInstructions(m.specialInstructions || '');
    setFitPreference(m.fitPreference || 'Standard Fit');
    setUnit(m.unit || 'inches');
    setIsFormModalOpen(true);
  };

  const handleCategorySelectChange = (newCatSlug: string) => {
    setCategorySlug(newCatSlug);
    const cat = categories.find((c) => c.slug === newCatSlug);
    if (cat?.fields) {
      const newVals: Record<string, string> = {};
      cat.fields.forEach((f) => {
        newVals[f.key] = measurementValues[f.key] || '';
      });
      setMeasurementValues(newVals);
    }
  };

  const handleMeasurementInputChange = (key: string, val: string) => {
    setMeasurementValues((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !categorySlug) {
      toast.error('Please enter customer name, phone number, and select a category');
      return;
    }

    const cat = categories.find((c) => c.slug === categorySlug);
    const categoryName = cat?.name || categorySlug;

    if (editingMeasurement) {
      updateMeasurement(editingMeasurement._id, {
        date,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerCity: customerCity.trim() || undefined,
        categorySlug,
        categoryName,
        measurements: measurementValues,
        specialInstructions: specialInstructions.trim() || undefined,
        fitPreference,
        unit,
      });
      toast.success(`Measurement record ${editingMeasurement.measurementCode} updated!`);
    } else {
      const created = addMeasurement({
        date,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerCity: customerCity.trim() || undefined,
        categorySlug,
        categoryName,
        measurements: measurementValues,
        specialInstructions: specialInstructions.trim() || undefined,
        fitPreference,
        unit,
      });
      toast.success(`New measurement record ${created.measurementCode} saved successfully!`);
    }

    setIsFormModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteMeasurement(id);
    setDeleteConfirmId(null);
    if (viewingMeasurement?._id === id) setViewingMeasurement(null);
    toast.success('Measurement record deleted');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-[1680px] mx-auto min-h-screen text-[#2A0E1B]">
      {/* Top Haute Couture Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#200414] via-[#350723] to-[#200414] p-6 sm:p-8 text-[#FFFDF9] border border-[#D4AF37]/50 shadow-xl">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#D4AF37]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#FFE59E] text-xs font-serif font-bold tracking-widest uppercase">
              <Ruler className="w-3.5 h-3.5 text-[#FFE59E]" />
              <span>Nalmara Bespoke Tailoring Vault</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-white flex items-center gap-3">
              Customer Measurements Archive
            </h1>
            <p className="text-xs sm:text-sm text-[#FFE59E]/80 max-w-2xl font-light leading-relaxed">
              Store, inspect, and link bespoke client body measurements with category-specific tailoring templates for precision fitting.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/stitching/dispatch"
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-[#D4AF37]/60 text-[#FFE8A3] text-xs font-serif font-bold flex items-center gap-2 backdrop-blur-md transition-all shadow-sm hover:scale-[1.02]"
            >
              <Package className="w-4 h-4 text-[#D4AF37]" />
              <span>Stitching Dispatch Details</span>
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
              <span>Record New Measurement</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E8DCC8] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-serif font-bold uppercase tracking-wider text-[#8C5818]">
              Total Client Profiles
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF0DD] border border-[#D4AF37]/50 flex items-center justify-center text-[#8C5818]">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-serif font-black tracking-tight text-[#200414]">
              {measurements.length}
            </p>
            <span className="text-xs text-[#6B4B35]">stored client cards</span>
          </div>
          <p className="mt-2 text-[10.5px] text-[#8C5818]">Ready for instant order linking</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8DCC8] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-serif font-bold uppercase tracking-wider text-[#8C5818]">
              Garment Categories
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF0DD] border border-[#D4AF37]/50 flex items-center justify-center text-[#8C5818]">
              <Scissors className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-serif font-black tracking-tight text-[#200414]">
              {categories.length}
            </p>
            <span className="text-xs text-[#6B4B35]">custom fitting templates</span>
          </div>
          <p className="mt-2 text-[10.5px] text-[#8C5818]">Blouses, Salwars, Lehengas & Kurtis</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8DCC8] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-serif font-bold uppercase tracking-wider text-[#8C5818]">
              Standard Unit
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF0DD] border border-[#D4AF37]/50 flex items-center justify-center text-[#8C5818]">
              <Ruler className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-serif font-black tracking-tight text-[#200414]">
              Inches (&quot;)
            </p>
            <span className="text-xs text-[#6B4B35]">atelier precision</span>
          </div>
          <p className="mt-2 text-[10.5px] text-[#8C5818]">Supports dual Inches & CM conversion</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8DCC8] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-serif font-bold uppercase tracking-wider text-emerald-800">
              Active Linking Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-serif font-black tracking-tight text-emerald-800">
              100%
            </p>
            <span className="text-xs text-[#6B4B35]">deep-linked to dispatch</span>
          </div>
          <p className="mt-2 text-[10.5px] text-emerald-700">1-click order manifest synchronization</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8DCC8] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto flex-1">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C5818] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, MEAS code, city..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs font-medium text-[#200414] placeholder-[#8C5818]/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs font-serif font-bold text-[#200414] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer appearance-none"
            >
              <option value="">Garment: All Categories ({measurements.length})</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#8C5818] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Date Filter */}
          <div className="relative flex items-center gap-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              title="Filter by recording date"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs font-medium text-[#200414] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />

            {(searchQuery || selectedCategoryFilter || dateFilter) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategoryFilter('');
                  setDateFilter('');
                }}
                className="p-2.5 rounded-xl bg-[#FAF0DD] hover:bg-[#FFE59E] text-[#8C5818] hover:text-[#200414] transition-colors border border-[#D4AF37]/50"
                title="Reset filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="text-xs font-serif text-[#8C5818] shrink-0">
          Showing <strong>{filteredMeasurements.length}</strong> client cards
        </div>
      </div>

      {/* Main Measurements Table - Ultra Premium Design */}
      <div className="bg-white rounded-3xl border border-[#E8DCC8] shadow-[0_12px_45px_-10px_rgba(40,6,25,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[1240px]">
            <thead>
              <tr className="bg-gradient-to-r from-[#200414] via-[#2F061E] to-[#200414] text-[#FFE8A3] border-b-2 border-[#D4AF37] font-serif uppercase tracking-[0.12em] text-[10.5px]">
                <th className="py-4 px-5 font-bold w-[160px]">Code / Date</th>
                <th className="py-4 px-5 font-bold w-[250px]">Customer Details</th>
                <th className="py-4 px-5 font-bold w-[200px]">Garment Category</th>
                <th className="py-4 px-5 font-bold w-[360px]">Category Measurement Highlights</th>
                <th className="py-4 px-5 font-bold w-[130px]">Fit / Unit</th>
                <th className="py-4 px-5 font-bold text-right w-[140px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCC8]/60">
              {filteredMeasurements.map((m, idx) => {
                const isSelected = viewingMeasurement?._id === m._id;
                return (
                  <tr
                    key={m._id}
                    className={`transition-all duration-150 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF8F5]/50'
                    } ${
                      isSelected
                        ? 'bg-[#FFF6D6]/50 ring-2 ring-[#D4AF37]'
                        : 'hover:bg-[#FFF9EE] hover:shadow-xs'
                    }`}
                  >
                    {/* Code & Date */}
                    <td className="py-4 px-5 align-top">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-xs text-[#200414] bg-[#FAF0DD] px-2.5 py-1 rounded-lg border border-[#D4AF37]/60 shadow-2xs">
                          {m.measurementCode}
                        </span>
                        <button
                          onClick={() => copyToClipboard(m.measurementCode, 'Measurement Code')}
                          className="text-zinc-400 hover:text-[#8C5818] p-1 rounded transition-colors"
                          title="Copy Code"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-[#8C5818] mt-2">
                        <Calendar className="w-3 h-3 text-[#D4AF37]" />
                        <span>{m.date}</span>
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="py-4 px-5 align-top">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#200414] to-[#450A2C] text-[#FFE8A3] border-2 border-[#D4AF37]/60 flex items-center justify-center font-serif font-black text-xs shadow-xs shrink-0 mt-0.5">
                          {getInitials(m.customerName)}
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-serif font-bold text-sm text-[#200414]">
                            {m.customerName}
                          </h4>

                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium text-[#5C3D1E]">{m.customerPhone}</span>
                            <a
                              href={`https://wa.me/${m.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `Namaste ${m.customerName}, this is Nalmara Fashion Atelier regarding your recorded bespoke measurements for ${m.categoryName} (${m.measurementCode}).`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-md text-emerald-700 hover:bg-emerald-50 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                            </a>
                          </div>

                          {m.customerCity && (
                            <p className="text-[10.5px] text-[#8C5818] flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#D4AF37] shrink-0" />
                              <span>{m.customerCity}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Garment Category */}
                    <td className="py-4 px-5 align-top">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 font-serif font-bold text-xs text-[#200414] bg-[#FAF0DD] px-3 py-1 rounded-full border border-[#D4AF37]/60 shadow-2xs">
                          <Scissors className="w-3 h-3 text-[#8C5818]" />
                          <span>{m.categoryName}</span>
                        </span>
                        <div className="text-[10px] font-mono text-[#8C5818] pl-1">
                          Template: {m.categorySlug}
                        </div>
                      </div>
                    </td>

                    {/* Category-based Measurements Preview */}
                    <td className="py-4 px-5 align-top">
                      <div className="flex flex-wrap gap-1.5 max-w-sm">
                        {Object.entries(m.measurements || {}).map(([k, v]) => {
                          if (!v) return null;
                          return (
                            <span
                              key={k}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FAF0DD]/70 text-[#200414] border border-[#D4AF37]/50 shadow-2xs"
                            >
                              <strong className="text-[#8C5818] capitalize font-bold">
                                {k.replace(/([A-Z])/g, ' $1')}:
                              </strong>{' '}
                              {v}
                              {m.unit === 'inches' ? '"' : 'cm'}
                            </span>
                          );
                        })}
                      </div>
                      {m.specialInstructions && (
                        <p className="text-[10.5px] text-[#6B4B35] mt-1.5 italic line-clamp-1">
                          &ldquo;{m.specialInstructions}&rdquo;
                        </p>
                      )}
                    </td>

                    {/* Fit / Unit */}
                    <td className="py-4 px-5 align-top">
                      <div className="space-y-1">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-serif font-bold uppercase tracking-wider bg-[#FAF0DD] text-[#8C5818] border border-[#D4AF37]/60">
                          {m.fitPreference || 'Standard'}
                        </span>
                        <div className="text-[11px] text-[#5C3D1E] font-mono">
                          Unit: {m.unit || 'inches'}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 align-top text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* 1-Click Launch Dispatch Order pre-filled with this measurement */}
                        <Link
                          href={`/stitching/dispatch?measurementId=${m._id}`}
                          title="Create Stitching Dispatch Order with this measurement"
                          className="p-2 rounded-xl bg-gradient-to-r from-[#FFF6D6] to-[#FFE59E] border border-[#D4AF37] text-[#200414] hover:shadow-sm hover:scale-105 transition-all"
                        >
                          <Package className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setViewingMeasurement(m)}
                          title="View Full Measurement Card"
                          className="p-2 rounded-xl text-[#8C5818] hover:bg-[#FFE59E]/50 hover:text-[#200414] transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(m)}
                          title="Edit Measurements"
                          className="p-2 rounded-xl text-[#8C5818] hover:bg-[#FFE59E]/50 hover:text-[#200414] transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(m._id)}
                          title="Delete Record"
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

        {filteredMeasurements.length === 0 && (
          <div className="text-center py-20 p-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#FAF0DD] border border-[#D4AF37]/50 flex items-center justify-center mx-auto text-[#D4AF37]">
              <Ruler className="w-8 h-8 opacity-80" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#200414]">No measurement records found</h3>
            <p className="text-xs text-[#5C3D1E] max-w-sm mx-auto leading-relaxed">
              No measurements matched your search criteria. Record a new client body measurement sheet to start.
            </p>
            <div className="pt-2">
              <button
                onClick={openCreateModal}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FFF6D6] via-[#FFE59E] to-[#D4AF37] text-[#200414] text-xs font-serif font-black uppercase tracking-wider shadow-md hover:scale-105 transition-all"
              >
                + Record First Measurement
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Measurement Drawer / Card Modal */}
      {viewingMeasurement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#FFFDF9] rounded-3xl border-2 border-[#D4AF37] max-w-xl w-full my-8 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 bg-gradient-to-r from-[#200414] to-[#3D0A26] text-[#FFFDF9] flex items-center justify-between border-b-2 border-[#D4AF37]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-[#FFE59E] text-[#200414] px-2.5 py-0.5 rounded-md">
                    {viewingMeasurement.measurementCode}
                  </span>
                  <span className="text-xs text-[#FFE59E]/80">Recorded on {viewingMeasurement.date}</span>
                </div>
                <h2 className="text-xl font-serif font-bold text-white mt-1">
                  {viewingMeasurement.customerName}
                </h2>
              </div>
              <button
                onClick={() => setViewingMeasurement(null)}
                className="p-1.5 rounded-xl text-[#FFE59E] hover:bg-[#FFE59E]/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs overflow-y-auto max-h-[75vh]">
              {/* Category & Contact Banner */}
              <div className="bg-[#FAF0DD]/70 p-4 rounded-2xl border border-[#D4AF37]/50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-serif font-bold text-[#8C5818]">Category</span>
                  <p className="font-serif font-bold text-base text-[#200414] mt-0.5">
                    {viewingMeasurement.categoryName}
                  </p>
                  <p className="text-xs text-[#5C3D1E] mt-0.5 font-mono">
                    Phone: {viewingMeasurement.customerPhone}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-serif font-bold text-[#8C5818]">Fit & Unit</span>
                  <p className="font-serif font-bold text-xs text-[#200414]">
                    {viewingMeasurement.fitPreference || 'Standard Fit'}
                  </p>
                  <p className="text-[11px] text-[#5C3D1E] font-mono capitalize">
                    {viewingMeasurement.unit || 'inches'}
                  </p>
                </div>
              </div>

              {/* Full Category-Specific Measurements Grid */}
              <div>
                <h4 className="font-serif font-bold text-sm text-[#200414] mb-2.5 flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-[#D4AF37]" />
                  <span>Category Measurement Values</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(viewingMeasurement.measurements || {}).map(([key, val]) => (
                    <div
                      key={key}
                      className="bg-white p-3 rounded-2xl border border-[#E8DCC8] shadow-2xs"
                    >
                      <span className="text-[10px] uppercase font-serif font-bold text-[#8C5818] block truncate">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="font-serif font-black text-lg text-[#200414] mt-1 block">
                        {val || '-'} {val && (viewingMeasurement.unit === 'inches' ? '"' : 'cm')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              {viewingMeasurement.specialInstructions && (
                <div className="bg-white p-4 rounded-2xl border border-[#E8DCC8]">
                  <span className="text-[10px] uppercase font-serif font-bold text-[#8C5818] block mb-1">
                    Special Tailoring Instructions & Fit Notes
                  </span>
                  <p className="text-xs text-[#200414] leading-relaxed">
                    {viewingMeasurement.specialInstructions}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E8DCC8] flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={`/stitching/dispatch?measurementId=${viewingMeasurement._id}`}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FFF6D6] via-[#FFE59E] to-[#D4AF37] text-[#200414] text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:scale-[1.02] transition-all"
                >
                  <Package className="w-4 h-4" />
                  <span>Create Dispatch Order</span>
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Nalmara Tailor Slip - ${viewingMeasurement.measurementCode}</title>
                              <style>
                                body { font-family: sans-serif; padding: 25px; color: #200414; }
                                h1 { margin: 0; color: #200414; font-size: 20px; }
                                .header { border-bottom: 2px solid #D4AF37; padding-bottom: 10px; margin-bottom: 15px; }
                                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                                th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                                th { background: #FAF0DD; }
                              </style>
                            </head>
                            <body>
                              <div class="header">
                                <h1>NALMARA FASHION • Atelier Job Sheet</h1>
                                <p style="margin: 2px 0 8px 0; font-size: 11px; color: #555;">Store &amp; Atelier: Q4R8+3FC, 3rd Mile, Near Bus Stop, Thoothukudi, 628008</p>
                                <p>Client: <strong>${viewingMeasurement.customerName}</strong> (${viewingMeasurement.customerPhone}) | Date: ${viewingMeasurement.date}</p>
                                <p>Garment: <strong>${viewingMeasurement.categoryName}</strong> | Code: <strong>${viewingMeasurement.measurementCode}</strong></p>
                              </div>
                              <table>
                                <thead>
                                  <tr><th>Measurement Area</th><th>Measurement (${viewingMeasurement.unit})</th></tr>
                                </thead>
                                <tbody>
                                  ${Object.entries(viewingMeasurement.measurements || {})
                                    .map(([k, v]) => `<tr><td>${k.replace(/([A-Z])/g, ' $1')}</td><td><strong>${v}</strong></td></tr>`)
                                    .join('')}
                                </tbody>
                              </table>
                              <p style="margin-top: 20px;"><strong>Instructions:</strong> ${viewingMeasurement.specialInstructions || 'None'}</p>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                        printWindow.print();
                      }
                    }}
                    className="px-4 py-2.5 rounded-2xl border border-[#D4AF37] text-xs font-serif font-bold text-[#8C5818] hover:bg-[#FAF0DD] flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Slip</span>
                  </button>
                  <button
                    onClick={() => {
                      const toEdit = viewingMeasurement;
                      setViewingMeasurement(null);
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

      {/* Add / Edit Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#FFFDF9] rounded-3xl border-2 border-[#D4AF37] max-w-3xl w-full my-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-gradient-to-r from-[#200414] to-[#3D0A26] text-[#FFFDF9] flex items-center justify-between border-b-2 border-[#D4AF37]">
              <div>
                <span className="text-[10px] font-serif font-bold uppercase tracking-widest text-[#FFE8A3]">
                  Haute Couture Atelier
                </span>
                <h2 className="text-xl font-serif font-bold text-white">
                  {editingMeasurement ? `Edit: ${editingMeasurement.customerName}` : 'Record Customer Measurements'}
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
              {/* Row 1: Date & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-serif font-bold text-[#200414] mb-1">
                    Measurement Date *
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
                      Garment Category *
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
                    onChange={(e) => handleCategorySelectChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs font-serif font-bold text-[#200414] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Customer Name, Phone, City */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <div>
                  <label className="block font-serif font-bold text-[#200414] mb-1">
                    City / Town
                  </label>
                  <input
                    type="text"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    placeholder="e.g. Thoothukudi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs text-[#200414] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Row 3: Fit & Unit Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF0DD]/40 p-3.5 rounded-2xl border border-[#D4AF37]/50">
                <div>
                  <label className="block font-serif font-bold text-[#200414] mb-1">
                    Customer Fit Preference
                  </label>
                  <select
                    value={fitPreference}
                    onChange={(e: any) => setFitPreference(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D4AF37]/60 text-xs text-[#200414]"
                  >
                    <option value="Comfort Fit">Comfort Fit (Easy wear with ease margin)</option>
                    <option value="Snug / Tight Fit">Snug / Tight Fit (Bridal sculpted body fit)</option>
                    <option value="Standard Fit">Standard Fit (Regular classic tailoring)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-serif font-bold text-[#200414] mb-1">
                    Measurement Unit
                  </label>
                  <div className="flex items-center gap-5 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer font-serif font-bold text-xs text-[#200414]">
                      <input
                        type="radio"
                        name="unit"
                        value="inches"
                        checked={unit === 'inches'}
                        onChange={() => setUnit('inches')}
                        className="text-[#8C5818] focus:ring-[#D4AF37]"
                      />
                      <span>Inches (&quot;)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-serif font-bold text-xs text-[#200414]">
                      <input
                        type="radio"
                        name="unit"
                        value="cm"
                        checked={unit === 'cm'}
                        onChange={() => setUnit('cm')}
                        className="text-[#8C5818] focus:ring-[#D4AF37]"
                      />
                      <span>Centimeters (cm)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* DYNAMIC CATEGORY-BASED MEASUREMENT INPUT FIELDS */}
              <div className="pt-2 border-t border-[#E8DCC8] space-y-3">
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#200414] flex items-center gap-1.5">
                    <Scissors className="w-4 h-4 text-[#D4AF37]" />
                    <span>{activeCategoryObj?.name || 'Garment'} Measurement Fields</span>
                  </h3>
                  <p className="text-[11px] text-[#6B4B35]">
                    Enter exact body measurements for this garment in {unit}.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(activeCategoryObj?.fields || []).map((field) => (
                    <div
                      key={field.key}
                      className="bg-[#FAF0DD]/50 p-3 rounded-2xl border border-[#D4AF37]/50 space-y-1"
                    >
                      <label className="block font-serif font-bold text-[11px] text-[#200414]">
                        {field.label}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={measurementValues[field.key] || ''}
                          onChange={(e) => handleMeasurementInputChange(field.key, e.target.value)}
                          placeholder={field.placeholder || 'e.g. 14.5'}
                          className="w-full px-3 py-1.5 pr-8 rounded-xl bg-white border border-[#D4AF37]/60 text-xs font-bold text-[#200414] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#8C5818] font-mono">
                          {unit === 'inches' ? '"' : 'cm'}
                        </span>
                      </div>
                      {field.hint && (
                        <span className="text-[10px] text-[#8C5818] block truncate" title={field.hint}>
                          {field.hint}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block font-serif font-bold text-[#200414] mb-1">
                  Special Tailoring Notes & Cut Instructions
                </label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Back pot neck depth 9.5 inches with dori latkans, 2-inch side seam margin, princess seam..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs text-[#200414] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#E8DCC8] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#FFF6D6] via-[#FFE59E] to-[#D4AF37] text-[#200414] text-xs font-serif font-black uppercase tracking-wider shadow-md hover:scale-[1.02] cursor-pointer"
                >
                  {editingMeasurement ? 'Update Measurements' : 'Save Measurements'}
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
            <h3 className="font-serif font-bold text-base text-[#200414]">Delete Measurement Record?</h3>
            <p className="text-xs text-[#5C3D1E] leading-relaxed">
              Are you sure you want to permanently delete this customer measurement record?
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

export default function StitchingMeasurementsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center p-6">
          <PremiumLoader
            title="Loading Customer Measurements Archive..."
            subtitle="Accessing bespoke client body profiles, custom fit parameters and atelier templates..."
          />
        </div>
      }
    >
      <MeasurementsContent />
    </Suspense>
  );
}
