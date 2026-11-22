'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  RefreshCw,
  ExternalLink,
  Check,
  Copy,
  LayoutGrid,
  List,
  Sparkles,
  ArrowUpDown,
  ImageIcon,
  Eye,
  Store,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Category } from '../../types';
import { toast } from 'sonner';
import { SingleImageUpload } from '@/components/ui/ImageUpload';
import { PremiumLoader } from '@/components/ui/PremiumLoader';

type SortOption = 'name-asc' | 'name-desc' | 'newest' | 'oldest';
type StatusFilter = 'all' | 'active' | 'inactive';

// Helper to strip markdown formatting like ** or excessive symbols for clean display
const cleanDescription = (text?: string): string => {
  if (!text) return 'No descriptive overview provided for this category.';
  return text.replace(/\*\*/g, '').replace(/__+/g, '').trim();
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isTogglingStatusId, setIsTogglingStatusId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/categories?all=true');
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load categories');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImage('');
    setIsActive(true);
    setIsSlugManuallyEdited(false);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImage(cat.image || '');
    setIsActive(cat.isActive ?? true);
    setIsSlugManuallyEdited(true);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugManuallyEdited) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        slug:
          slug.trim() ||
          name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-'),
        description: description.trim(),
        image: image.trim(),
        isActive,
      };

      if (editingCategory) {
        const res = await api.put(`/categories/${editingCategory._id}`, payload);
        if (res.data?.success) {
          toast.success(`Category "${payload.name}" updated successfully`);
          setIsModalOpen(false);
          fetchCategories();
        }
      } else {
        const res = await api.post('/categories', payload);
        if (res.data?.success) {
          toast.success(`Category "${payload.name}" created successfully`);
          setIsModalOpen(false);
          fetchCategories();
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save category');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Instant 1-Click Status Toggle
  const handleToggleStatus = async (cat: Category, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setIsTogglingStatusId(cat._id);
      const newActive = !cat.isActive;
      const res = await api.put(`/categories/${cat._id}`, {
        ...cat,
        isActive: newActive,
      });
      if (res.data?.success) {
        setCategories((prev) =>
          prev.map((c) => (c._id === cat._id ? { ...c, isActive: newActive } : c))
        );
        toast.success(
          `Category "${cat.name}" is now ${newActive ? 'Active in Storefront' : 'Hidden from Storefront'}`
        );
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update category status');
    } finally {
      setIsTogglingStatusId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await api.delete(`/categories/${id}`);
      if (res.data?.success) {
        toast.success('Category removed successfully');
        setCategories((prev) => prev.filter((c) => c._id !== id));
        setDeleteConfirmId(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success('Category ID copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Metrics calculations
  const totalCount = categories.length;
  const activeCount = useMemo(() => categories.filter((c) => c.isActive !== false).length, [categories]);
  const inactiveCount = totalCount - activeCount;
  const withImageCount = useMemo(() => categories.filter((c) => !!c.image).length, [categories]);

  // Filtering & Sorting
  const filteredCategories = useMemo(() => {
    let result = categories.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (c.name || '').toLowerCase().includes(q) ||
        (c.slug || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter === 'active') return c.isActive !== false;
      if (statusFilter === 'inactive') return c.isActive === false;
      return true;
    });

    result.sort((a, b) => {
      if (sortOption === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      if (sortOption === 'name-desc') return (b.name || '').localeCompare(a.name || '');
      if (sortOption === 'newest') return (b._id || '').localeCompare(a._id || '');
      if (sortOption === 'oldest') return (a._id || '').localeCompare(b._id || '');
      return 0;
    });

    return result;
  }, [categories, searchQuery, statusFilter, sortOption]);

  const activeCategoryForDeletion = useMemo(
    () => categories.find((c) => c._id === deleteConfirmId),
    [categories, deleteConfirmId]
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* ========================================================= */}
      {/* 1. MAJESTIC TOP HEADER                                    */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-[#FFFDF9] via-[#FAF4EA] to-[#F5ECE0] border border-[#E8DCC9] rounded-3xl p-6 sm:p-8 shadow-[0_12px_36px_rgba(45,6,30,0.06)] relative overflow-hidden">
        {/* Subtle royal background ornament */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-gradient-to-br from-[#760159]/5 to-[#D4AF37]/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#760159]/10 border border-[#760159]/20 text-[#760159] text-[11px] font-bold tracking-wider uppercase font-mono shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              Storefront Taxonomy &amp; Catalog Hierarchy
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1E0A10] font-serif flex items-center gap-3">
              Taxonomy &amp; Categories
              <span className="text-xs font-mono font-bold bg-[#760159] text-[#FFE59E] border border-[#D4AF37]/60 px-3 py-1 rounded-full shadow-xs">
                {totalCount} Collections
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[#5C3D1E] max-w-2xl leading-relaxed">
              Curate customer navigation tiers, configure category cover photography, control storefront visibility, and map collections directly to Nalmara Fashion catalog products.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live Storefront Link */}
            <a
              href="https://nalmarafashion.vercel.app/shop"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF4EA] border border-[#D4AF37]/50 text-[#760159] text-xs font-bold transition-all shadow-xs hover:shadow-md"
              title="Open Live Shop Catalog in new tab"
            >
              <Store className="w-4 h-4 text-[#D4AF37]" />
              <span>Live Storefront</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#8C7E72]" />
            </a>

            {/* Refresh List */}
            <button
              onClick={fetchCategories}
              className="p-2.5 rounded-xl border border-[#D4AF37]/40 bg-white hover:bg-[#FAF4EA] text-[#5C3D1E] hover:text-[#760159] transition-all shadow-xs"
              title="Refresh Collections List"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#760159]' : ''}`} />
            </button>

            {/* Add New Category Button */}
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#760159] via-[#54013F] to-[#380725] hover:brightness-110 text-[#FFE59E] border border-[#D4AF37] font-bold text-xs tracking-wider uppercase transition-all shadow-[0_6px_20px_rgba(118,1,89,0.25)] active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#FFE59E]" />
              <span>Add Category</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. STATS & HEALTH METRICS TILES                           */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Total */}
        <div className="bg-white border border-[#E8DCC9] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4 hover:border-[#D4AF37]/60 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#760159]/15 to-[#FFE59E]/30 flex items-center justify-center shrink-0 border border-[#D4AF37]/30">
            <FolderTree className="w-6 h-6 text-[#760159]" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B5A4B]">Total Collections</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-[#1E0A10] font-serif">{totalCount}</span>
              <span className="text-[10px] font-medium text-[#760159]">In Catalog</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Active */}
        <div className="bg-white border border-[#E8DCC9] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4 hover:border-emerald-300 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-200">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B5A4B]">Active in Store</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-emerald-700 font-serif">{activeCount}</span>
              <span className="text-[10px] font-medium text-emerald-600">
                {totalCount > 0 ? `${Math.round((activeCount / totalCount) * 100)}% live` : '0%'}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Hidden / Drafts */}
        <div className="bg-white border border-[#E8DCC9] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4 hover:border-amber-300 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-200">
            <Layers className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B5A4B]">Hidden / Drafts</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-amber-700 font-serif">{inactiveCount}</span>
              <span className="text-[10px] font-medium text-amber-600">Unpublished</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Imagery Health */}
        <div className="bg-white border border-[#E8DCC9] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4 hover:border-[#D4AF37]/60 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF4EA] flex items-center justify-center shrink-0 border border-[#D4AF37]/30">
            <ImageIcon className="w-6 h-6 text-[#8C5818]" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B5A4B]">Visual Coverage</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-[#1E0A10] font-serif">
                {totalCount > 0 ? `${Math.round((withImageCount / totalCount) * 100)}%` : '0%'}
              </span>
              <span className="text-[10px] font-medium text-[#8C5818]">{withImageCount}/{totalCount} with photos</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. SEARCH, FILTERS & VIEW MODE CONTROLS BAR               */}
      {/* ========================================================= */}
      <div className="bg-white border border-[#E8DCC9] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8C7E72] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search categories by name, slug, or keywords..."
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

        {/* Filter Pills, Sort & View Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Tabs */}
          <div className="flex items-center p-1 bg-[#FAF4EA] border border-[#E8DCC9] rounded-xl text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-[#760159] text-[#FFE59E] shadow-xs font-bold'
                  : 'text-[#6B5A4B] hover:text-[#1E0A10]'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'active'
                  ? 'bg-emerald-700 text-white shadow-xs font-bold'
                  : 'text-[#6B5A4B] hover:text-[#1E0A10]'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'inactive'
                  ? 'bg-amber-700 text-white shadow-xs font-bold'
                  : 'text-[#6B5A4B] hover:text-[#1E0A10]'
              }`}
            >
              Hidden ({inactiveCount})
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E8DCC9] rounded-xl px-3 py-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#8C7E72]" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-transparent text-[#1E0A10] font-medium focus:outline-none cursor-pointer"
            >
              <option value="name-asc">Name (A → Z)</option>
              <option value="name-desc">Name (Z → A)</option>
              <option value="newest">Recently Added</option>
              <option value="oldest">Earliest Added</option>
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 bg-[#FAF4EA] border border-[#E8DCC9] rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-[#760159] shadow-xs'
                  : 'text-[#8C7E72] hover:text-[#1E0A10]'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-[#760159] shadow-xs'
                  : 'text-[#8C7E72] hover:text-[#1E0A10]'
              }`}
              title="Table List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. MAIN CONTENT DISPLAY (GRID OR TABLE)                   */}
      {/* ========================================================= */}
      {isLoading ? (
        <div className="py-12 bg-white border border-[#E8DCC9] rounded-3xl">
          <PremiumLoader
            title="Loading Storefront Collections..."
            subtitle="Fetching catalog hierarchy, cover imagery, and storefront metadata..."
            compact
          />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white border border-[#E8DCC9] rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF4EA] border border-[#D4AF37]/40 flex items-center justify-center text-[#760159]">
            <FolderTree className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#1E0A10] font-serif">No categories found</h3>
            <p className="text-xs text-[#6B5A4B] max-w-sm mx-auto">
              {searchQuery
                ? `No collections matched "${searchQuery}". Try a different search term or clear the filter.`
                : 'No collections currently exist in your catalog. Click "Add Category" above to create your first collection.'}
            </p>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-xl bg-[#760159] text-[#FFE59E] text-xs font-bold hover:brightness-110 transition-all shadow-xs"
            >
              Clear Search Query
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white border border-[#E8DCC9] hover:border-[#D4AF37] rounded-3xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(118,1,89,0.12)] transition-all duration-300 group flex flex-col justify-between relative"
            >
              <div>
                {/* Visual Cover Banner Frame */}
                <div className="h-48 relative bg-gradient-to-br from-[#2D0A20] via-[#1A0512] to-[#0A0208] overflow-hidden">
                  {cat.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#D4AF37]/60 space-y-2">
                      <FolderTree className="w-12 h-12" />
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#FFE59E]/70">No Cover Photo</span>
                    </div>
                  )}

                  {/* Multi-stop High-Contrast Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#16030F] via-[#16030F]/65 to-transparent pointer-events-none" />

                  {/* Top Floating Controls */}
                  <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-10">
                    {/* Slug Monospace Pill */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-[#16030F]/80 backdrop-blur-md text-[#FFE59E] border border-[#D4AF37]/40 shadow-xs">
                      /{cat.slug}
                    </span>

                    {/* Interactive 1-Click Status Badge */}
                    <button
                      onClick={(e) => handleToggleStatus(cat, e)}
                      disabled={isTogglingStatusId === cat._id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-md transition-all shadow-xs cursor-pointer ${
                        cat.isActive !== false
                          ? 'bg-emerald-950/85 text-emerald-300 border border-emerald-500/60 hover:bg-emerald-900'
                          : 'bg-zinc-950/85 text-zinc-300 border border-zinc-600/60 hover:bg-zinc-900'
                      }`}
                      title="Click to toggle storefront visibility"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          cat.isActive !== false ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-400'
                        }`}
                      />
                      <span>{cat.isActive !== false ? 'Active' : 'Hidden'}</span>
                    </button>
                  </div>

                  {/* Bottom Text Over Image */}
                  <div className="absolute bottom-3.5 left-4 right-4 z-10">
                    <h3 className="font-serif font-black text-white text-xl leading-tight drop-shadow-md group-hover:text-[#FFE59E] transition-colors">
                      {cat.name}
                    </h3>
                  </div>
                </div>

                {/* Card Body & Description */}
                <div className="p-5 space-y-3">
                  <p className="text-xs text-[#5C3D1E] leading-relaxed line-clamp-3 font-normal min-h-[48px]">
                    {cleanDescription(cat.description)}
                  </p>

                  {/* Storefront Path Pill */}
                  <div className="pt-2 border-t border-[#F2EAE0] flex items-center justify-between text-[11px]">
                    <span className="text-[#8C7E72] font-medium">Storefront URL:</span>
                    <a
                      href={`https://nalmarafashion.vercel.app/shop?category=${cat.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[#760159] hover:text-[#D4AF37] hover:underline flex items-center gap-1 text-[10.5px]"
                    >
                      <span>/shop?category={cat.slug}</span>
                      <ExternalLink className="w-3 h-3 text-[#D4AF37]" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3.5 bg-[#FAF8F5] border-t border-[#E8DCC9] flex items-center justify-between">
                {/* ID with Copy Feature */}
                <button
                  onClick={(e) => handleCopyId(cat._id, e)}
                  className="inline-flex items-center gap-1 text-[10px] text-[#8C7E72] hover:text-[#760159] font-mono transition-colors"
                  title="Click to copy full ID"
                >
                  <span>ID: {(cat._id || '').slice(-6)}</span>
                  {copiedId === cat._id ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>

                {/* Actions Toolbar */}
                <div className="flex items-center gap-1.5">
                  <a
                    href={`https://nalmarafashion.vercel.app/shop?category=${cat.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-[#6B5A4B] hover:text-[#760159] hover:bg-[#FAF4EA] transition-colors"
                    title="Preview on Live Storefront"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg text-[#6B5A4B] hover:text-[#760159] hover:bg-[#FAF4EA] transition-colors"
                    title="Edit Collection Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(cat._id)}
                    className="p-1.5 rounded-lg text-[#6B5A4B] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="bg-white border border-[#E8DCC9] rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF4EA] border-b border-[#E8DCC9] text-[11px] font-bold uppercase tracking-wider text-[#5C3D1E]">
                  <th className="py-3.5 px-4">Collection</th>
                  <th className="py-3.5 px-4">Slug Route</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Description Overview</th>
                  <th className="py-3.5 px-4 text-center">Storefront Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2EAE0] text-xs">
                {filteredCategories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-[#FAF8F5] transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#FAF4EA] border border-[#E8DCC9] overflow-hidden shrink-0 relative">
                          {cat.image ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                          ) : (
                            <FolderTree className="w-5 h-5 text-[#8C7E72] m-auto mt-3.5" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#1E0A10] font-serif text-sm group-hover:text-[#760159] transition-colors">
                            {cat.name}
                          </p>
                          <span className="text-[10px] text-[#8C7E72] font-mono">
                            ID: {(cat._id || '').slice(-6)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#760159]">
                      /{cat.slug}
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell text-[#5C3D1E] max-w-xs">
                      <p className="line-clamp-2">{cleanDescription(cat.description)}</p>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(cat)}
                        disabled={isTogglingStatusId === cat._id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all shadow-xs cursor-pointer ${
                          cat.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                            : 'bg-zinc-100 text-zinc-600 border border-zinc-300 hover:bg-zinc-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            cat.isActive !== false ? 'bg-emerald-600' : 'bg-zinc-500'
                          }`}
                        />
                        <span>{cat.isActive !== false ? 'Active' : 'Hidden'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`https://nalmarafashion.vercel.app/shop?category=${cat.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-[#6B5A4B] hover:text-[#760159] hover:bg-[#FAF4EA] transition-colors"
                          title="Open live category page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 rounded-lg text-[#6B5A4B] hover:text-[#760159] hover:bg-[#FAF4EA] transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(cat._id)}
                          className="p-1.5 rounded-lg text-[#6B5A4B] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. CREATE / EDIT LUXURY MODAL                             */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#16030F]/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-b from-[#FFFDF9] via-[#FAF4EA] to-[#F5ECE0] border-2 border-[#D4AF37]/60 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-[0_24px_64px_rgba(45,6,30,0.35)] relative my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E8DCC9] pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#760159] font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {editingCategory ? 'Modify Existing Collection' : 'Catalog Taxonomy Registry'}
                </div>
                <h2 className="text-xl font-bold text-[#1E0A10] font-serif">
                  {editingCategory ? `Edit: ${editingCategory.name}` : 'Create New Category'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-[#8C7E72] hover:text-[#1E0A10] hover:bg-[#E8DCC9]/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E0A10] mb-1.5">
                  Collection Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarees, Lehengas, Kidswear, Anarkali Sets"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-white border border-[#E8DCC9] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 rounded-xl px-4 py-2.5 text-xs text-[#1E0A10] font-semibold transition-all"
                />
              </div>

              {/* URL Slug */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E0A10]">
                    Storefront URL Slug
                  </label>
                  <span className="text-[10px] font-mono text-[#8C7E72]">
                    /shop?category={slug || '...'}
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="auto-generated-slug"
                  value={slug}
                  onChange={(e) => {
                    setIsSlugManuallyEdited(true);
                    setSlug(e.target.value);
                  }}
                  className="w-full bg-white border border-[#E8DCC9] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 rounded-xl px-4 py-2.5 text-xs font-mono text-[#760159] transition-all"
                />
              </div>

              {/* Cover Image Upload Component */}
              <div className="space-y-1.5">
                <SingleImageUpload
                  value={image}
                  onChange={setImage}
                  label="Collection Cover Image"
                  helperText="Upload category card or banner photography (JPG, PNG, WebP up to 10MB)"
                />
              </div>

              {/* Category Description */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E0A10] mb-1.5">
                  Collection Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Opulent silk handloom sarees, bespoke blouses, and evening drapes designed with pure zari..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-[#E8DCC9] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 rounded-xl p-3.5 text-xs text-[#1E0A10] leading-relaxed transition-all"
                />
              </div>

              {/* Storefront Active Toggle */}
              <label className="flex items-center justify-between p-4 bg-white border border-[#E8DCC9] rounded-2xl cursor-pointer hover:border-[#D4AF37] transition-colors">
                <div>
                  <p className="text-xs font-bold text-[#1E0A10]">Active in Storefront Catalog</p>
                  <p className="text-[11px] text-[#5C3D1E] mt-0.5">
                    When active, customers can browse and filter products under this collection.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 rounded accent-[#760159] cursor-pointer"
                />
              </label>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8DCC9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#5C3D1E] hover:text-[#1E0A10] hover:bg-[#FAF4EA] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#760159] via-[#54013F] to-[#380725] hover:brightness-110 text-[#FFE59E] border border-[#D4AF37] font-bold text-xs tracking-wider uppercase transition-all shadow-[0_6px_20px_rgba(118,1,89,0.25)] active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. DELETE CONFIRMATION DIALOG                             */}
      {/* ========================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-[#16030F]/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border-2 border-rose-200 rounded-3xl p-6 sm:p-7 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0 border border-rose-200">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#1E0A10] text-sm">Delete Category?</h3>
                <p className="text-[11px] text-rose-600 font-medium">Irreversible Catalog Action</p>
              </div>
            </div>
            <p className="text-xs text-[#5C3D1E] leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-[#1E0A10]">
                &quot;{activeCategoryForDeletion?.name || 'this category'}&quot;
              </strong>
              ? Any associated products may need to be reassigned to another collection.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F2EAE0]">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#6B5A4B] hover:text-[#1E0A10] hover:bg-[#FAF4EA] transition-colors"
              >
                Keep Category
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-md active:scale-95"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
