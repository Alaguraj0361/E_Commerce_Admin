'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Scissors,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Layers,
  Sparkles,
  Ruler,
  Package,
  Calendar,
  IndianRupee,
  RotateCcw,
  Sliders,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStitchingStore } from '../../../store/stitchingStore';
import { StitchingCategory, MeasurementFieldDef } from '../../../types';
import { formatCurrency } from '../../../lib/utils';

export default function StitchingCategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory, resetToDefaults } =
    useStitchingStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<StitchingCategory | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState<number>(450);
  const [turnaround, setTurnaround] = useState<number>(3);
  const [isActive, setIsActive] = useState(true);
  const [fields, setFields] = useState<MeasurementFieldDef[]>([]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setBasePrice(500);
    setTurnaround(3);
    setIsActive(true);
    setFields([
      { key: 'chest', label: 'Chest / Bust Size', placeholder: 'e.g. 36', hint: 'Around fullest chest' },
      { key: 'length', label: 'Garment Length', placeholder: 'e.g. 15', hint: 'Shoulder to bottom hem' },
      { key: 'shoulder', label: 'Shoulder Width', placeholder: 'e.g. 14', hint: 'Across back shoulder' },
      { key: 'waist', label: 'Waist Around', placeholder: 'e.g. 30', hint: 'Natural waistline' },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: StitchingCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setBasePrice(cat.basePrice || 0);
    setTurnaround(cat.estimatedTurnaroundDays || 3);
    setIsActive(cat.isActive);
    setFields([...(cat.fields || [])]);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  };

  const handleAddField = () => {
    const key = `field_${Date.now()}`;
    setFields((prev) => [
      ...prev,
      { key, label: 'New Measurement Field', placeholder: 'e.g. 14', hint: 'Measurement description' },
    ]);
  };

  const handleUpdateField = (index: number, key: keyof MeasurementFieldDef, val: string) => {
    setFields((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: val };
      return next;
    });
  };

  const handleRemoveField = (index: number) => {
    setFields((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    const cleanSlug =
      slug.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    if (editingCategory) {
      updateCategory(editingCategory._id, {
        name: name.trim(),
        slug: cleanSlug,
        description: description.trim(),
        basePrice: Number(basePrice) || 0,
        estimatedTurnaroundDays: Number(turnaround) || 1,
        isActive,
        fields,
      });
      toast.success(`Category "${name}" updated successfully`);
    } else {
      addCategory({
        name: name.trim(),
        slug: cleanSlug,
        description: description.trim(),
        basePrice: Number(basePrice) || 0,
        estimatedTurnaroundDays: Number(turnaround) || 1,
        isActive,
        fields,
      });
      toast.success(`Category "${name}" created successfully`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteCategory(id);
    setDeleteConfirmId(null);
    toast.success('Category removed from master list');
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
              <Sliders className="w-3.5 h-3.5 text-[#FFE59E]" />
              <span>Garment Atelier Architecture</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-white flex items-center gap-3">
              Stitching Categories Master
            </h1>
            <p className="text-xs sm:text-sm text-[#FFE59E]/80 max-w-2xl font-light leading-relaxed">
              Configure bespoke garment categories, standard turnaround timelines, baseline atelier stitching pricing, and custom dynamic measurement field templates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/stitching/dispatch"
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-[#D4AF37]/60 text-[#FFE8A3] text-xs font-serif font-bold flex items-center gap-2 backdrop-blur-md transition-all shadow-sm hover:scale-[1.02]"
            >
              <Package className="w-4 h-4 text-[#D4AF37]" />
              <span>Dispatch Details</span>
            </Link>
            <Link
              href="/stitching/measurements"
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-[#D4AF37]/60 text-[#FFE8A3] text-xs font-serif font-bold flex items-center gap-2 backdrop-blur-md transition-all shadow-sm hover:scale-[1.02]"
            >
              <Ruler className="w-4 h-4 text-[#D4AF37]" />
              <span>Customer Measurements</span>
            </Link>
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FFF6D6] via-[#FFE59E] to-[#D4AF37] text-[#200414] text-xs font-serif font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_4px_20px_rgba(212,175,55,0.35)] hover:shadow-[0_6px_25px_rgba(212,175,55,0.5)] hover:scale-[1.03] transition-all cursor-pointer border border-[#FFFDF9]"
            >
              <Plus className="w-4 h-4 text-[#200414] stroke-[3]" />
              <span>New Category</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E8DCC8] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-serif font-bold uppercase tracking-wider text-[#8C5818]">
              Total Categories
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF0DD] border border-[#D4AF37]/50 flex items-center justify-center text-[#8C5818]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-serif font-black tracking-tight text-[#200414]">
              {categories.length}
            </p>
            <span className="text-xs text-[#6B4B35]">tailoring units</span>
          </div>
          <p className="mt-2 text-[10.5px] text-[#8C5818]">Blouses, Salwars, Lehengas, Kurtis</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8DCC8] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-serif font-bold uppercase tracking-wider text-emerald-800">
              Active Booking Services
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-serif font-black tracking-tight text-emerald-800">
              {categories.filter((c) => c.isActive).length}
            </p>
            <span className="text-xs text-[#6B4B35]">enabled services</span>
          </div>
          <p className="mt-2 text-[10.5px] text-emerald-700">Available in dispatch dropdown</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8DCC8] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-serif font-bold uppercase tracking-wider text-[#8C5818]">
              Avg. Turnaround Speed
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF0DD] border border-[#D4AF37]/50 flex items-center justify-center text-[#8C5818]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-serif font-black tracking-tight text-[#200414]">
              {categories.length > 0
                ? Math.round(
                    categories.reduce((acc, c) => acc + (c.estimatedTurnaroundDays || 3), 0) /
                      categories.length
                  )
                : 3}{' '}
              Days
            </p>
            <span className="text-xs text-[#6B4B35]">workshop average</span>
          </div>
          <p className="mt-2 text-[10.5px] text-[#8C5818]">Auto-sets dispatch target date</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8DCC8] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-serif font-bold uppercase tracking-wider text-[#8C5818]">
              Configured Specs
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF0DD] border border-[#D4AF37]/50 flex items-center justify-center text-[#8C5818]">
              <Ruler className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-serif font-black tracking-tight text-[#200414]">
              {categories.reduce((acc, c) => acc + (c.fields?.length || 0), 0)}
            </p>
            <span className="text-xs text-[#6B4B35]">measurement parameters</span>
          </div>
          <p className="mt-2 text-[10.5px] text-[#8C5818]">Dynamic precision fitting fields</p>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8DCC8] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-[#8C5818] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories by name, slug or description..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs font-medium text-[#200414] placeholder-[#8C5818]/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all"
          />
        </div>

        <button
          onClick={resetToDefaults}
          title="Reset to default couture categories"
          className="text-xs text-[#8C5818] hover:text-[#200414] flex items-center gap-1.5 font-serif font-bold cursor-pointer px-3 py-2 rounded-xl bg-[#FAF0DD] hover:bg-[#FFE59E] border border-[#D4AF37]/50 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore Default Master Categories</span>
        </button>
      </div>

      {/* Categories Cards Grid - Ultra-Premium Haute Couture Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCategories.map((cat) => (
          <div
            key={cat._id}
            className="bg-white rounded-3xl border border-[#E8DCC8] shadow-[0_10px_35px_-8px_rgba(40,6,25,0.08)] hover:shadow-[0_15px_45px_-8px_rgba(40,6,25,0.12)] hover:border-[#D4AF37] transition-all flex flex-col justify-between overflow-hidden group"
          >
            {/* Card Header */}
            <div className="p-6 border-b border-[#E8DCC8]/70 space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#200414] to-[#450A2C] text-[#FFE8A3] border-2 border-[#D4AF37]/60 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Scissors className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#200414] leading-snug">
                      {cat.name}
                    </h3>
                    <span className="font-mono text-[10.5px] text-[#8C5818] bg-[#FAF0DD] px-2 py-0.5 rounded-md border border-[#D4AF37]/40">
                      {cat.slug}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-serif font-bold uppercase tracking-wider ${
                    cat.isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-zinc-100 text-zinc-600 border border-zinc-300'
                  }`}
                >
                  {cat.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>

              {cat.description && (
                <p className="text-xs text-[#5C3D1E] line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              )}

              {/* Price & Turnaround Pill */}
              <div className="flex items-center gap-3 pt-1 text-xs">
                <div className="flex items-center gap-1 font-serif font-bold text-[#200414]">
                  <IndianRupee className="w-3.5 h-3.5 text-[#8C5818]" />
                  <span>Base: {formatCurrency(cat.basePrice)}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-[#D4AF37]" />
                <div className="flex items-center gap-1 text-[#8C5818] font-medium">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{cat.estimatedTurnaroundDays || 3} Days Turnaround</span>
                </div>
              </div>
            </div>

            {/* Measurement Fields Preview */}
            <div className="p-6 bg-gradient-to-b from-white to-[#FAF8F5] space-y-3 flex-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-serif font-bold text-[#8C5818] flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Configured Dynamic Template Fields</span>
                </span>
                <span className="text-[11px] font-mono text-[#5C3D1E] font-semibold bg-[#FAF0DD] px-2 py-0.5 rounded border border-[#D4AF37]/30">
                  {cat.fields?.length || 0} fields
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(cat.fields || []).slice(0, 6).map((f) => (
                  <span
                    key={f.key}
                    className="px-2.5 py-1 rounded-lg text-[10.5px] font-medium bg-[#FAF0DD]/80 text-[#200414] border border-[#D4AF37]/40 truncate max-w-[160px]"
                    title={`${f.label} (${f.hint || ''})`}
                  >
                    {f.label}
                  </span>
                ))}
                {(cat.fields?.length || 0) > 6 && (
                  <span className="px-2.5 py-1 rounded-lg text-[10.5px] font-serif font-bold bg-[#FAF0DD] text-[#8C5818] border border-[#D4AF37]/50">
                    +{cat.fields.length - 6} more
                  </span>
                )}
              </div>
            </div>

            {/* Card Actions Footer */}
            <div className="p-4 bg-[#FAF8F5] border-t border-[#E8DCC8] flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <Link
                  href={`/stitching/measurements?category=${cat.slug}`}
                  className="text-xs font-serif font-bold text-[#8C5818] hover:text-[#200414] underline"
                >
                  Measurements
                </Link>
                <span className="text-zinc-300">•</span>
                <Link
                  href={`/stitching/dispatch?category=${cat.slug}`}
                  className="text-xs font-serif font-bold text-[#8C5818] hover:text-[#200414] underline"
                >
                  Dispatch List
                </Link>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-2 rounded-xl text-[#8C5818] hover:text-[#200414] hover:bg-[#FFE59E]/50 transition-colors"
                  title="Edit category"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(cat._id)}
                  className="p-2 rounded-xl text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#E8DCC8] p-8 space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#FAF0DD] border border-[#D4AF37]/50 flex items-center justify-center mx-auto text-[#D4AF37]">
            <Scissors className="w-8 h-8 opacity-80" />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#200414]">No categories found</h3>
          <p className="text-xs text-[#5C3D1E] max-w-sm mx-auto leading-relaxed">
            No tailoring category matched &ldquo;{searchQuery}&rdquo;. Create a new category or reset to defaults.
          </p>
          <div className="pt-2">
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FFF6D6] via-[#FFE59E] to-[#D4AF37] text-[#200414] text-xs font-serif font-black uppercase tracking-wider shadow-md hover:scale-105 transition-all"
            >
              + Create Category
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#FFFDF9] rounded-3xl border-2 border-[#D4AF37] p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-serif font-bold text-base text-[#200414]">Delete Category?</h3>
            <p className="text-xs text-[#5C3D1E] leading-relaxed">
              Are you sure you want to remove this stitching category from the master list? Associated measurements and dispatch records will remain intact.
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#FFFDF9] rounded-3xl border-2 border-[#D4AF37] max-w-2xl w-full my-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-gradient-to-r from-[#200414] to-[#3D0A26] text-[#FFFDF9] flex items-center justify-between border-b-2 border-[#D4AF37]">
              <div>
                <span className="text-[10px] font-serif font-bold uppercase tracking-widest text-[#FFE8A3]">
                  Stitching Master Database
                </span>
                <h2 className="text-xl font-serif font-bold text-white">
                  {editingCategory ? `Edit: ${editingCategory.name}` : 'New Stitching Category'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-[#FFE8A3] hover:bg-[#FFE8A3]/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-serif font-bold text-[#200414] mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Saree Blouse Stitching"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs font-medium text-[#200414] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block font-serif font-bold text-[#200414] mb-1">
                    Category Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. saree-blouse-stitching"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs font-mono text-[#200414] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-serif font-bold text-[#200414] mb-1">
                  Description / Service Scope
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the garment, lining materials, and tailoring finishing..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs text-[#200414] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-serif font-bold text-[#200414] mb-1">
                    Base Stitching Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs font-bold text-[#200414] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block font-serif font-bold text-[#200414] mb-1">
                    Est. Turnaround (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={turnaround}
                    onChange={(e) => setTurnaround(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs font-bold text-[#200414] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-serif font-bold text-[#200414]">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-[#8C5818] focus:ring-[#D4AF37]"
                    />
                    <span>Category Active</span>
                  </label>
                </div>
              </div>

              {/* Dynamic Measurement Template Fields */}
              <div className="pt-3 border-t border-[#E8DCC8] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#200414]">
                      Measurement Fields Template
                    </h4>
                    <p className="text-[11px] text-[#6B4B35]">
                      These specific body measurement inputs will appear when taking measurements for this category.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF0DD] border border-[#D4AF37] text-xs font-serif font-bold text-[#8C5818] hover:bg-[#FFE59E] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Field</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {fields.map((f, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-[#FAF8F5] p-2.5 rounded-2xl border border-[#E8DCC8]"
                    >
                      <input
                        type="text"
                        value={f.label}
                        onChange={(e) => handleUpdateField(idx, 'label', e.target.value)}
                        placeholder="Field Label (e.g. Bust Size)"
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#E8DCC8] text-xs font-bold text-[#200414]"
                      />
                      <input
                        type="text"
                        value={f.placeholder || ''}
                        onChange={(e) => handleUpdateField(idx, 'placeholder', e.target.value)}
                        placeholder="Placeholder (e.g. 36)"
                        className="w-32 px-3 py-1.5 rounded-xl bg-white border border-[#E8DCC8] text-xs text-[#5C3D1E]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveField(idx)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove field"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#E8DCC8] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#FFF6D6] via-[#FFE59E] to-[#D4AF37] text-[#200414] text-xs font-serif font-black uppercase tracking-wider shadow-md hover:scale-[1.02] cursor-pointer"
                >
                  {editingCategory ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
