'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Category } from '../../types';
import { toast } from 'sonner';
import { SingleImageUpload } from '@/components/ui/ImageUpload';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isActive, setIsActive] = useState(true);

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
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImage(cat.image || '');
    setIsActive(cat.isActive ?? true);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
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
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: description.trim(),
        image: image.trim(),
        isActive,
      };

      if (editingCategory) {
        const res = await api.put(`/categories/${editingCategory._id}`, payload);
        if (res.data?.success) {
          toast.success('Category updated successfully');
          setIsModalOpen(false);
          fetchCategories();
        }
      } else {
        const res = await api.post('/categories', payload);
        if (res.data?.success) {
          toast.success('Category created successfully');
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

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#18140B] flex items-center gap-3">
            Taxonomy & Categories
            <span className="text-xs font-mono font-normal bg-[#F5EFEB] text-[#18140B] border border-[#EAE1D1] text-[#3D342B] px-2 py-0.5 rounded-full">
              {categories.length} Collections
            </span>
          </h1>
          <p className="text-xs text-[#6B6055] mt-1">
            Organize the storefront navigation, catalog hierarchy, and collection cover banners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCategories}
            className="p-2.5 rounded-xl border border-[#EAE1D1] hover:border-[#EAE1D1] bg-white text-[#6B6055] hover:text-[#18140B] transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:brightness-105 text-[#18140B] shadow-sm font-bold text-xs tracking-wide transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#EAE1D1] p-4 rounded-2xl">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#8C7E72] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search categories by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#EAE1D1] text-[#2D2319] text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#B8860B]/50 transition-colors"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[#8C7E72] text-xs bg-white border border-[#EAE1D1] rounded-2xl">
            {isLoading ? 'Loading categories...' : 'No categories found.'}
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white border border-[#EAE1D1] rounded-2xl overflow-hidden hover:border-[#EAE1D1] transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Cover Image */}
                <div className="h-36 relative bg-[#FAF8F5] overflow-hidden">
                  {cat.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#8C7E72]">
                      <FolderTree className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#18140B]/70 via-[#18140B]/20 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium backdrop-blur-md ${
                        cat.isActive
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/50'
                          : 'bg-white text-[#8C7E72] border border-[#EAE1D1]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          cat.isActive ? 'bg-emerald-400' : 'bg-zinc-500'
                        }`}
                      />
                      {cat.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-bold text-[#18140B] text-base leading-tight drop-shadow-sm">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] font-mono text-[#6B6055] mt-0.5">/{cat.slug}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="p-4">
                  <p className="text-xs text-[#6B6055] line-clamp-2 leading-relaxed">
                    {cat.description || 'No descriptive overview provided for this category.'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 pt-0 border-t border-[#EAE1D1] flex items-center justify-between mt-2">
                <span className="text-[10px] text-[#8C7E72] font-mono">ID: {cat._id.slice(-6)}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg text-[#6B6055] hover:text-[#B8860B] hover:bg-[#F5EFEB] transition-colors"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(cat._id)}
                    className="p-1.5 rounded-lg text-[#6B6055] hover:text-rose-400 hover:bg-rose-50 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EAE1D1] rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-bold text-[#18140B] text-sm">Delete Category?</h3>
            </div>
            <p className="text-xs text-[#6B6055] leading-relaxed">
              Are you sure you want to delete this category? Associated products may need to be reassigned.
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EAE1D1] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EAE1D1] pb-3">
              <h2 className="text-base font-bold text-[#18140B]">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h2>
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
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Leather Goods, Timepieces"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EAE1D1] rounded-xl px-3.5 py-2.5 text-xs text-[#18140B] focus:outline-none focus:border-[#B8860B]/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B6055] mb-1.5">
                  URL Slug
                </label>
                <input
                  type="text"
                  placeholder="auto-generated-from-name"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EAE1D1] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#18140B] focus:outline-none focus:border-[#B8860B]/50"
                />
              </div>

              {/* Cover Image Upload */}
              <SingleImageUpload
                value={image}
                onChange={setImage}
                label="Category Cover Image"
                helperText="Upload category banner or card photo (JPG, PNG, WebP up to 10MB)"
              />

              <div>
                <label className="block text-[11px] font-semibold text-[#6B6055] mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description for category banner..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EAE1D1] rounded-xl p-3 text-xs text-[#18140B] focus:outline-none focus:border-[#B8860B]/50 leading-relaxed"
                />
              </div>

              <label className="flex items-center gap-2.5 bg-[#FAF8F5] border border-[#EAE1D1] p-3 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded accent-[#B8860B] w-4 h-4"
                />
                <span className="text-xs font-semibold text-[#18140B]">Active in Storefront</span>
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
                  {isSubmitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
